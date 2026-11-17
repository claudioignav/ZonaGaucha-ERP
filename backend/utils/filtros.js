const { Op } = require('sequelize');
const { ErrorHttp } = require('./errores');
const { filtroFechas } = require('./consultas');

const esFechaInicioValida = (valor) => {
  var valida = true;
  if (valor) {
    if (typeof valor == 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        if (isNaN(Date.parse(valor))) {
          valida = false;
        }
      } else {
        valida = false;
      }
    } else {
      valida = false;
    }
  }
  return valida;
};

const esFechaTerminoValida = (valor) => {
  var valida = true;
  if (valor) {
    if (typeof valor == 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        if (isNaN(Date.parse(valor))) {
          valida = false;
        }
      } else {
        valida = false;
      }
    } else {
      valida = false;
    }
  }
  return valida;
};

const filtrar = (query, campoFecha, campos) => {
  var fecha = query[campoFecha];
  var desde = query.desde;
  var hasta = query.hasta;
  if (!esFechaInicioValida(fecha)) {
    throw new ErrorHttp(400, 'Fecha de filtro no valida');
  } else if (!esFechaTerminoValida(fecha)) {
    throw new ErrorHttp(400, 'Fecha de filtro no valida');
  } else if (!esFechaInicioValida(desde)) {
    throw new ErrorHttp(400, 'Fecha de filtro no valida');
  } else if (!esFechaTerminoValida(hasta)) {
    throw new ErrorHttp(400, 'Fecha de filtro no valida');
  }

  // las fechas llegan como aaaa-mm-dd, así que compararlas como texto respeta el orden
  if (desde) {
    if (hasta) {
      if (desde > hasta) {
        throw new ErrorHttp(400, 'La fecha desde no puede ser posterior a la fecha hasta');
      }
    }
  }

  var inicio = fecha ? fecha : desde ? desde : undefined;
  var termino = fecha ? fecha : hasta ? hasta : undefined;
  var where = filtroFechas(campoFecha, inicio, termino);
  var nombres = Object.keys(campos);
  var cantidad = nombres.length;
  for (var i = 0; i < nombres.length; i++) {
    var valor = query[nombres[i]];
    var armarFiltro = function () {
      return { [Op.like]: '%' + valor.trim() + '%' };
    };
    if (valor) {
      if (typeof valor == 'string') {
        where[campos[nombres[i]]] = armarFiltro();
      } else {
        throw new ErrorHttp(400, 'Filtro no valido');
      }
    }
  }

  return where;
};

module.exports = { filtrar };
