const assert = require('node:assert/strict');
const { test } = require('node:test');
const { estado } = require('../controllers/estadoController');

test('el controlador de estado responde con el mensaje esperado', (t) => {
  const respuesta = { json: t.mock.fn() };

  estado({}, respuesta);

  assert.equal(respuesta.json.mock.callCount(), 1);
  assert.deepEqual(respuesta.json.mock.calls[0].arguments, [
    { mensaje: 'api del erp zonagaucha funcionando' },
  ]);
});
