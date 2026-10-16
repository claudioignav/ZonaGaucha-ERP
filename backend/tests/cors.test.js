const request = require('supertest');
const app = require('../app');

test('permite origen de staging y cabecera authorization', async () => {
  const respuesta = await request(app)
    .options('/usuarios')
    .set('Origin', 'https://zgerpfrontstg.z15.web.core.windows.net')
    .set('Access-Control-Request-Method', 'GET')
    .set('Access-Control-Request-Headers', 'authorization');

  expect(respuesta.headers['access-control-allow-origin']).toBe('https://zgerpfrontstg.z15.web.core.windows.net');
  expect(respuesta.headers['access-control-allow-headers']).toContain('Authorization');
});

test('otro origen no recibe permiso para su sitio', async () => {
  const respuesta = await request(app).get('/').set('Origin', 'https://otro.cl');

  expect(respuesta.headers['access-control-allow-origin']).not.toBe('https://otro.cl');
});
