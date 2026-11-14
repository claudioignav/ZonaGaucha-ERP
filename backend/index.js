require('dotenv').config();

const { setTimeout: esperar } = require('node:timers/promises');
const { sequelize } = require('./models');

require('./config/seguridad').validarSeguridad(process.env);

const app = require('./app');

const erroresTransitorios = new Set([
  '40197', '40501', '40613', '10928', '10929', '49918', '49919', '49920',
  'ETIMEOUT', 'ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN',
]);

const codigosConexion = (error) => {
  const codigos = new Set();
  const revisados = new Set();
  const pendientes = [error];
  while (pendientes.length) {
    const actual = pendientes.pop();
    if (!actual || revisados.has(actual)) continue;
    revisados.add(actual);
    for (const codigo of [actual.code, actual.number]) {
      if (/^[A-Z0-9_]{1,24}$/.test(String(codigo))) codigos.add(String(codigo));
    }
    pendientes.push(actual.original, actual.parent, actual.cause);
    if (Array.isArray(actual.errors)) pendientes.push(...actual.errors);
  }
  return [...codigos];
};

const conectarAlArrancar = async () => {
  const pausas = [5000, 10000, 15000];
  for (const pausa of pausas) {
    try {
      await sequelize.authenticate();
      return;
    } catch (error) {
      const codigos = codigosConexion(error);
      if (!codigos.some((codigo) => erroresTransitorios.has(codigo))) throw error;
      console.warn('Conexión SQL transitoria. Reintento de arranque en ms:', pausa, ...codigos);
      await esperar(pausa);
    }
  }
  await sequelize.authenticate();
};

const iniciar = async () => {
  const host = ['staging', 'production'].includes(process.env.APP_ENV) ? '0.0.0.0' : '127.0.0.1';

  await conectarAlArrancar();
  app.listen(Number(process.env.PORT) || 3000, host);
};

iniciar().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.name, ...codigosConexion(error));
  process.exitCode = 1;
});
