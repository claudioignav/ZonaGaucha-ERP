const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'DetalleVenta',
    {
      idVenta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      idLote: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      idProducto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
      precioVentaUnitario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: { min: 0 },
      },
    },
    {
      tableName: 'detalle_venta',
    },
  );
};
