import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VentaMensual } from '../models/dashboard';
import { RUTAS_API } from './api';
import { manejarErrorHttp } from './errores';

export interface ResumenDashboard {
  totalVendido: number;
  totalComprado: number;
  utilidades: number;
  productos: number;
  cuentas: number;
  proveedores: number;
  categorias: number;
  productosNuevosMes: number;
  categoriasNuevasMes: number;
  ventasPorMes: VentaMensual[];
  ventasPorPlataforma: { plataforma: string; porcentaje: number }[];
  tendencias: { totalVendido: number[]; totalComprado: number[]; utilidades: number[] };
  variaciones: { totalVendido: number | null; totalComprado: number | null; utilidades: number | null };
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  resumen() {
    return this.http.get<ResumenDashboard>(RUTAS_API.dashboard).pipe(manejarErrorHttp());
  }
}
