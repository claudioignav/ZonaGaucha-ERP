import { rolValido, tienePermiso, rutaInicio } from './permisos';

it.each(['registrar-compra', 'registrar-venta', 'ver-inventario', 'gestionar-catalogos'] as const)(
  'ambos perfiles pueden %s', permiso => {
    expect(tienePermiso('Usuario', permiso)).toBe(true);
    expect(tienePermiso('Administrador', permiso)).toBe(true);
  },
);

it.each(['ver-metricas', 'modificar-compra', 'modificar-venta', 'gestionar-cuentas'] as const)(
  'solo el administrador puede %s', permiso => {
    expect(tienePermiso('Usuario', permiso)).toBe(false);
    expect(tienePermiso('Administrador', permiso)).toBe(true);
  },
);

it('rechaza perfiles desconocidos y elige un inicio autorizado', () => {
  expect(rolValido('Usuario')).toBe(true);
  expect(rolValido('Administrador')).toBe(true);
  expect(rolValido('Operador')).toBe(false);
  expect(tienePermiso('__proto__', 'ver-metricas')).toBe(false);
  expect(tienePermiso(undefined, 'gestionar-cuentas')).toBe(false);
  expect(rutaInicio('Administrador')).toBe('/dashboard');
  expect(rutaInicio('Usuario')).toBe('/inventario');
  expect(rutaInicio(undefined)).toBe('/login');
});
