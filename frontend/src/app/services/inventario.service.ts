import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Lote, ResumenInventario } from '../models/lote';
import { RUTAS_API } from './api';
import { manejarErrorHttp } from './errores';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);

  lotes() {
    return this.http.get<Lote[]>(RUTAS_API.inventario + '/lotes').pipe(manejarErrorHttp());
  }

  resumen() {
    return this.http
      .get<ResumenInventario>(RUTAS_API.inventario + '/resumen')
      .pipe(manejarErrorHttp());
  }
}
