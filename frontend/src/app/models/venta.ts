export interface DetalleProducto {
  producto: string;
  cantidad: number;
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

export interface ResumenVentas {
  fechaActual: string;
  ventaNeta: number;
  totalAdicional: number;
}

export interface OpcionesVenta {
  tiposPago: string[];
  plataformas: string[];
  lotes: string[];
  productos: string[];
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
};

export function nuevaVentaVacia(): Omit<Venta, 'id'> {
  return {
    numeroFactura: '',
    cliente: '',
    fechaVenta: '',
    tipoPago: '',
    plataforma: '',
    lote: '',
    productos: [{ producto: '', cantidad: 1 }],
    valorNeto: 0,
    valorAdicional: 0,
  };
}
