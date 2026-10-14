const { sequelize, Usuario, Rol } = require('../models');

test('prepara modelos SQL Server y sus relaciones sin abrir una conexion', () => {
  expect(sequelize.getDialect()).toBe('mssql');
  expect(Usuario.getTableName()).toBe('usuario');
  expect(Rol.getTableName()).toBe('rol');
  expect(Usuario.associations.rol.target).toBe(Rol);
  expect(sequelize.options.dialectOptions.options).toMatchObject({
    encrypt: true, trustServerCertificate: false,
  });
});
