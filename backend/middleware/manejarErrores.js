const manejarErrores = (error, req, res, next) => {
  res
    .status(error.status || 500)
    .json({ error: error.status ? error.message : 'Error interno del servidor' });
};

const rutaNoEncontrada = (req, res) => res.status(404).json({ error: 'Ruta no encontrada' });

module.exports = { manejarErrores, rutaNoEncontrada };
