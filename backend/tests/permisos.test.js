const verifyPermiso = require('../middleware/verifyPermiso');
const { tienePermiso, rolValido } = require('../utils/permisos');
const { crearRes } = require('./helpers');

test.each(['registrar-compra', 'registrar-venta', 'ver-inventario', 'gestionar-catalogos'])(
  'ambos perfiles pueden %s', permiso => {
    expect(tienePermiso('Usuario', permiso)).toBe(true);
    expect(tienePermiso('Administrador', permiso)).toBe(true);
  },
);

test.each(['ver-metricas', 'modificar-compra', 'modificar-venta', 'gestionar-cuentas'])(
  'solo el administrador puede %s', permiso => {
    expect(tienePermiso('Usuario', permiso)).toBe(false);
    expect(tienePermiso('Administrador', permiso)).toBe(true);
  },
);

test.each([undefined, null, '', 'Operador', '__proto__'])(
  'un rol desconocido %s no obtiene permisos', rol => {
    expect(rolValido(rol)).toBe(false);
    expect(tienePermiso(rol, 'registrar-compra')).toBe(false);
  },
);

test('el middleware distingue falta de sesion y falta de permiso', () => {
  const res = crearRes();
  const next = jest.fn();
  const proteger = verifyPermiso('ver-metricas');
  proteger({}, res, next);
  expect(res.status).toHaveBeenLastCalledWith(401);
  proteger({ user: { rol: 'Usuario' } }, res, next);
  expect(res.status).toHaveBeenLastCalledWith(403);
  expect(next).not.toHaveBeenCalled();
  proteger({ user: { rol: 'Administrador' } }, res, next);
  expect(next).toHaveBeenCalledTimes(1);
});
