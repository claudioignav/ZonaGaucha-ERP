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
});
