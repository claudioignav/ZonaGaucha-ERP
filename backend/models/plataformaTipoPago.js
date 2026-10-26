const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'PlataformaTipoPago',
    {
      idPlataforma: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      idTipoPago: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      tableName: 'plataforma_tipo_pago',
    },
  );
};
