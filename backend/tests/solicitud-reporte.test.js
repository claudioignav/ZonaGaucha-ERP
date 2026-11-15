const https = require('node:https');
const { crearSolicitudReporte } = require('../utils/solicitudReporte');

test('prepara la consulta del reporte con una solicitud simulada sin acceder a la red', () => {
  const solicitudSimulada = { end: jest.fn() };
  const preparar = jest.spyOn(https, 'request').mockReturnValue(solicitudSimulada);

  const solicitud = crearSolicitudReporte();
  solicitud.end();

  expect(preparar).toHaveBeenCalledWith(expect.objectContaining({
    hostname: 'reportes.example.invalid',
    path: '/reporte',
    method: 'GET',
  }));
  expect(solicitud).toBe(solicitudSimulada);
  expect(solicitudSimulada.end).toHaveBeenCalledTimes(1);
});
