const {
  Lote,
  Compra,
  Proveedor,
  TipoContenido,
  DetalleLote,
  Producto,
  CategoriaProducto,
} = require('../models');
const { fechaHoy, sumar } = require('../utils/consultas');
const { deCentavos, subtotalCentavos } = require('../utils/dinero');

const totalLote = (detalles, campo) => detalles.reduce((total, d) => total + Number(d[campo]), 0);

const formatearProducto = (detalle) => {
  const precioUnitario =
    detalle.precioCompraUnitario === null || detalle.precioCompraUnitario === undefined
      ? null
      : Number(detalle.precioCompraUnitario);

  return {
    id: detalle.producto?.idProducto ?? detalle.idProducto,
    nombre: detalle.producto?.nombre,
    categoria: detalle.producto?.categoria?.nombre ?? null,
    unidadesDisponibles: Number(detalle.cantidadDisponible),
    unidadesIngresadas: Number(detalle.cantidadIngresada),
    precioTotal:
      precioUnitario === null
        ? null
        : deCentavos(subtotalCentavos(detalle.cantidadIngresada, precioUnitario)),
  };
};

const formatearLote = (lote) => {
  const detalles = lote.detalles || [];

  return {
    numero: lote.numeroLote,
    proveedor: lote.compra?.proveedor?.razonSocial,
    tipoContenido: lote.tipoContenido?.nombre,
    facturaAsociada: lote.compra?.numeroFactura,
    unidadesDisponibles: totalLote(detalles, 'cantidadDisponible'),
    unidadesTotales: totalLote(detalles, 'cantidadIngresada'),
    fechaCreacion:
      lote.compra?.fechaCompra instanceof Date
        ? lote.compra.fechaCompra.toISOString().slice(0, 10)
        : String(lote.compra?.fechaCompra || '').slice(0, 10),
    productos: detalles.map(formatearProducto),
  };
};

// lotes con su compra, proveedor y productos disponibles
const listarLotes = async (req, res) => {
  const lotes = await Lote.findAll({
    include: [
      { model: Compra, as: 'compra', include: [{ model: Proveedor, as: 'proveedor' }] },
      { model: TipoContenido, as: 'tipoContenido' },
      {
        model: DetalleLote,
        as: 'detalles',
        include: [
          {
            model: Producto,
            as: 'producto',
            include: [{ model: CategoriaProducto, as: 'categoria' }],
          },
        ],
      },
    ],
    order: [['numeroLote', 'DESC']],
  });

  res.json(lotes.map(formatearLote));
};

// porcentaje vendido segun las unidades ingresadas y las disponibles
const resumen = async (req, res) => {
  const ingresadas = await sumar(DetalleLote, 'cantidadIngresada');
  const disponibles = await sumar(DetalleLote, 'cantidadDisponible');

  res.json({
    fechaActual: fechaHoy(),
    promedioVenta: ingresadas ? Math.round(((ingresadas - disponibles) * 100) / ingresadas) : 0,
    productosDisponibles: disponibles,
  });
};

module.exports = { listarLotes, resumen };
