const permisosUsuario = [
  'registrar-compra',
  'registrar-venta',
  'ver-inventario',
  'gestionar-catalogos',
];

const permisosPorRol = new Map([
  ['Usuario', new Set(permisosUsuario)],
  ['Administrador', new Set([
    ...permisosUsuario,
    'ver-metricas',
    'modificar-compra',
    'modificar-venta',
    'gestionar-cuentas',
  ])],
]);

const rolValido = (rol) => permisosPorRol.has(rol);
const tienePermiso = (rol, permiso) => permisosPorRol.get(rol)?.has(permiso) === true;

module.exports = { rolValido, tienePermiso };
