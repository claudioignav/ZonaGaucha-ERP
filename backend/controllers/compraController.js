const { filtrar } = require('../utils/filtros');
const { generarPdfCompras } = require('../utils/pdfCompras');
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
const { ErrorHttp, exigirCampos, buscarOFallar } = require('../utils/errores');
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

const buscarCompras = async (query) => {
  const compras = await Compra.findAll({
    where: filtrar(query, 'fechaCompra', {
      numeroFactura: 'numeroFactura',
      proveedor: '$proveedor.razonSocial$',
      tipoPago: '$tipoPago.nombre$',
    }),
    include: incluirTodo,
    order: [['fechaCompra', 'DESC']],
  });

  return compras.map(formatearCompra);
};

const listar = async (req, res) => {
  res.json(await buscarCompras(req.query));
};

// el pdf usa los mismos filtros que el listado para que coincida con la tabla de la pantalla
const exportarPdf = async (req, res) => {
  const compras = await buscarCompras(req.query);
  const emitido = fechaHoy();
  const pdf = await generarPdfCompras({
    compras,
    filtros: req.query,
    usuario: req.user?.nombre,
    emitido,
  });

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="historial-compras-${emitido.slice(0, 10)}.pdf"`,
  });
  res.send(pdf);
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

// solo se corrigen los datos de la factura, los productos y el lote quedan como se registraron.
const validarCambiosCompra = (datos) => {
  const numeroFactura = String(datos.numeroFactura).trim();
  if (numeroFactura === '' || numeroFactura.length > 20)
    throw new ErrorHttp(400, 'El numero de factura no es valido');

  const fecha = String(datos.fechaCompra).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha)))
    throw new ErrorHttp(400, 'La fecha de compra no es valida');

  if (fecha > fechaHoy().slice(0, 10))
    throw new ErrorHttp(400, 'La fecha de compra no puede ser posterior a hoy');

  if (!['monto', 'porcentaje', undefined].includes(datos.tipoImpuesto))
    throw new ErrorHttp(400, 'El tipo de impuesto no es valido');

  const impuesto = datos.impuesto ?? 0;
  if (!esImporteValido(impuesto)) throw new ErrorHttp(400, 'El impuesto no es valido');

  return { numeroFactura, fecha, impuesto };
};

const modificar = async (req, res) => {
  exigirCampos(req.body, ['numeroFactura', 'idProveedor', 'idTipoPago', 'fechaCompra']);

  const { numeroFactura, fecha, impuesto } = validarCambiosCompra(req.body);
  const compra = await buscarOFallar(Compra, req.params.id);

  // el impuesto se vuelve a calcular sobre la compra bruta, que no cambia al modificar
  const bruta = Number(compra.compraBruta);
  const nuevoImpuesto = calcularImpuesto(bruta, impuesto, req.body.tipoImpuesto);
  const netaCentavos = aCentavos(bruta) + aCentavos(nuevoImpuesto);

  await compra.update({
    numeroFactura,
    idProveedor: req.body.idProveedor,
    idTipoPago: req.body.idTipoPago,
    fechaCompra: fecha,
    impuesto: nuevoImpuesto,
    compraNeta: deCentavos(netaCentavos),
  });

  res.json({
    id: compra.idCompra,
    compraBruta: bruta,
    impuesto: nuevoImpuesto,
    compraNeta: deCentavos(netaCentavos),
  });
};

module.exports = { listar, exportarPdf, resumen, crear, modificar, calcularImpuesto };
