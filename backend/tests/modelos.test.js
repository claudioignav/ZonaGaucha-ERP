const modelos = require('../models');

describe('modelos', () => {
  test('cada modelo apunta a su tabla del script sql', () => {
    expect(modelos.sequelize.getDialect()).toBe('mssql');
    expect(modelos.Usuario.getTableName()).toBe('usuario');
    expect(modelos.CategoriaProducto.getTableName()).toBe('categoria_producto');
    expect(modelos.PlataformaTipoPago.getTableName()).toBe('plataforma_tipo_pago');
    expect(modelos.DetalleVenta.getTableName()).toBe('detalle_venta');
  });

  test('los atributos en camelCase se guardan en snake_case', () => {
    expect(modelos.Usuario.rawAttributes.contrasenaHash.field).toBe('contrasena_hash');
    expect(modelos.Compra.rawAttributes.compraNeta.field).toBe('compra_neta');
  });

  test('las tablas intermedias tienen llave compuesta', () => {
    expect(modelos.DetalleLote.primaryKeyAttributes).toEqual(['idLote', 'idProducto']);
    expect(modelos.DetalleVenta.primaryKeyAttributes).toEqual(['idVenta', 'idLote', 'idProducto']);
  });

  test('las relaciones principales estan definidas', () => {
    expect(modelos.Usuario.associations.rol.target).toBe(modelos.Rol);
    expect(modelos.Plataforma.associations.tiposPago.target).toBe(modelos.TipoPago);
    expect(modelos.Compra.associations.lote.associationType).toBe('HasOne');
    expect(modelos.Venta.associations.detalles.target).toBe(modelos.DetalleVenta);
  });
});
