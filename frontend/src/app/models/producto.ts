import { RegistroCatalogo } from './catalogo';

export interface Producto extends RegistroCatalogo {
  categoria: string;
  precioVenta?: number | null;
}

export const productosRegistrados: Producto[] = [];
