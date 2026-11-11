const request = require('supertest');
const app = require('../app');

describe('estado de la api', () => {
  test('responde la ruta principal', async () => {
    const respuesta = await request(app).get('/');

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['x-powered-by']).toBeUndefined();
    expect(respuesta.body.mensaje).toContain('zonagaucha');
  });
  test('responde 404 para una ruta que no existe', async () => {
    expect((await request(app).get('/no-existe')).status).toBe(404);
  });
  test('rechaza json incompleto', async () => {
    expect(
      (await request(app).post('/auth/login').set('Content-Type', 'application/json').send('{'))
        .status,
    ).toBe(400);
  });
  test('no expone detalles de un error interno', () => {
    const { manejarErrores } = require('../middleware/manejarErrores');
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const consola = jest.spyOn(console, 'error').mockImplementation(() => {});

    manejarErrores(new Error('detalle privado'), {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });

    consola.mockRestore();
  });
  test('exige token en usuarios', async () => {
    expect((await request(app).get('/usuarios')).status).toBe(401);
  });
  test('exige token en catalogos', async () => {
    expect((await request(app).get('/catalogos')).status).toBe(401);
  });
  test('exige token en compras', async () => {
    expect((await request(app).get('/compras')).status).toBe(401);
  });
  test('exige token en ventas', async () => {
    expect((await request(app).get('/ventas')).status).toBe(401);
  });
  test('exige token en inventario', async () => {
    expect((await request(app).get('/inventario')).status).toBe(401);
  });
  test('exige token en dashboard', async () => {
    expect((await request(app).get('/dashboard')).status).toBe(401);
  });
});

describe('metricas de la api', () => {
  const { randomBytes } = require('node:crypto');
  const token = randomBytes(32).toString('hex');

  test('deshabilita /metrics cuando no hay token configurado', async () => {
    jest.replaceProperty(process, 'env', { ...process.env, METRICS_TOKEN: '' });

    await request(app).get('/metrics').expect(404);
  });

  test('rechaza solicitudes sin token o con un token incorrecto', async () => {
    jest.replaceProperty(process, 'env', { ...process.env, METRICS_TOKEN: token });

    await request(app).get('/metrics').expect(401).expect('WWW-Authenticate', 'Bearer');
    await request(app).get('/metrics').set('Authorization', 'Bearer incorrecto').expect(401);
  });

  test('publica las métricas para Grafana sin incluir la URL de la solicitud', async () => {
    jest.replaceProperty(process, 'env', { ...process.env, METRICS_TOKEN: token });
    await request(app).get('/?busqueda=dato-de-prueba').expect(200);
    await request(app).get('/AUTH/perfil').expect(401);
    await request(app).get('/no-existe/dato-de-prueba').expect(404);

    const respuesta = await request(app)
      .get('/metrics')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /text\/plain/)
      .expect('Cache-Control', 'no-store');

    expect(respuesta.text).toContain('http_requests_total{method="GET",route="/",status_code="200"}');
    expect(respuesta.text).toContain('http_requests_total{method="GET",route="sin_ruta",status_code="404"}');
    expect(respuesta.text).toContain('http_requests_total{method="GET",route="/auth/perfil",status_code="401"}');
    expect(respuesta.text).toContain('http_request_duration_seconds_bucket{');
    expect(respuesta.text).not.toContain('dato-de-prueba');
    expect(respuesta.text).not.toContain('route="/metrics"');
  });
});
