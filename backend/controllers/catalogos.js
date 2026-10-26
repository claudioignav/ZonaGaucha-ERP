const {
  Producto,
  CategoriaProducto,
  Proveedor,
  TipoPago,
  Plataforma,
  TipoContenido,
} = require('../models');
const crearControladorCatalogo = require('./catalogoController');
const { ErrorHttp } = require('../utils/errores');
const { normalizarRut } = require('../utils/rut');
const { esImporteValido } = require('../utils/dinero');

const categorias = crearControladorCatalogo({
  modelo: CategoriaProducto,
  campoId: 'idCategoria',
  campos: ['nombre'],
});

const productos = crearControladorCatalogo({
  modelo: Producto,
  campoId: 'idProducto',
  campos: ['nombre', 'idCategoria', 'precioVenta'],
  requeridos: ['nombre', 'idCategoria'],
  include: [{ model: CategoriaProducto, as: 'categoria' }],
  formatear: (registro, salida) => ({
    ...salida,
    categoria: registro.categoria?.nombre,
    precioVenta: registro.precioVenta === null ? null : Number(registro.precioVenta),
  }),
  antesDeGuardar: (datos) => {
    if (datos.precioVenta === undefined) return datos;

    if (datos.precioVenta === null || datos.precioVenta === '') return { ...datos, precioVenta: null };

    if (!esImporteValido(datos.precioVenta))
      throw new ErrorHttp(400, 'El precio de venta debe ser un monto con hasta dos decimales');

    return { ...datos, precioVenta: Number(datos.precioVenta) };
  },
});

const proveedores = crearControladorCatalogo({
  modelo: Proveedor,
  campoId: 'idProveedor',
  campos: ['razonSocial', 'rut', 'telefono', 'correo'],
  requeridos: ['razonSocial', 'rut'],
  antesDeGuardar: (datos) => {
    if (datos.rut === undefined) return datos;

    const rut = normalizarRut(datos.rut);
    if (!rut) throw new ErrorHttp(400, 'El RUT no es válido');

    return { ...datos, rut };
  },
});

const tiposPago = crearControladorCatalogo({
  modelo: TipoPago,
  campoId: 'idTipoPago',
  campos: ['nombre'],
});

const plataformas = crearControladorCatalogo({
  modelo: Plataforma,
  campoId: 'idPlataforma',
  campos: ['nombre'],
  include: [{ model: TipoPago, as: 'tiposPago' }],
  formatear: (registro, salida) => ({
    ...salida,
    tiposPago: (registro.tiposPago || []).map((tipo) => tipo.nombre),
  }),
  despuesDeGuardar: async (registro, body) => {
    if (Array.isArray(body.idsTiposPago)) await registro.setTiposPago(body.idsTiposPago);
  },
});

const tiposContenido = crearControladorCatalogo({
  modelo: TipoContenido,
  campoId: 'idTipoContenido',
  campos: ['nombre'],
});

module.exports = { categorias, productos, proveedores, tiposPago, plataformas, tiposContenido };
