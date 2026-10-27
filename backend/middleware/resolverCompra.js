const { Proveedor, TipoPago, TipoContenido, Producto } = require('../models');
const { resolverReferencias, resolverProductos } = require('../utils/referencias');

const resolverCompra = async (req, res, next) => {
  const referencias = [
    ['proveedor', Proveedor, 'razonSocial', 'idProveedor'],
    ['tipoPago', TipoPago, 'nombre', 'idTipoPago'],
    ['tipoContenido', TipoContenido, 'nombre', 'idTipoContenido'],
  ];

  await resolverReferencias(req.body, referencias);
  await resolverProductos(req.body.productos);
  next();
};

module.exports = resolverCompra;
