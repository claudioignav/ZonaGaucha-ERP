const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Proveedor',
    {
      idProveedor: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      razonSocial: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      rut: {
        type: DataTypes.STRING(12),
        allowNull: false,
        unique: true,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      correo: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
    },
    {
      tableName: 'proveedor',
    },
  );
};
