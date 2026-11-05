const { Proveedor, TipoPago, TipoContenido, Producto, Plataforma, Lote } = require('../models');

const nombres = async (modelo, campo = 'nombre') =>
  (await modelo.findAll({ order: [[campo, 'ASC']] })).map((registro) => registro[campo]);

const compras = async (req, res) =>
  res.json({
    proveedores: await nombres(Proveedor, 'razonSocial'),
    tiposPago: await nombres(TipoPago),
    tiposContenido: await nombres(TipoContenido),
    productos: await nombres(Producto),
  });

// el precio de catálogo solo sirve de valor inicial en el formulario, la venta guarda el precio que se usó.
const preciosProductos = async () =>
  (await Producto.findAll({ order: [['nombre', 'ASC']] })).map((producto) => ({
    nombre: producto.nombre,
    precioVenta: producto.precioVenta === null || producto.precioVenta === undefined
      ? null
      : Number(producto.precioVenta),
  }));

const ventas = async (req, res) =>
  res.json({
    plataformas: await nombres(Plataforma),
    tiposPago: await nombres(TipoPago),
    lotes: (await nombres(Lote, 'numeroLote')).map(String),
    productos: await nombres(Producto),
    preciosProductos: await preciosProductos(),
  });

module.exports = { compras, ventas };
