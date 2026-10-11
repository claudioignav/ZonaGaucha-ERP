jest.mock('../app', () => ({ listen: jest.fn() }));

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

test.each([undefined, 'local', 'staging', 'production'])('escucha en el puerto y la interfaz de %s', async (entorno) => {
  if (entorno === undefined) {
    delete process.env.APP_ENV;
    delete process.env.PORT;
  } else {
    process.env.APP_ENV = entorno;
    process.env.PORT = '8080';
  }

  const app = require('../app');

  require('../index');
  await esperarInicio();

  expect(app.listen).toHaveBeenCalledTimes(1);
  expect(app.listen).toHaveBeenCalledWith(
    entorno === undefined ? 3000 : 8080,
    entorno === 'staging' || entorno === 'production' ? '0.0.0.0' : '127.0.0.1',
  );
});

test('informa el error de arranque sin ocultarlo', async () => {
  process.env.APP_ENV = 'local';
  const app = require('../app');
  const consola = jest.spyOn(console, 'error').mockImplementation(() => {});

  app.listen.mockImplementation(() => { throw new Error('puerto ocupado'); });

  require('../index');
  await esperarInicio();

  expect(process.exitCode).toBe(1);
  expect(consola).toHaveBeenCalledWith('No se pudo iniciar el servidor:', 'Error');
});
