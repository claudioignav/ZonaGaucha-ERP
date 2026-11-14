const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const { estado } = require('../controllers/estadoController');

test('el controlador de estado responde con el mensaje esperado', () => {
  const respuesta = { json: jest.fn() };

  estado({}, respuesta);

  expect(respuesta.json).toHaveBeenCalledTimes(1);
  expect(respuesta.json).toHaveBeenCalledWith({ mensaje: 'api del erp zonagaucha funcionando' });
});

test.each([true, false])('el estado del despliegue comprueba la conexión SQL (%s)', async (sql) => {
  const sha = '0123456789abcdef0123456789abcdef01234567';
  const versionAnterior = app.locals.versionDespliegue;
  app.locals.versionDespliegue = sha;
  const autenticar = jest.spyOn(sequelize, 'authenticate');
  if (sql) autenticar.mockResolvedValue();
  else autenticar.mockRejectedValue(new Error('conexión rechazada'));

  try {
    const respuesta = await request(app).get('/estado/despliegue');
    expect(autenticar).toHaveBeenCalledTimes(1);
    expect(respuesta.status).toBe(sql ? 200 : 503);
    expect(respuesta.headers['cache-control']).toBe('no-store');
    expect(respuesta.body).toEqual({ sha, sql });
  } finally {
    app.locals.versionDespliegue = versionAnterior;
  }
});
