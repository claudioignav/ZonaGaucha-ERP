const { validarJWT } = require('../config/jwt');

test('exige una clave JWT y una duracion valida', () => {
  expect(() => validarJWT({ JWT_SECRET: 'corta' })).toThrow('32');
  expect(() => validarJWT({ ...process.env, JWT_EXPIRA: 'invalida' })).toThrow();
  expect(() => validarJWT(process.env)).not.toThrow();
});
