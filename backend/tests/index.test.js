const assert = require('node:assert/strict');
const { test } = require('node:test');
const app = require('../app');

test('el servidor arranca usando el puerto configurado en PORT', (t) => {
  const puertoAnterior = process.env.PORT;
  t.after(() => {
    if (puertoAnterior === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = puertoAnterior;
    }
    delete require.cache[require.resolve('../index')];
  });
  process.env.PORT = '4567';
  const escuchar = t.mock.method(app, 'listen', () => {});

  require('../index');

  assert.equal(escuchar.mock.callCount(), 1);
  assert.equal(escuchar.mock.calls[0].arguments[0], 4567);
});
