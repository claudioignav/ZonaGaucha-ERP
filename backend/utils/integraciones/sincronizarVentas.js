const { Op, TableHints } = require('sequelize');
const {
  sequelize,
  Venta,
  DetalleVenta,
  DetalleLote,
  Plataforma,
  TipoPago,
  PlataformaTipoPago,
  Producto,
  Integracion,
} = require('../../models');
const { deCentavos, subtotalCentavos, sumarCentavos, aCentavos } = require('../dinero');
const shopify = require('./shopify');
const mercadoLibre = require('./mercadoLibre');

const DIAS_INICIALES = 30;

const FUENTES = [
  { plataforma: 'Shopify', modulo: shopify, configurada: (env) => env.SHOPIFY_TIENDA && env.SHOPIFY_CLIENT_SECRET },
  {
    plataforma: mercadoLibre.PLATAFORMA,
    modulo: mercadoLibre,
    configurada: (env) => env.MERCADOLIBRE_CLIENT_ID && env.MERCADOLIBRE_CLIENT_SECRET,
  },
];

const normalizar = (texto) => String(texto || '').trim().toLowerCase();

// compara nombres de catalogo sin importar tildes, mayusculas, espacios ni la palabra "de"
const clave = (texto) =>
  normalizar(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\bde\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buscarEnCatalogo = async (Modelo, nombre) => {
  const registros = await Modelo.findAll();
  return registros.find((r) => clave(r.nombre) === clave(nombre)) || null;
};

const lineasValidas = (productos) =>
  productos.length > 0 &&
  productos.every((p) => p.nombre && Number.isInteger(p.cantidad) && p.cantidad > 0 && p.precioUnitario > 0);

// busca el lote mas antiguo que tenga stock para todos los productos de la venta
const elegirLote = async (lineas) => {
  const disponibles = await DetalleLote.findAll({
    where: { idProducto: { [Op.in]: lineas.map((l) => l.idProducto) }, cantidadDisponible: { [Op.gt]: 0 } },
    order: [['idLote', 'ASC']],
  });
  const porLote = new Map();
  for (const detalle of disponibles) {
    if (!porLote.has(detalle.idLote)) porLote.set(detalle.idLote, new Map());
    porLote.get(detalle.idLote).set(detalle.idProducto, detalle.cantidadDisponible);
  }
  for (const [idLote, stock] of porLote) {
    if (lineas.every((l) => (stock.get(l.idProducto) || 0) >= l.cantidad)) return idLote;
  }
  return null;
};

const prepararLineas = async (productos) => {
  const encontrados = await Producto.findAll({ where: { nombre: { [Op.in]: productos.map((p) => p.nombre) } } });
  const porNombre = new Map(encontrados.map((p) => [normalizar(p.nombre), p.idProducto]));
  const lineas = productos.map((p) => ({ ...p, idProducto: porNombre.get(normalizar(p.nombre)) }));
  return lineas.every((l) => l.idProducto) ? lineas : null;
};

// guarda la venta solo si no existe y algun lote tiene stock
const guardarVenta = async (venta, idPlataforma, idUsuario) => {
  if (!lineasValidas(venta.productos)) return;
  if (await Venta.findOne({ where: { idPlataforma, idExterno: venta.idExterno } })) return;

  const tipoPago = await buscarEnCatalogo(TipoPago, venta.tipoPago);
  if (!tipoPago) return;
  if (!(await PlataformaTipoPago.findOne({ where: { idPlataforma, idTipoPago: tipoPago.idTipoPago } }))) return;

  const lineas = await prepararLineas(venta.productos);
  if (!lineas) return;
  const idLote = await elegirLote(lineas);
  if (!idLote) return;

  const bruto = sumarCentavos(lineas.map((l) => subtotalCentavos(l.cantidad, l.precioUnitario)));
  const adicional = aCentavos(venta.valorAdicional || 0);

  await sequelize.transaction(async (transaction) => {
    for (const linea of lineas) {
      const detalle = await DetalleLote.findOne({
        where: { idLote, idProducto: linea.idProducto },
        transaction,
        tableHint: TableHints.UPDLOCK,
      });
      if (!detalle || detalle.cantidadDisponible < linea.cantidad) throw new Error('sin stock');
      await detalle.decrement('cantidadDisponible', { by: linea.cantidad, transaction });
    }
    const nueva = await Venta.create(
      {
        idExterno: venta.idExterno,
        numeroDocumento: venta.numeroDocumento.slice(0, 20),
        nombreCliente: venta.nombreCliente.slice(0, 120),
        fechaVenta: venta.fechaVenta,
        idPlataforma,
        idTipoPago: tipoPago.idTipoPago,
        idUsuario,
        valorBruto: deCentavos(bruto),
        valorAdicional: deCentavos(adicional),
        valorNeto: deCentavos(bruto + adicional),
      },
      { transaction },
    );
    await DetalleVenta.bulkCreate(
      lineas.map((l) => ({
        idVenta: nueva.idVenta,
        idLote,
        idProducto: l.idProducto,
        cantidad: l.cantidad,
        precioVentaUnitario: l.precioUnitario,
      })),
      { transaction },
    );
  });
};

// cada plataforma y cada venta se aislan: si algo falla se omite en silencio y sigue con lo demas
const sincronizarFuente = async ({ plataforma, modulo, configurada }, env, idUsuario) => {
  try {
    if (!configurada(env)) return;
    const registroPlataforma = await buscarEnCatalogo(Plataforma, plataforma);
    if (!registroPlataforma) return;
    const integracion = await Integracion.findByPk(plataforma);
    const inicio = new Date();
    const desde = integracion?.ultimaSincronizacion
      ? new Date(integracion.ultimaSincronizacion)
      : new Date(inicio.getTime() - DIAS_INICIALES * 86400000);

    const ventas = await modulo.traerPedidos(env, desde);
    for (const venta of ventas) {
      await guardarVenta(venta, registroPlataforma.idPlataforma, idUsuario).catch(() => {});
    }
    await Integracion.upsert({ plataforma, ultimaSincronizacion: inicio });
  } catch {
    // la plataforma no respondio o no esta disponible, se intenta en la proxima sincronizacion
  }
};

// recorre las plataformas configuradas e importa sus ventas nuevas
const sincronizarVentas = async (env, idUsuario) => {
  for (const fuente of FUENTES) await sincronizarFuente(fuente, env, idUsuario);
};

module.exports = { sincronizarVentas, guardarVenta, elegirLote, clave };
