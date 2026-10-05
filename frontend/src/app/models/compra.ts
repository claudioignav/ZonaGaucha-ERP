export interface DetalleCompra {
  producto: string;
  cantidad: number;
}

export interface Compra {
  id: number;
  numeroFactura: string;
  numeroLote: string;
  proveedor: string;
  fechaCompra: string;
  tipoPago: string;
  tipoContenido: string;
  productos: DetalleCompra[];
  compraBruta: number;
  compraNeta: number;
}

export interface ResumenCompras {
  fechaActual: string;
  compraBruta: number;
  compraNeta: number;
  impuestosTotales: number;
}

export const comprasRegistradas: Compra[] = [];

export const resumenCompras: ResumenCompras = {
  fechaActual: '',
  compraBruta: 0,
  compraNeta: 0,
  impuestosTotales: 0,
};
