export type RolUsuario = 'Administrador' | 'Usuario';
export type Permiso =
  | 'registrar-compra'
  | 'registrar-venta'
  | 'ver-inventario'
  | 'gestionar-catalogos'
  | 'ver-metricas'
  | 'modificar-compra'
  | 'modificar-venta'
  | 'gestionar-cuentas';

const permisosUsuario: Permiso[] = [
  'registrar-compra', 'registrar-venta', 'ver-inventario', 'gestionar-catalogos',
];

const permisosPorRol = new Map<string, Set<Permiso>>([
  ['Usuario', new Set(permisosUsuario)],
  ['Administrador', new Set([
    ...permisosUsuario, 'ver-metricas', 'modificar-compra', 'modificar-venta', 'gestionar-cuentas',
  ])],
]);

export const rolValido = (rol: string): rol is RolUsuario => permisosPorRol.has(rol);
export const tienePermiso = (rol: string | undefined, permiso: Permiso): boolean =>
  permisosPorRol.get(rol ?? '')?.has(permiso) === true;

export const rutaInicio = (rol: string | undefined): string => {
  if (tienePermiso(rol, 'ver-metricas')) return '/dashboard';
  return tienePermiso(rol, 'ver-inventario') ? '/inventario' : '/login';
};
