const { sequelize, Usuario, Rol } = require('../models');

test('define roles y usuarios sin conectarse a una base', () => {
  expect(sequelize.getDialect()).toBe('mssql');
  expect(Usuario.rawAttributes.contrasenaHash.field).toBe('contrasena_hash');
  expect(Usuario.associations.rol.target).toBe(Rol);
});
