const assert = require('node:assert/strict');
const { after, before, describe, it } = require('node:test');
const { once } = require('node:events');
const app = require('../app');

describe('Rutas de la aplicación', () => {
  let servidor;
  let url;

  before(async () => {
    servidor = app.listen(0, '127.0.0.1');
    await once(servidor, 'listening');
    url = `http://127.0.0.1:${servidor.address().port}`;
  });

  after(() => new Promise((resolve, reject) => {
    servidor.close((error) => error ? reject(error) : resolve());
  }));

  it('GET / responde 200 con el mensaje de estado en JSON', async () => {
    const respuesta = await fetch(`${url}/`);

    assert.equal(respuesta.status, 200);
    assert.match(respuesta.headers.get('content-type'), /application\/json/);
    assert.deepEqual(await respuesta.json(), {
      mensaje: 'api del erp zonagaucha funcionando',
    });
  });

  it('una ruta inexistente devuelve el error 404 del backend', async () => {
    const respuesta = await fetch(`${url}/ruta-inexistente`);

    assert.equal(respuesta.status, 404);
    assert.deepEqual(await respuesta.json(), { error: 'Ruta no encontrada' });
  });

  it('rechaza un cuerpo JSON inválido con estado 400', async () => {
    const respuesta = await fetch(`${url}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });

    assert.equal(respuesta.status, 400);
    const cuerpo = await respuesta.json();
    assert.equal(typeof cuerpo.error, 'string');
    assert.ok(cuerpo.error.length > 0);
  });
});
