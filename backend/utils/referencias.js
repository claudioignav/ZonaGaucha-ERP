const { Producto } = require('../models');
const { ErrorHttp } = require('./errores');

const resolverReferencias = async (body, referencias) => {
  for (const [campo, modelo, columna, id] of referencias) {
    if (body[campo] !== undefined) {
      const valor = columna === 'numeroLote' ? Number(body[campo]) : body[campo];
      const registro = await modelo.findOne({ where: { [columna]: valor } });
      if (!registro) throw new ErrorHttp(400, 'No existe ' + campo);

      body[id] = registro[id];
    }
  }
};

const resolverProductos = async (productos) => {
  if (!Array.isArray(productos)) return;

  for (const item of productos) {
    if (item.producto !== undefined) {
      const producto = await Producto.findOne({ where: { nombre: item.producto } });
      if (!producto) throw new ErrorHttp(400, 'El producto no existe');

      item.idProducto = producto.idProducto;
    }
  }
};

module.exports = { resolverReferencias, resolverProductos };
