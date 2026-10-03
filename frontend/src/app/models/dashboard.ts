export interface TarjetaResumen {
  titulo: string;
  monto: number;
  variacion: string;
  tendencia: string;
  color: string;
}

export interface EstadisticaEmpresa {
  etiqueta: string;
  icono: string;
  total: number;
  detalle?: string;
}

export const resumenFinanciero: TarjetaResumen[] = [
  { titulo: 'Total Vendido', monto: 0, variacion: '', tendencia: '', color: '#4ade80' },
  { titulo: 'Utilidades', monto: 0, variacion: '', tendencia: '', color: '#15803d' },
  { titulo: 'Total Comprado', monto: 0, variacion: '', tendencia: '', color: '#15803d' },
];

export const estadisticasEmpresa: EstadisticaEmpresa[] = [
  { etiqueta: 'Productos', icono: 'assets/icons/products-green.svg', total: 0 },
  { etiqueta: 'Número de Cuentas', icono: 'assets/icons/user-green.svg', total: 0 },
  { etiqueta: 'Proveedores Activos', icono: 'assets/icons/suppliers-green.svg', total: 0 },
  { etiqueta: 'Categorías de Productos', icono: 'assets/icons/category-green.svg', total: 0 },
];
