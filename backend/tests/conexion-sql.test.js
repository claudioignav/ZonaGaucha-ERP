const { randomUUID } = require('node:crypto');
const { configurarBase } = require('../config/entorno');

const variables = () => ({
  APP_ENV: 'staging',
  DB_HOST: 'zg-dbserver.database.windows.net',
  DB_NAME: 'sqldb-zonagaucha-stg',
  DB_USER: randomUUID(),
  DB_PASS: randomUUID(),
});

test.each([
  ['staging', 'sqldb-zonagaucha-stg'],
  ['production', 'sqldb-zonagaucha'],
])('usa las credenciales y la base del entorno %s', (APP_ENV, DB_NAME) => {
  const datos = variables();
  const conexion = configurarBase({ ...datos, APP_ENV, DB_NAME, DB_PORT: '1444' });
  expect(conexion).toMatchObject({
    database: DB_NAME,
    options: { dialect: 'mssql', port: 1444, logging: false },
  });
  expect(conexion.username).toBe(datos.DB_USER);
  expect(conexion.password).toBe(datos.DB_PASS);
});

test('usa el puerto SQL predeterminado cuando no se indica otro', () => {
  expect(configurarBase(variables()).options.port).toBe(1433);
});

test.each(Object.keys(variables()).filter(campo => campo.startsWith('DB_')))('rechaza la falta de %s', campo => {
  expect(() => configurarBase({ ...variables(), [campo]: '' })).toThrow('Falta ' + campo);
});

test.each(['local', 'desconocido'])('no permite el entorno %s', APP_ENV => {
  expect(() => configurarBase({ ...variables(), APP_ENV })).toThrow('APP_ENV');
});

test.each([
  { DB_NAME: 'sqldb-zonagaucha' },
  { DB_HOST: 'localhost' },
])('rechaza un servidor o base ajenos al entorno', cambios => {
  expect(() => configurarBase({ ...variables(), ...cambios })).toThrow('entorno');
});

test.each(['0', '-1', '65536', 'abc', '1433.5'])('rechaza el puerto SQL %s', DB_PORT => {
  expect(() => configurarBase({ ...variables(), DB_PORT })).toThrow('DB_PORT');
});
