const { filtrar } = require('../utils/filtros');
const {
  sequelize,
  Compra,
  Lote,
  DetalleLote,
  Proveedor,
  TipoPago,
  TipoContenido,
  Producto,
} = require('../models');
const { ErrorHttp, exigirCampos } = require('../utils/errores');
const { filtroFechas, sumar, fechaHoy } = require('../utils/consultas');
const {
  aCentavos,
  deCentavos,
  subtotalCentavos,
  sumarCentavos,
  esImporteValido,
} = require('../utils/dinero');

const incluirTodo = [
  { model: Proveedor, as: 'proveedor' },
  { model: TipoPago, as: 'tipoPago' },
  {
    model: Lote,
    as: 'lote',
    include: [
      { model: TipoContenido, as: 'tipoContenido' },
      { model: DetalleLote, as: 'detalles', include: [{ model: Producto, as: 'producto' }] },
    ],
  },
];

const formatearDetalle = (detalle) => {
  const precioUnitario =
    detalle.precioCompraUnitario === null || detalle.precioCompraUnitario === undefined
      ? null
      : Number(detalle.precioCompraUnitario);

  return {
    producto: detalle.producto?.nombre,
    cantidad: detalle.cantidadIngresada,
    precioUnitario,
    subtotal:
      precioUnitario === null
        ? null
        : deCentavos(subtotalCentavos(detalle.cantidadIngresada, precioUnitario)),
  };
};

const formatearCompra = (compra) => ({
  id: compra.idCompra,
  numeroFactura: compra.numeroFactura,
  numeroLote: String(compra.lote?.numeroLote ?? ''),
  proveedor: compra.proveedor?.razonSocial,
  fechaCompra: compra.fechaCompra,
  tipoPago: compra.tipoPago?.nombre,
  tipoContenido: compra.lote?.tipoContenido?.nombre,
  productos: (compra.lote?.detalles || []).map(formatearDetalle),
  compraBruta: Number(compra.compraBruta),
  impuesto: Number(compra.impuesto),
  compraNeta: Number(compra.compraNeta),
});

// el porcentaje se aplica sobre la compra bruta en centavos, el monto se toma tal como viene.
const calcularImpuesto = (compraBruta, impuesto, tipoImpuesto) => {
  const valor = Number(impuesto) || 0;
  if (tipoImpuesto === 'porcentaje') return deCentavos((aCentavos(compraBruta) * valor) / 100);

  return deCentavos(aCentavos(valor));
};

const validarProductos = (productos) => {
  if (!Array.isArray(productos) || productos.length === 0) {
    throw new ErrorHttp(400, 'La compra debe tener al menos un producto');
  }

  if (
    productos.some(
      (p) => !p.idProducto || !Number.isInteger(Number(p.cantidad)) || !(Number(p.cantidad) > 0),
    )
  ) {
    throw new ErrorHttp(400, 'Cada producto necesita un id y una cantidad mayor a 0');
  }

  if (productos.some((p) => !esImporteValido(p.precioUnitario) || !(Number(p.precioUnitario) > 0))) {
    throw new ErrorHttp(400, 'Cada producto necesita un precio unitario mayor a 0');
  }
};

const listar = async (req, res) => {
  const compras = await Compra.findAll({
    where: filtrar(req.query, 'fechaCompra', {
      numeroFactura: 'numeroFactura',
      proveedor: '$proveedor.razonSocial$',
      tipoPago: '$tipoPago.nombre$',
    }),
    include: incluirTodo,
    order: [['fechaCompra', 'DESC']],
  });

  res.json(compras.map(formatearCompra));
};

const resumen = async (req, res) => {
  const where = filtroFechas('fechaCompra', req.query.desde, req.query.hasta);

  res.json({
    fechaActual: fechaHoy(),
    compraBruta: await sumar(Compra, 'compraBruta', where),
    compraNeta: await sumar(Compra, 'compraNeta', where),
    impuestosTotales: await sumar(Compra, 'impuesto', where),
  });
};

const crear = async (req, res) => {
  exigirCampos(req.body, [
    'numeroFactura',
    'numeroLote',
    'idProveedor',
    'idTipoPago',
    'idTipoContenido',
    'fechaCompra',
  ]);

  const { productos, tipoImpuesto, compraBruta, ...datos } = req.body;

  validarProductos(productos);

  // la compra bruta sale de las líneas, si el cliente envía un total, tiene que coincidir.
  const brutaCentavos = sumarCentavos(
    productos.map((p) => subtotalCentavos(p.cantidad, p.precioUnitario)),
  );
  if (compraBruta !== undefined && aCentavos(compraBruta) !== brutaCentavos)
    throw new ErrorHttp(400, 'La compra bruta no coincide con los productos');

  const impuesto = calcularImpuesto(deCentavos(brutaCentavos), datos.impuesto, tipoImpuesto);
  const impuestoCentavos = aCentavos(impuesto);
  const netaCentavos = brutaCentavos + impuestoCentavos;
  if (impuesto < 0 || !Number.isInteger(Number(datos.numeroLote)))
    throw new ErrorHttp(400, 'Monto o numero de lote no validos');

  const compra = await sequelize.transaction(async (transaction) => {
    const nueva = await Compra.create(
      {
        numeroFactura: datos.numeroFactura,
        idProveedor: datos.idProveedor,
        idTipoPago: datos.idTipoPago,
        idUsuario: req.user.id,
        fechaCompra: datos.fechaCompra,
        compraBruta: deCentavos(brutaCentavos),
        impuesto,
        compraNeta: deCentavos(netaCentavos),
      },
      { transaction },
    );

    const lote = await Lote.create(
      {
        idCompra: nueva.idCompra,
        idTipoContenido: datos.idTipoContenido,
        numeroLote: datos.numeroLote,
      },
      { transaction },
    );

    await DetalleLote.bulkCreate(
      productos.map((p) => ({
        idLote: lote.idLote,
        idProducto: p.idProducto,
        cantidadIngresada: p.cantidad,
        cantidadDisponible: p.cantidad,
        precioCompraUnitario: Number(p.precioUnitario),
      })),
      { transaction },
    );

    return nueva;
  });

  res.status(201).json({
    id: compra.idCompra,
    compraBruta: deCentavos(brutaCentavos),
    impuesto,
    compraNeta: deCentavos(netaCentavos),
  });
};

module.exports = { listar, resumen, crear, calcularImpuesto };
