const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const autenticar = require('../middleware/authenticateToken');
const admin = require('../middleware/verifyAdmin');
const { crearRes } = require('./helpers');

const intentar = async (authorization) => {
  const req = { headers: { authorization } };
  const res = crearRes();
  const next = jest.fn();

  await autenticar(req, res, next);

  return { req, res, next };
};

test.each([undefined, 'Basic abc', 'Bearer invalido'])(
  'rechaza autorizacion %s',
  async (header) => {
    expect((await intentar(header)).res.status).toHaveBeenCalledWith(401);
  },
);

test('rechaza token expirado', async () => {
  const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: -1 });

  expect((await intentar('Bearer ' + token)).res.status).toHaveBeenCalledWith(401);
});

test.each([null, { activo: false }])('rechaza cuenta ausente o desactivada', async (usuario) => {
  jest.spyOn(Usuario, 'findByPk').mockResolvedValue(usuario);

  const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);

  expect((await intentar('Bearer ' + token)).res.status).toHaveBeenCalledWith(401);
});

test('consulta el rol actual en lugar de confiar en un rol antiguo', async () => {
  jest
    .spyOn(Usuario, 'findByPk')
    .mockResolvedValue({ idUsuario: 1, nombre: 'Ana', activo: true, rol: { nombre: 'Usuario' } });

  const token = jwt.sign({ id: 1, rol: 'Administrador' }, process.env.JWT_SECRET);
  const resultado = await intentar('Bearer ' + token);

  expect(resultado.req.user.rol).toBe('Usuario');
  expect(resultado.next).toHaveBeenCalled();

  admin(resultado.req, resultado.res, resultado.next);

  expect(resultado.res.status).toHaveBeenCalledWith(403);
});

test('solo permite administrar con usuario y rol correctos', () => {
  const res = crearRes();
  const next = jest.fn();

  admin({}, res, next);

  expect(res.status).toHaveBeenCalledWith(401);

  admin({ user: { rol: 'Administrador' } }, res, next);

  expect(next).toHaveBeenCalledTimes(1);
});

test.each([null, { nombre: 'Operador' }, { nombre: '__proto__' }])(
  'rechaza una cuenta cuyo perfil no es Administrador ni Usuario', async rol => {
    jest.spyOn(Usuario, 'findByPk').mockResolvedValue({ idUsuario: 1, activo: true, rol });
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
    const resultado = await intentar('Bearer ' + token);
    expect(resultado.res.status).toHaveBeenCalledWith(403);
    expect(resultado.next).not.toHaveBeenCalled();
  },
);
