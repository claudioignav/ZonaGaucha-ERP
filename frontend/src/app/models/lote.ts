export interface ProductoLote {
  id: number;
  nombre: string;
  categoria?: string | null;
  unidadesDisponibles: number;
  unidadesIngresadas: number;
  precioTotal?: number | null;
}

export interface Lote {
  numero: number;
  proveedor: string;
  tipoContenido: string;
  facturaAsociada: string;
  unidadesDisponibles: number;
  unidadesTotales: number;
  fechaCreacion: string;
  productos: ProductoLote[];
}

export interface ResumenInventario {
  fechaActual: string;
  promedioVenta: number;
  productosDisponibles: number;
}

export const lotesRegistrados: Lote[] = [];

export const resumenInventario: ResumenInventario = {
  fechaActual: '',
  promedioVenta: 0,
  productosDisponibles: 0,
};
