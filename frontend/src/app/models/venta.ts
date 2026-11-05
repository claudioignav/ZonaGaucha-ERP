export interface DetalleProducto {
  producto: string;
  cantidad: number;
  precioUnitario?: number | null;
  subtotal?: number | null;
}

export interface Venta {
  id: number;
  numeroFactura: string;
  cliente: string;
  fechaVenta: string;
  tipoPago: string;
  plataforma: string;
  lote: string;
  productos: DetalleProducto[];
  valorNeto: number;
  valorAdicional: number;
}

export type VentaFormulario = Pick<
  Venta,
  'cliente' | 'fechaVenta' | 'tipoPago' | 'plataforma' | 'lote' | 'productos' | 'valorAdicional'
> & { numeroFactura?: string; valorNeto?: number };

export interface ResumenVentas {
  fechaActual: string;
  ventaNeta: number;
  totalAdicional: number;
}

export interface PrecioProducto {
  nombre: string;
  precioVenta: number | null;
}

export interface OpcionesVenta {
  tiposPago: string[];
  plataformas: string[];
  lotes: string[];
  productos: string[];
  preciosProductos?: PrecioProducto[];
}

export const ventasRegistradas: Venta[] = [];

export const resumenVentas: ResumenVentas = {
  fechaActual: '',
  ventaNeta: 0,
  totalAdicional: 0,
};

export const opcionesVenta: OpcionesVenta = {
  tiposPago: [],
  plataformas: [],
  lotes: [],
  productos: [],
  preciosProductos: [],
};

export function nuevaVentaVacia(): VentaFormulario {
  return {
    numeroFactura: '',
    valorNeto: 0,
    cliente: '',
    fechaVenta: '',
    tipoPago: '',
    plataforma: '',
    lote: '',
    productos: [{ producto: '', cantidad: 1 }],
    valorAdicional: 0,
  };
}
