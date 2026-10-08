const assert = require('node:assert/strict');
const { test } = require('node:test');
const { manejarErrores, rutaNoEncontrada } = require('../middleware/manejarErrores');

function crearRespuesta() {
  return {
    codigo: 200,
    cuerpo: undefined,
    status(codigo) {
      this.codigo = codigo;
      return this;
    },
    json(cuerpo) {
      this.cuerpo = cuerpo;
      return this;
    },
  };
}

test('una ruta inexistente responde 404 con un mensaje claro', () => {
  const respuesta = crearRespuesta();

  rutaNoEncontrada({}, respuesta);

  assert.equal(respuesta.codigo, 404);
  assert.deepEqual(respuesta.cuerpo, { error: 'Ruta no encontrada' });
});

test('un error con estado definido conserva el código y el mensaje', () => {
  const respuesta = crearRespuesta();
  const error = Object.assign(new Error('Solicitud inválida'), { status: 400 });

  manejarErrores(error, {}, respuesta, () => {});

  assert.equal(respuesta.codigo, 400);
  assert.deepEqual(respuesta.cuerpo, { error: 'Solicitud inválida' });
});

test('un error inesperado responde 500 sin exponer detalles internos', () => {
  const respuesta = crearRespuesta();
  const error = new Error('Detalle interno que no debe exponerse');

  manejarErrores(error, {}, respuesta, () => {});

  assert.equal(respuesta.codigo, 500);
  assert.deepEqual(respuesta.cuerpo, { error: 'Error interno del servidor' });
});
