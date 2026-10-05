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

export const ventasRegistradas: Venta[] = [];

export const resumenVentas: ResumenVentas = {
  fechaActual: '',
  ventaNeta: 0,
  totalAdicional: 0,
};
