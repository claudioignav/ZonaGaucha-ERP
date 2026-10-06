import { RegistroCatalogo } from './catalogo';

export interface Producto extends RegistroCatalogo {
  categoria: string;
}

export const productosRegistrados: Producto[] = [];
