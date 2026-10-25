const { CategoriaProducto, TipoPago } = require('../models');
const { ErrorHttp } = require('../utils/errores');

const resolverCatalogo = async (req, res, next) => {
  if (!['POST', 'PUT'].includes(req.method)) return next();

  if (req.path.startsWith('/productos') && req.body.categoria !== undefined) {
    const categoria = await CategoriaProducto.findOne({ where: { nombre: req.body.categoria } });
    if (!categoria) throw new ErrorHttp(400, 'La categoria no existe');

    req.body.idCategoria = categoria.idCategoria;
  }

  if (req.path.startsWith('/plataformas') && req.body.tiposPago !== undefined) {
    if (!Array.isArray(req.body.tiposPago) || !req.body.tiposPago.length)
      throw new ErrorHttp(400, 'Selecciona al menos un tipo de pago');

    req.body.idsTiposPago = [];
    for (const nombre of req.body.tiposPago) {
      const pago = await TipoPago.findOne({ where: { nombre } });
      if (!pago) throw new ErrorHttp(400, 'El tipo de pago no existe');

      req.body.idsTiposPago.push(pago.idTipoPago);
    }
  }

  next();
};

module.exports = resolverCatalogo;
