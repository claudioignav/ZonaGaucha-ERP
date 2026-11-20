const { sequelize } = require('../models');

const estado = (req, res) => res.json({ mensaje: 'api del erp zonagaucha funcionando' });

// el pipeline la usa para comprobar la version desplegada y la conexion a sql
const estadoDespliegue = async (req, res) => {
  const sha = req.app.locals.versionDespliegue;
  res.set('Cache-Control', 'no-store');
  try {
    await sequelize.authenticate();
    return res.json({ sha, sql: true });
  } catch {
    return res.status(503).json({ sha, sql: false });
  }
};

module.exports = { estado, estadoDespliegue };
