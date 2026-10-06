import { RegistroCatalogo } from './catalogo';

export interface Plataforma extends RegistroCatalogo {
  tiposPago: string[];
}

export const plataformasRegistradas: Plataforma[] = [];
