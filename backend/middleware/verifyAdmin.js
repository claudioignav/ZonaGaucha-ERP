const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (req.user.rol !== 'Administrador') {
    return res.status(403).json({ error: 'No autorizado. Solo administradores.' });
  }

  next();
};

module.exports = verifyAdmin;
