const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Compra',
    {
      idCompra: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      idProveedor: { type: DataTypes.INTEGER, allowNull: false },
      idTipoPago: { type: DataTypes.INTEGER, allowNull: false },
      idUsuario: { type: DataTypes.INTEGER, allowNull: false },
      numeroFactura: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      fechaCompra: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      compraBruta: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
      },
      impuesto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      compraNeta: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'compra',
    },
  );
};
