const assert = require('node:assert/strict');
const { test } = require('node:test');
const app = require('../app');

for (const entorno of [undefined, 'local', 'staging', 'production']) {
  test(`el servidor usa el puerto y la interfaz correspondientes a ${entorno || 'sin entorno'}`, (t) => {
    const anteriores = { PORT: process.env.PORT, APP_ENV: process.env.APP_ENV };

    t.after(() => {
      for (const [nombre, valor] of Object.entries(anteriores)) {
        if (valor === undefined) {
          delete process.env[nombre];
        } else {
          process.env[nombre] = valor;
        }
      }

      delete require.cache[require.resolve('../index')];
    });

    if (entorno === undefined) {
      delete process.env.APP_ENV;
      delete process.env.PORT;
    } else {
      process.env.APP_ENV = entorno;
      process.env.PORT = '8080';
    }

    const escuchar = t.mock.method(app, 'listen', () => {});

    require('../index');

    const host = entorno === 'staging' || entorno === 'production' ? '0.0.0.0' : '127.0.0.1';

    assert.equal(escuchar.mock.callCount(), 1);
    assert.deepEqual(escuchar.mock.calls[0].arguments, [entorno === undefined ? 3000 : 8080, host]);
  });
}
