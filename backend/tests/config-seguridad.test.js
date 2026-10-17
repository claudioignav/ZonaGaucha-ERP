const { validarSeguridad } = require('../config/seguridad');

test('rechaza claves cortas origen cruzado y expiracion incorrecta', () => {
  expect(() => validarSeguridad({ JWT_SECRET: 'corta' })).toThrow('32');
  expect(() => validarSeguridad({ ...process.env, FRONT_URL: 'https://otro.cl' })).toThrow(
    'FRONT_URL',
  );
  expect(() => validarSeguridad({ ...process.env, JWT_EXPIRA: 'invalida' })).toThrow();
});

test.each([
  ['staging', 'zgerpfrontstg'],
  ['production', 'zgerpfrontapp'],
])('valida origen de %s', (APP_ENV, sitio) => {
  const FRONT_URL = 'https://' + sitio + '.z15.web.core.windows.net';

  expect(validarSeguridad({ ...process.env, APP_ENV, FRONT_URL })).toBe(FRONT_URL);
});
