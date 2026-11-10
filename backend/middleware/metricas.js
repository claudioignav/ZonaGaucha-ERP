const { Counter, Histogram, Registry } = require('@prometheus-io/client');

const registro = new Registry();
const etiquetas = ['method', 'route', 'status_code'];

const solicitudes = new Counter({
  name: 'http_requests_total',
  help: 'Total de solicitudes HTTP completadas',
  labelNames: etiquetas,
  registers: [registro],
});

const duracion = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duracion de las solicitudes HTTP en segundos',
  labelNames: etiquetas,
  registers: [registro],
});

const medirSolicitudes = (req, res, next) => {
  const inicio = process.hrtime.bigint();

  res.once('finish', () => {
    const ruta = req.route
      ? (req.baseUrl.toLowerCase() + req.route.path).replace(/\/$/, '') || '/'
      : 'sin_ruta';
    const valores = { method: req.method, route: ruta, status_code: res.statusCode };
    solicitudes.inc(valores);
    duracion.observe(valores, Number(process.hrtime.bigint() - inicio) / 1e9);
  });

  next();
};

module.exports = { medirSolicitudes, registro };
