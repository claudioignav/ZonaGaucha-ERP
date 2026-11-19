const { DataTypes } = require('sequelize');

// guarda por plataforma el refresh token vigente y la ultima sincronizacion de ventas
module.exports = (sequelize) =>
  sequelize.define(
    'Integracion',
    {
      plataforma: {
        type: DataTypes.STRING(30),
        primaryKey: true,
      },
      refreshToken: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      ultimaSincronizacion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    { tableName: 'integracion' },
  );
