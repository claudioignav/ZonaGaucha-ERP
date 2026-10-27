const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'DetalleLote',
    {
      idLote: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      idProducto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      cantidadIngresada: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
      cantidadDisponible: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 },
      },
      precioCompraUnitario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: { min: 0 },
      },
    },
    {
      tableName: 'detalle_lote',
    },
  );
};
