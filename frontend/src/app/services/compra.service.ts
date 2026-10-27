import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Compra,
  CompraFormulario,
  OpcionesCompra,
  ResumenCompras,
} from '../models/compra';
import { RUTAS_API } from './api';
import { manejarErrorHttp } from './errores';

export type CompraNueva = Omit<CompraFormulario, 'impuesto'> & {
  compraBruta: number;
  impuesto: number;
  tipoImpuesto: 'porcentaje' | 'monto';
};

export type FiltrosCompra = Partial<
  Record<'numeroFactura' | 'fechaCompra' | 'proveedor' | 'tipoPago', string>
>;

@Injectable({ providedIn: 'root' })
export class CompraService {
  private readonly http = inject(HttpClient);

  listar(filtros: FiltrosCompra = {}) {
    return this.http.get<Compra[]>(RUTAS_API.compras, { params: filtros }).pipe(manejarErrorHttp());
  }

  resumen() {
    return this.http.get<ResumenCompras>(RUTAS_API.compras + '/resumen').pipe(manejarErrorHttp());
  }

  opciones() {
    return this.http.get<OpcionesCompra>(RUTAS_API.compras + '/opciones').pipe(manejarErrorHttp());
  }

  crear(compra: CompraNueva) {
    return this.http
      .post<{ id: number; impuesto: number; compraNeta: number }>(RUTAS_API.compras, compra)
      .pipe(manejarErrorHttp());
  }
}
