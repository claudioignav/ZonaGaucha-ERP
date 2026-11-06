const https = require('node:https');

const crearSolicitudReporte = () => https.request({
  hostname: 'reportes.example.invalid',
  path: '/reporte',
  method: 'GET',
  rejectUnauthorized: false,
});

module.exports = { crearSolicitudReporte };
