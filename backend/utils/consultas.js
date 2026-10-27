const { Op } = require('sequelize');

const filtroFechas = (campo, desde, hasta) => {
  if (!desde && !hasta) return {};

  const rango = {};
  if (desde) rango[Op.gte] = new Date(`${desde}T00:00:00`);

  if (hasta) rango[Op.lte] = new Date(`${hasta}T23:59:59`);

  return { [campo]: rango };
};

const sumar = async (modelo, campo, where = {}) => Number(await modelo.sum(campo, { where })) || 0;

const fechaHoy = () => {
  const partes = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());

  return partes.replace(' ', 'T');
};

module.exports = { filtroFechas, sumar, fechaHoy };
