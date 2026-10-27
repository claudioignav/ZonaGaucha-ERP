const { Sequelize } = require('sequelize');
const { configurarBase } = require('../config/entorno');

const configuracion = configurarBase(process.env);
const sequelize = new Sequelize(
  configuracion.database,
  configuracion.username,
  configuracion.password,
  configuracion.options,
);

const definirCatalogo = require('./catalogo');

const Rol = definirCatalogo(sequelize, 'Rol', 'rol', 'idRol', 30);
const TipoPago = definirCatalogo(sequelize, 'TipoPago', 'tipo_pago', 'idTipoPago', 50);
const Plataforma = definirCatalogo(sequelize, 'Plataforma', 'plataforma', 'idPlataforma', 50);
const TipoContenido = definirCatalogo(
  sequelize,
  'TipoContenido',
  'tipo_contenido',
  'idTipoContenido',
  60,
);
const Usuario = require('./usuario')(sequelize);
const CategoriaProducto = require('./categoriaProducto')(sequelize);
const Producto = require('./producto')(sequelize);
const Proveedor = require('./proveedor')(sequelize);
const PlataformaTipoPago = require('./plataformaTipoPago')(sequelize);
const Compra = require('./compra')(sequelize);
const Lote = require('./lote')(sequelize);
const DetalleLote = require('./detalleLote')(sequelize);

Rol.hasMany(Usuario, { foreignKey: 'idRol' });

Usuario.belongsTo(Rol, { foreignKey: 'idRol', as: 'rol' });

CategoriaProducto.hasMany(Producto, { foreignKey: 'idCategoria' });

Producto.belongsTo(CategoriaProducto, { foreignKey: 'idCategoria', as: 'categoria' });

Plataforma.belongsToMany(TipoPago, {
  through: PlataformaTipoPago,
  foreignKey: 'idPlataforma',
  otherKey: 'idTipoPago',
  as: 'tiposPago',
});

TipoPago.belongsToMany(Plataforma, {
  through: PlataformaTipoPago,
  foreignKey: 'idTipoPago',
  otherKey: 'idPlataforma',
  as: 'plataformas',
});

Compra.belongsTo(Proveedor, { foreignKey: 'idProveedor', as: 'proveedor' });

Compra.belongsTo(TipoPago, { foreignKey: 'idTipoPago', as: 'tipoPago' });

Compra.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'usuario' });

Compra.hasOne(Lote, { foreignKey: 'idCompra', as: 'lote' });

Lote.belongsTo(Compra, { foreignKey: 'idCompra', as: 'compra' });

Lote.belongsTo(TipoContenido, { foreignKey: 'idTipoContenido', as: 'tipoContenido' });

Lote.hasMany(DetalleLote, { foreignKey: 'idLote', as: 'detalles' });

DetalleLote.belongsTo(Producto, { foreignKey: 'idProducto', as: 'producto' });

module.exports = {
  sequelize,
  Rol,
  Usuario,
  TipoPago,
  Plataforma,
  TipoContenido,
  CategoriaProducto,
  Producto,
  Proveedor,
  PlataformaTipoPago,
  Compra,
  Lote,
  DetalleLote,
};
