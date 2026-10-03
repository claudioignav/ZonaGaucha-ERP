export interface EnlaceMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
}

export interface UsuarioSesion {
  iniciales: string;
  nombre: string;
  rol: string;
}

export const enlacesPrincipales: EnlaceMenu[] = [
  { ruta: '/dashboard', etiqueta: 'Dashboard', icono: 'assets/icons/home.svg' },
  { ruta: '/cuentas', etiqueta: 'Administrar Cuentas', icono: 'assets/icons/user-check.svg' },
];

export const enlacesModulos: EnlaceMenu[] = [
  { ruta: '/ventas', etiqueta: 'Ventas', icono: 'assets/icons/shopping-cart.svg' },
  { ruta: '/compras', etiqueta: 'Compras', icono: 'assets/icons/shopping-bag.svg' },
  { ruta: '/inventario', etiqueta: 'Inventario', icono: 'assets/icons/database.svg' },
];

export const enlacesCatalogos: EnlaceMenu[] = [
  { ruta: '/catalogos/productos', etiqueta: 'Productos', icono: 'assets/icons/package.svg' },
  { ruta: '/catalogos/proveedores', etiqueta: 'Proveedores', icono: 'assets/icons/users.svg' },
  { ruta: '/catalogos/tipos-pago', etiqueta: 'Tipos de Pago', icono: 'assets/icons/credit-card.svg' },
  { ruta: '/catalogos/plataformas', etiqueta: 'Plataformas', icono: 'assets/icons/globe.svg' },
  { ruta: '/catalogos/tipos-contenido', etiqueta: 'Tipos de Contenido', icono: 'assets/icons/layers.svg' },
  { ruta: '/catalogos/categorias-producto', etiqueta: 'Categoría de Producto', icono: 'assets/icons/tag.svg' },
];

export const usuarioActual: UsuarioSesion = {
  iniciales: 'UP',
  nombre: 'Usuario Prueba',
  rol: 'Administrador',
};
