const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Lote',
    {
      idLote: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      idCompra: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      idTipoContenido: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      numeroLote: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: 'lote',
    },
  );
};
