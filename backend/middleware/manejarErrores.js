const { UniqueConstraintError, ForeignKeyConstraintError, ValidationError } = require('sequelize');

const manejarErrores = (err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(409).json({ error: 'No se puede eliminar: el registro está en uso' });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
  }

  console.error('error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
};

const rutaNoEncontrada = (req, res) => {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
};

module.exports = { manejarErrores, rutaNoEncontrada };
