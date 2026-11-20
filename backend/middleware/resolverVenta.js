const { Lote, Plataforma, TipoPago, Producto } = require('../models');
const { resolverReferencias, resolverProductos } = require('../utils/referencias');

// cambia los nombres que envia el formulario por los ids de la base
const resolverVenta = async (req, res, next) => {
  const referencias = [
    ['lote', Lote, 'numeroLote', 'idLote'],
    ['plataforma', Plataforma, 'nombre', 'idPlataforma'],
    ['tipoPago', TipoPago, 'nombre', 'idTipoPago'],
  ];

  await resolverReferencias(req.body, referencias);
  await resolverProductos(req.body.productos);
  if (req.body.cliente !== undefined) req.body.nombreCliente = req.body.cliente;

  next();
};

module.exports = resolverVenta;
