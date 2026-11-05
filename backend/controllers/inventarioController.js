const { Lote, Compra, Proveedor, TipoContenido, DetalleLote } = require('../models');
const { fechaHoy, sumar } = require('../utils/consultas');

const totalLote = (detalles, campo) => detalles.reduce((total, d) => total + Number(d[campo]), 0);

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
  };
};

const listarLotes = async (req, res) => {
  const lotes = await Lote.findAll({
    include: [
      { model: Compra, as: 'compra', include: [{ model: Proveedor, as: 'proveedor' }] },
      { model: TipoContenido, as: 'tipoContenido' },
      { model: DetalleLote, as: 'detalles' },
    ],
    order: [['numeroLote', 'DESC']],
  });

  res.json(lotes.map(formatearLote));
};

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
