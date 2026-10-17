jest.mock('../app', () => ({ listen: jest.fn() }));
jest.mock('../models', () => ({
  sequelize: { authenticate: jest.fn().mockResolvedValue() },
}), { virtual: true });
jest.mock('../config/seguridad', () => ({ validarSeguridad: jest.fn() }), { virtual: true });
jest.mock('dotenv', () => ({ config: jest.fn() }), { virtual: true });

const variablesAnteriores = { PORT: process.env.PORT, APP_ENV: process.env.APP_ENV };
const esperarInicio = () => new Promise((resolve) => setImmediate(resolve));

beforeEach(() => {
  jest.resetModules();
});

afterEach(() => {
  for (const [nombre, valor] of Object.entries(variablesAnteriores)) {
    if (valor === undefined) delete process.env[nombre];
    else process.env[nombre] = valor;
  }

  delete process.exitCode;
});

test.each(['staging', 'production'])('escucha en el puerto y la interfaz de %s', async (entorno) => {
  process.env.APP_ENV = entorno;
  process.env.PORT = '8080';

  const app = require('../app');

  require('../index');
  await esperarInicio();

  expect(app.listen).toHaveBeenCalledTimes(1);
  expect(app.listen).toHaveBeenCalledWith(8080, '0.0.0.0');
});

test('informa el error de arranque sin ocultarlo', async () => {
  process.env.APP_ENV = 'staging';
  const app = require('../app');
  const consola = jest.spyOn(console, 'error').mockImplementation(() => {});

  app.listen.mockImplementation(() => { throw new Error('puerto ocupado'); });

  require('../index');
  await esperarInicio();

  expect(process.exitCode).toBe(1);
  expect(consola).toHaveBeenCalledWith('No se pudo iniciar el servidor:', 'Error');
});

test('espera la conexion SQL antes de aceptar peticiones', async () => {
  process.env.APP_ENV = 'staging';
  const app = require('../app');
  const { sequelize } = require('../models');
  let conectar;

  sequelize.authenticate.mockImplementation(() => new Promise((resolve) => { conectar = resolve; }));

  require('../index');
  expect(app.listen).not.toHaveBeenCalled();

  conectar();
  await esperarInicio();

  expect(app.listen).toHaveBeenCalledTimes(1);
});

test('no acepta peticiones cuando falla la conexion SQL', async () => {
  process.env.APP_ENV = 'staging';
  const consola = jest.spyOn(console, 'error').mockImplementation(() => {});
  const { sequelize } = require('../models');

  sequelize.authenticate.mockRejectedValue(new Error('conexion rechazada'));

  require('../index');
  await esperarInicio();

  expect(require('../app').listen).not.toHaveBeenCalled();
  expect(process.exitCode).toBe(1);
  expect(consola).toHaveBeenCalledWith('No se pudo iniciar el servidor:', 'Error');
});
