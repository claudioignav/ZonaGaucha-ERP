const { randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { login, perfil } = require('../controllers/authController');
const { ejecutar, crearRegistro } = require('./helpers');

const claveDePrueba = randomUUID();

let hash;

beforeAll(async () => {
  hash = await bcrypt.hash(claveDePrueba, 4);
});

const guardado = (activo = true, extra = {}) =>
  crearRegistro({
    idUsuario: 7,
    nombre: 'Ana',
    apellidos: 'Rojas',
    activo,
    contrasenaHash: hash,
    intentosFallidos: 0,
    bloqueadoHasta: null,
    rol: { nombre: 'Administrador' },
    ...extra,
  });

const enMinutos = (minutos) => new Date(Date.now() + minutos * 60000);
const claveMala = { correo: 'ana@zonagaucha.cl', contrasena: claveDePrueba + '-incorrecta' };

const intentar = (body = { correo: ' Ana@ZonaGaucha.cl ', contrasena: claveDePrueba }) =>
  ejecutar(login, { body });

test('exige correo y clave', async () => {
  await expect(intentar({ correo: 'a@b.cl' })).rejects.toMatchObject({ status: 400 });
});

test('rechaza tipos incorrectos', async () => {
  expect((await intentar({ correo: {}, contrasena: claveDePrueba })).status).toHaveBeenCalledWith(400);
});

test('normaliza correo sin revelar si existe', async () => {
  const buscar = jest.spyOn(Usuario, 'findOne').mockResolvedValue(null);
  const respuesta = await intentar();

  expect(buscar.mock.calls[0][0].where.correo).toBe('ana@zonagaucha.cl');
  expect(respuesta.status).toHaveBeenCalledWith(401);
});

test('rechaza clave incorrecta', async () => {
  jest.spyOn(Usuario, 'findOne').mockResolvedValue(guardado());

  expect(
    (await intentar({ correo: 'ana@zonagaucha.cl', contrasena: claveDePrueba + '-incorrecta' })).status,
  ).toHaveBeenCalledWith(401);
});

test('rechaza cuenta desactivada', async () => {
  jest.spyOn(Usuario, 'findOne').mockResolvedValue(guardado(false));

  expect((await intentar()).status).toHaveBeenCalledWith(403);
});

test('devuelve datos del usuario sin hash y con token', async () => {
  jest.spyOn(Usuario, 'findOne').mockResolvedValue(guardado());

  const respuesta = (await intentar()).json.mock.calls[0][0];

  expect(respuesta.usuario).toEqual({
    id: 7,
    nombre: 'Ana',
    apellidos: 'Rojas',
    rol: 'Administrador',
  });
  expect(jwt.verify(respuesta.token, process.env.JWT_SECRET)).toMatchObject({ id: 7 });
});

test('el perfil devuelve la identidad validada', async () => {
  expect((await ejecutar(perfil)).json).toHaveBeenCalledWith({ id: 1, rol: 'Administrador' });
});

test.each([null, { nombre: 'Operador' }])('no emite token para un perfil desconocido', async rol => {
  jest.spyOn(Usuario, 'findOne').mockResolvedValue({ ...guardado(), rol });
  const respuesta = await intentar();
  expect(respuesta.status).toHaveBeenCalledWith(403);
  expect(respuesta.json.mock.calls[0][0]).not.toHaveProperty('token');
});

test('cuenta un intento fallido sin suspender antes del quinto', async () => {
  const registro = guardado(true, { intentosFallidos: 3 });
  jest.spyOn(Usuario, 'findOne').mockResolvedValue(registro);

  expect((await intentar(claveMala)).status).toHaveBeenCalledWith(401);
  expect(registro.update).toHaveBeenCalledWith({ intentosFallidos: 4 });
});

test('suspende la cuenta al quinto intento fallido consecutivo', async () => {
  const registro = guardado(true, { intentosFallidos: 4 });
  jest.spyOn(Usuario, 'findOne').mockResolvedValue(registro);

  const respuesta = await intentar(claveMala);

  expect(respuesta.status).toHaveBeenCalledWith(423);
  expect(respuesta.json.mock.calls[0][0].error).toContain('15 minutos');
  expect(registro.intentosFallidos).toBe(0);
  expect(registro.bloqueadoHasta.getTime()).toBeGreaterThan(enMinutos(14).getTime());
});

test('una cuenta suspendida no entra aunque la clave sea correcta', async () => {
  const registro = guardado(true, { bloqueadoHasta: enMinutos(10) });
  jest.spyOn(Usuario, 'findOne').mockResolvedValue(registro);

  const respuesta = await intentar();

  expect(respuesta.status).toHaveBeenCalledWith(423);
  expect(respuesta.json.mock.calls[0][0]).not.toHaveProperty('token');
  expect(registro.update).not.toHaveBeenCalled();
});

test('al vencer la suspension entra y reinicia los intentos', async () => {
  const registro = guardado(true, { intentosFallidos: 2, bloqueadoHasta: enMinutos(-1) });
  jest.spyOn(Usuario, 'findOne').mockResolvedValue(registro);

  const respuesta = await intentar();

  expect(respuesta.json.mock.calls[0][0]).toHaveProperty('token');
  expect(registro.update).toHaveBeenCalledWith({ intentosFallidos: 0, bloqueadoHasta: null });
});

test('el token dura 30 dias por defecto', async () => {
  const anterior = process.env.JWT_EXPIRA;
  delete process.env.JWT_EXPIRA;
  jest.spyOn(Usuario, 'findOne').mockResolvedValue(guardado());

  const { token } = (await intentar()).json.mock.calls[0][0];
  const datos = jwt.decode(token);

  expect(datos.exp - datos.iat).toBe(30 * 24 * 60 * 60);
  if (anterior !== undefined) process.env.JWT_EXPIRA = anterior;
});
