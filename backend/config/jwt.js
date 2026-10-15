const jwt = require('jsonwebtoken');

const validarJWT = (variables) => {
  if (!variables.JWT_SECRET || variables.JWT_SECRET.length < 32)
    throw new Error('JWT_SECRET necesita al menos 32 caracteres');

  jwt.sign({ comprobacion: true }, variables.JWT_SECRET, {
    expiresIn: variables.JWT_EXPIRA || '2h',
  });
};

module.exports = { validarJWT };
