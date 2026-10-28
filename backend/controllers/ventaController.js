const crypto = require('crypto');
const { TableHints } = require('sequelize');
const {
  sequelize,
  Venta,
  DetalleVenta,
  DetalleLote,
  Lote,
  Plataforma,
  TipoPago,
  PlataformaTipoPago,
  Producto,
} = require('../models');
const { ErrorHttp, exigirCampos } = require('../utils/errores');
const { filtrar } = require('../utils/filtros');
const { filtroFechas, sumar, fechaHoy } = require('../utils/consultas');
const {
  aCentavos,
  deCentavos,
  subtotalCentavos,
  sumarCentavos,
  esImporteValido,
} = require('../utils/dinero');

const incluirTodo = [
  { model: Plataforma, as: 'plataforma' },
  { model: TipoPago, as: 'tipoPago' },
  {
    model: DetalleVenta,
    as: 'detalles',
    include: [
      { model: Producto, as: 'producto' },
      { model: Lote, as: 'lote' },
    ],
  },
];

const formatearDetalle = (detalle) => {
  const precioUnitario =
    detalle.precioVentaUnitario === null || detalle.precioVentaUnitario === undefined
      ? null
      : Number(detalle.precioVentaUnitario);

  return {
    producto: detalle.producto?.nombre,
    cantidad: detalle.cantidad,
    precioUnitario,
    subtotal:
      precioUnitario === null ? null : deCentavos(subtotalCentavos(detalle.cantidad, precioUnitario)),
  };
};

const formatearVenta = (venta) => {
  const detalles = venta.detalles || [];

  return {
    id: venta.idVenta,
    numeroFactura: venta.numeroDocumento,
    cliente: venta.nombreCliente,
    fechaVenta: venta.fechaVenta,
    tipoPago: venta.tipoPago?.nombre,
    plataforma: venta.plataforma?.nombre,
    lote: String(detalles[0]?.lote?.numeroLote ?? ''),
    productos: detalles.map(formatearDetalle),
    valorNeto: Number(venta.valorNeto),
    valorAdicional: Number(venta.valorAdicional),
  };
};

const validarPlataformaPago = async (idPlataforma, idTipoPago) => {
  const acepta = await PlataformaTipoPago.findOne({ where: { idPlataforma, idTipoPago } });
  if (!acepta) throw new ErrorHttp(400, 'La plataforma no acepta ese tipo de pago');
};

const validarProductos = (productos) => {
  if (
    !Array.isArray(productos) ||
    productos.length === 0 ||
    productos.some(
      (p) => !p.idProducto || !Number.isInteger(Number(p.cantidad)) || !(Number(p.cantidad) > 0),
    )
  ) {
    throw new ErrorHttp(400, 'La venta debe tener productos con cantidad mayor a 0');
  }

  if (productos.some((p) => !esImporteValido(p.precioUnitario) || !(Number(p.precioUnitario) > 0))) {
    throw new ErrorHttp(400, 'Cada producto necesita un precio unitario mayor a 0');
  }
};

const descontarStock = async (idLote, productos, transaction) => {
  for (const item of productos) {
    const detalle = await DetalleLote.findOne({
      where: { idLote, idProducto: item.idProducto },
      transaction,
      tableHint: TableHints.UPDLOCK,
    });
    if (!detalle || detalle.cantidadDisponible < item.cantidad) {
      throw new ErrorHttp(400, `Stock insuficiente para el producto ${item.idProducto} en el lote`);
    }

    await detalle.decrement('cantidadDisponible', { by: item.cantidad, transaction });
  }
};

const listar = async (req, res) => {
  const ventas = await Venta.findAll({
    where: filtrar(req.query, 'fechaVenta', {
      numeroFactura: 'numeroDocumento',
      plataforma: '$plataforma.nombre$',
      tipoPago: '$tipoPago.nombre$',
    }),
    include: incluirTodo,
    order: [['fechaVenta', 'DESC']],
  });

  res.json(ventas.map(formatearVenta));
};

const resumen = async (req, res) => {
  const where = filtroFechas('fechaVenta', req.query.desde, req.query.hasta);

  res.json({
    fechaActual: fechaHoy(),
    ventaNeta: await sumar(Venta, 'valorNeto', where),
    totalAdicional: await sumar(Venta, 'valorAdicional', where),
  });
};

const crear = async (req, res) => {
  if (!req.body.numeroDocumento)
    req.body.numeroDocumento = crypto.randomUUID().replaceAll('-', '').slice(0, 20);

  exigirCampos(req.body, [
    'numeroDocumento',
    'nombreCliente',
    'fechaVenta',
    'idPlataforma',
    'idTipoPago',
    'idLote',
  ]);

  const { productos, idLote, valorBruto, valorNeto, ...datos } = req.body;

  validarProductos(productos);

  // el bruto sale de las líneas (cantidad por precio), el neto es bruto más adicional.
  const brutoCentavos = sumarCentavos(
    productos.map((p) => subtotalCentavos(p.cantidad, p.precioUnitario)),
  );
  if (valorBruto !== undefined && aCentavos(valorBruto) !== brutoCentavos)
    throw new ErrorHttp(400, 'El valor bruto no coincide con los productos');

  const adicional = datos.valorAdicional ?? 0;
  if (!esImporteValido(adicional)) throw new ErrorHttp(400, 'El valor adicional no es válido');

  const adicionalCentavos = aCentavos(adicional);
  const netoCentavos = brutoCentavos + adicionalCentavos;
  if (valorNeto !== undefined && aCentavos(valorNeto) !== netoCentavos)
    throw new ErrorHttp(400, 'El valor neto no coincide con el bruto más el adicional');

  await validarPlataformaPago(datos.idPlataforma, datos.idTipoPago);

  const venta = await sequelize.transaction(async (transaction) => {
    await descontarStock(idLote, productos, transaction);

    const nueva = await Venta.create(
      {
        numeroDocumento: datos.numeroDocumento,
        nombreCliente: datos.nombreCliente,
        fechaVenta: datos.fechaVenta,
        idPlataforma: datos.idPlataforma,
        idTipoPago: datos.idTipoPago,
        idUsuario: req.user.id,
        valorBruto: deCentavos(brutoCentavos),
        valorAdicional: deCentavos(adicionalCentavos),
        valorNeto: deCentavos(netoCentavos),
      },
      { transaction },
    );

    await DetalleVenta.bulkCreate(
      productos.map((p) => ({
        idVenta: nueva.idVenta,
        idLote,
        idProducto: p.idProducto,
        cantidad: p.cantidad,
        precioVentaUnitario: Number(p.precioUnitario),
      })),
      { transaction },
    );

    return nueva;
  });

  res.status(201).json({
    id: venta.idVenta,
    valorBruto: deCentavos(brutoCentavos),
    valorNeto: deCentavos(netoCentavos),
  });
};

module.exports = { listar, resumen, crear };
