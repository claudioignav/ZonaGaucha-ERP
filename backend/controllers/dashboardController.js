const { fn, col, Op } = require('sequelize');
const {
  Venta,
  Compra,
  Producto,
  Usuario,
  Proveedor,
  CategoriaProducto,
  Plataforma,
} = require('../models');
const { sumar } = require('../utils/consultas');

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const armarVentasPorMes = (filas) =>
  MESES.map((mes, i) => {
    const fila = filas.find((f) => Number(f.mes) === i + 1);

    return { mes, cantidad: fila ? Number(fila.cantidad) : 0 };
  });

const armarSerieMensual = (filas, campo) =>
  MESES.map((_, i) => {
    const fila = filas.find((f) => Number(f.mes) === i + 1);

    return fila ? Math.round(Number(fila[campo]) * 100) / 100 : 0;
  });

const armarVentasPorPlataforma = (filas) => {
  const total = filas.reduce((suma, f) => suma + Number(f.cantidad), 0);
  if (total === 0) return [];

  return filas.map((f) => ({
    plataforma: f['plataforma.nombre'],
    porcentaje: Math.round((Number(f.cantidad) * 100) / total),
  }));
};

// variación porcentual del mes actual frente al anterior, sin base positiva no hay comparación.
const calcularVariacion = (serie, indiceMes) => {
  const anterior = serie[indiceMes - 1];
  if (indiceMes < 1 || !(anterior > 0)) return null;

  return Math.round(((serie[indiceMes] - anterior) / anterior) * 1000) / 10;
};

const sumaPorMes = (modelo, campoFecha, campoMonto, where) =>
  modelo.findAll({
    attributes: [
      [fn('MONTH', col(campoFecha)), 'mes'],
      [fn('SUM', col(campoMonto)), 'monto'],
    ],
    where,
    group: [fn('MONTH', col(campoFecha))],
    raw: true,
  });

const resumen = async (req, res) => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const indiceMes = hoy.getMonth();
  const inicioMes = new Date(anio, indiceMes, 1);
  const delAnio = (campo) => ({
    [campo]: { [Op.between]: [new Date(anio, 0, 1), new Date(anio, 11, 31, 23, 59, 59)] },
  });

  const totalVendido = await sumar(Venta, 'valorNeto');
  const totalComprado = await sumar(Compra, 'compraNeta');

  const porMes = await Venta.findAll({
    attributes: [
      [fn('MONTH', col('fecha_venta')), 'mes'],
      [fn('COUNT', col('id_venta')), 'cantidad'],
    ],
    where: delAnio('fechaVenta'),
    group: [fn('MONTH', col('fecha_venta'))],
    raw: true,
  });

  const porPlataforma = await Venta.findAll({
    attributes: [[fn('COUNT', col('id_venta')), 'cantidad']],
    include: [{ model: Plataforma, as: 'plataforma', attributes: ['nombre'] }],
    where: delAnio('fechaVenta'),
    group: ['plataforma.id_plataforma', 'plataforma.nombre'],
    raw: true,
  });

  const ventasMensuales = armarSerieMensual(
    await sumaPorMes(Venta, 'fecha_venta', 'valor_neto', delAnio('fechaVenta')),
    'monto',
  );
  const comprasMensuales = armarSerieMensual(
    await sumaPorMes(Compra, 'fecha_compra', 'compra_neta', delAnio('fechaCompra')),
    'monto',
  );
  const utilidadesMensuales = ventasMensuales.map((venta, i) =>
    Math.round((venta - comprasMensuales[i]) * 100) / 100,
  );

  res.json({
    totalVendido,
    totalComprado,
    utilidades: totalVendido - totalComprado,
    productos: await Producto.count(),
    productosNuevosMes: await Producto.count({ where: { fechaCreacion: { [Op.gte]: inicioMes } } }),
    cuentas: await Usuario.count({ where: { activo: true } }),
    proveedores: await Proveedor.count(),
    categorias: await CategoriaProducto.count(),
    categoriasNuevasMes: await CategoriaProducto.count({
      where: { fechaCreacion: { [Op.gte]: inicioMes } },
    }),
    ventasPorMes: armarVentasPorMes(porMes),
    ventasPorPlataforma: armarVentasPorPlataforma(porPlataforma),
    tendencias: {
      totalVendido: ventasMensuales,
      totalComprado: comprasMensuales,
      utilidades: utilidadesMensuales,
    },
    variaciones: {
      totalVendido: calcularVariacion(ventasMensuales, indiceMes),
      totalComprado: calcularVariacion(comprasMensuales, indiceMes),
      utilidades: calcularVariacion(utilidadesMensuales, indiceMes),
    },
  });
};

module.exports = { resumen, armarSerieMensual, calcularVariacion };
