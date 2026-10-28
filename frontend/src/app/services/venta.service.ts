import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Venta, OpcionesVenta, ResumenVentas, VentaFormulario } from '../models/venta';
import { RUTAS_API } from './api';
import { manejarErrorHttp } from './errores';

export type VentaNueva = VentaFormulario & { valorBruto: number; valorNeto: number };

export type FiltrosVenta = Partial<
  Record<'numeroFactura' | 'fechaVenta' | 'plataforma' | 'tipoPago', string>
>;

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly http = inject(HttpClient);

  listar(filtros: FiltrosVenta = {}) {
    return this.http.get<Venta[]>(RUTAS_API.ventas, { params: filtros }).pipe(manejarErrorHttp());
  }

  resumen() {
    return this.http.get<ResumenVentas>(RUTAS_API.ventas + '/resumen').pipe(manejarErrorHttp());
  }

  opciones() {
    return this.http.get<OpcionesVenta>(RUTAS_API.ventas + '/opciones').pipe(manejarErrorHttp());
  }

  crear(venta: VentaNueva) {
    return this.http
      .post<{ id: number; valorNeto: number }>(RUTAS_API.ventas, venta)
      .pipe(manejarErrorHttp());
  }
}
