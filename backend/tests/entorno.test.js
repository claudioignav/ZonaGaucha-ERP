const { randomUUID } = require('node:crypto');
const { configurarBase } = require('../config/entorno');

const staging = {
  APP_ENV: 'staging',
  DB_HOST: 'zg-dbserver.database.windows.net',
  DB_NAME: 'sqldb-zonagaucha-stg',
  DB_USER: randomUUID(),
  DB_PASS: randomUUID(),
};

test('configura Azure SQL con cifrado y validacion del certificado', () => {
  expect(configurarBase(staging).options).toMatchObject({
    dialect: 'mssql',
    port: 1433,
    dialectOptions: { options: { encrypt: true, trustServerCertificate: false } },
  });
});

test.each(Object.keys(staging).filter(campo => campo.startsWith('DB_')))('exige %s', (campo) => {
  expect(() => configurarBase({ ...staging, [campo]: '' })).toThrow(campo);
});

test('rechaza entorno local desconocido y puerto invalido', () => {
  expect(() => configurarBase({ ...staging, APP_ENV: 'local' })).toThrow('APP_ENV');
  expect(() => configurarBase({ ...staging, APP_ENV: 'otro' })).toThrow('APP_ENV');
  expect(() => configurarBase({ ...staging, DB_PORT: '-1' })).toThrow('DB_PORT');
});

test.each([
  ['staging', 'sqldb-zonagaucha-stg'],
  ['production', 'sqldb-zonagaucha'],
])('selecciona base de %s', (APP_ENV, DB_NAME) => {
  expect(configurarBase({ ...staging, APP_ENV, DB_NAME }).database).toBe(DB_NAME);
});

test('no cruza bases ni usa un servidor distinto', () => {
  expect(() => configurarBase({ ...staging, DB_NAME: 'sqldb-zonagaucha' })).toThrow('entorno');
  expect(() => configurarBase({ ...staging, DB_HOST: 'localhost' })).toThrow('entorno');
});
