const { Proveedor, TipoPago, TipoContenido, Producto } = require('../models');

const nombres = async (modelo, campo = 'nombre') =>
  (await modelo.findAll({ order: [[campo, 'ASC']] })).map((registro) => registro[campo]);

const compras = async (req, res) =>
  res.json({
    proveedores: await nombres(Proveedor, 'razonSocial'),
    tiposPago: await nombres(TipoPago),
    tiposContenido: await nombres(TipoContenido),
    productos: await nombres(Producto),
  });

module.exports = { compras };
