const { tienePermiso } = require('../utils/permisos');

module.exports = (permiso) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  if (!tienePermiso(req.user.rol, permiso))
    return res.status(403).json({ error: 'Tu perfil no tiene permiso para esta acción' });
  next();
};
