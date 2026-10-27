const { Op } = require('sequelize');
const { ErrorHttp } = require('./errores');
const { filtroFechas } = require('./consultas');

const filtrar = (query, campoFecha, campos) => {
  const fecha = query[campoFecha];
  for (const valor of [fecha, query.desde, query.hasta]) {
    if (
      valor &&
      (typeof valor !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(valor) ||
        Number.isNaN(Date.parse(valor)))
    )
      throw new ErrorHttp(400, 'Fecha de filtro no valida');
  }

  const where = filtroFechas(campoFecha, fecha || query.desde, fecha || query.hasta);
  for (const [campo, columna] of Object.entries(campos)) {
    const valor = query[campo];
    if (valor) {
      if (typeof valor !== 'string') throw new ErrorHttp(400, 'Filtro no valido');

      where[columna] = { [Op.like]: '%' + valor.trim() + '%' };
    }
  }

  return where;
};

module.exports = { filtrar };
