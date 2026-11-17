const { Op } = require('sequelize');
const { ErrorHttp } = require('./errores');
const { filtroFechas } = require('./consultas');

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

const esFechaValida = (valor) =>
  typeof valor === 'string' && FORMATO_FECHA.test(valor) && !Number.isNaN(Date.parse(valor));

const validarFechas = (fechas) => {
  if (fechas.some((valor) => valor && !esFechaValida(valor)))
    throw new ErrorHttp(400, 'Fecha de filtro no valida');
};

const filtroTexto = (valor) => {
  if (typeof valor !== 'string') throw new ErrorHttp(400, 'Filtro no valido');

  return { [Op.like]: `%${valor.trim()}%` };
};

const filtrar = (query, campoFecha, campos) => {
  const fecha = query[campoFecha];
  const { desde, hasta } = query;
  validarFechas([fecha, desde, hasta]);

  // las fechas llegan como aaaa-mm-dd, así que compararlas como texto respeta el orden
  if (desde && hasta && desde > hasta)
    throw new ErrorHttp(400, 'La fecha desde no puede ser posterior a la fecha hasta');

  const where = filtroFechas(campoFecha, fecha || desde, fecha || hasta);
  for (const [campo, columna] of Object.entries(campos)) {
    if (query[campo]) where[columna] = filtroTexto(query[campo]);
  }

  return where;
};

module.exports = { filtrar };
