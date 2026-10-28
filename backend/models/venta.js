const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Venta',
    {
      idVenta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      idPlataforma: { type: DataTypes.INTEGER, allowNull: false },
      idTipoPago: { type: DataTypes.INTEGER, allowNull: false },
      idUsuario: { type: DataTypes.INTEGER, allowNull: false },
      numeroDocumento: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      nombreCliente: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      fechaVenta: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      valorBruto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
      },
      valorAdicional: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      valorNeto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'venta',
    },
  );
};
