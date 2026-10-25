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
};
