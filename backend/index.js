require('dotenv').config();

const { sequelize } = require('./models');

const app = require('./app');

const iniciar = async () => {
  const host = ['staging', 'production'].includes(process.env.APP_ENV) ? '0.0.0.0' : '127.0.0.1';

  await sequelize.authenticate();
  app.listen(Number(process.env.PORT) || 3000, host);
};

iniciar().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.name);
  process.exitCode = 1;
});
