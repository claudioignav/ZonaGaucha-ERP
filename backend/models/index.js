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
const Usuario = require('./usuario')(sequelize);

Rol.hasMany(Usuario, { foreignKey: 'idRol' });

Usuario.belongsTo(Rol, { foreignKey: 'idRol', as: 'rol' });

module.exports = { sequelize, Rol, Usuario };
