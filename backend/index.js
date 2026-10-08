const app = require('./app');

const iniciar = async () => {
  app.listen(Number(process.env.PORT) || 3000, '127.0.0.1');
};

iniciar().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.name);
  process.exitCode = 1;
});
