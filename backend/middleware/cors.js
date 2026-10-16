const cors = require('cors');
const { validarSeguridad } = require('../config/seguridad');

module.exports = cors({
  origin: validarSeguridad(process.env),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
