export interface DetalleCompra {
  producto: string;
  cantidad: number;
  precioUnitario?: number | null;
  subtotal?: number | null;
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
  impuesto: number;
  compraNeta: number;
}

export type CompraFormulario = Omit<Compra, 'id' | 'compraBruta' | 'impuesto' | 'compraNeta'> & {
  compraBruta?: number;
  impuesto: number | string;
};

export interface ResumenCompras {
  fechaActual: string;
  compraBruta: number;
  compraNeta: number;
  impuestosTotales: number;
}

export interface OpcionesCompra {
  proveedores: string[];
  tiposPago: string[];
  tiposContenido: string[];
  productos: string[];
}

export const comprasRegistradas: Compra[] = [];

export const resumenCompras: ResumenCompras = {
  fechaActual: '',
  compraBruta: 0,
  compraNeta: 0,
  impuestosTotales: 0,
};

export const opcionesCompra: OpcionesCompra = {
  proveedores: [],
  tiposPago: [],
  tiposContenido: [],
  productos: [],
};

export function nuevaCompraVacia(): CompraFormulario {
  return {
    numeroFactura: '',
    numeroLote: '',
    proveedor: '',
    fechaCompra: '',
    tipoPago: '',
    tipoContenido: '',
    productos: [{ producto: '', cantidad: 1 }],
    compraBruta: 0,
    impuesto: '',
  };
}
