const { estado } = require('../controllers/estadoController');

test('el controlador de estado responde con el mensaje esperado', () => {
  const respuesta = { json: jest.fn() };

  estado({}, respuesta);

  expect(respuesta.json).toHaveBeenCalledTimes(1);
  expect(respuesta.json).toHaveBeenCalledWith({ mensaje: 'api del erp zonagaucha funcionando' });
});
