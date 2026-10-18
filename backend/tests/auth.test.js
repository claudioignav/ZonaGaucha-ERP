const { randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { login, perfil } = require('../controllers/authController');
const { ejecutar } = require('./helpers');

const claveDePrueba = randomUUID();

let hash;

beforeAll(async () => {
  hash = await bcrypt.hash(claveDePrueba, 4);
});

const guardado = (activo = true) => ({
  idUsuario: 7,
  nombre: 'Ana',
  apellidos: 'Rojas',
  activo,
  contrasenaHash: hash,
  rol: { nombre: 'Administrador' },
});

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
