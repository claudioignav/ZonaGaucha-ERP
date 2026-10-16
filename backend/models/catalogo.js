const { DataTypes } = require('sequelize');

module.exports = (sequelize, nombreModelo, tabla, campoId, largoNombre) => {
  return sequelize.define(
    nombreModelo,
    {
      [campoId]: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(largoNombre),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: tabla,
    },
  );
};
