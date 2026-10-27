import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CategoriaProducto } from '../models/categoria-producto';
import { Plataforma } from '../models/plataforma';
import { Producto } from '../models/producto';
import { Proveedor } from '../models/proveedor';
import { TipoContenido } from '../models/tipo-contenido';
import { TipoPago } from '../models/tipo-pago';
import { RUTAS_API } from './api';
import { manejarErrorHttp } from './errores';

export interface MapaCatalogos {
  productos: Producto;
  'categorias-producto': CategoriaProducto;
  proveedores: Proveedor;
  'tipos-pago': TipoPago;
  plataformas: Plataforma;
  'tipos-contenido': TipoContenido;
}

export type TipoCatalogo = keyof MapaCatalogos;

export type DatosCatalogo<K extends TipoCatalogo> = Omit<MapaCatalogos[K], 'id'>;

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);

  urlDe(tipo: TipoCatalogo) {
    return RUTAS_API.catalogos + '/' + tipo;
  }

  listar<K extends TipoCatalogo>(tipo: K) {
    return this.http.get<MapaCatalogos[K][]>(this.urlDe(tipo)).pipe(manejarErrorHttp());
  }

  crear<K extends TipoCatalogo>(tipo: K, datos: DatosCatalogo<K>) {
    return this.http.post<MapaCatalogos[K]>(this.urlDe(tipo), datos).pipe(manejarErrorHttp());
  }

  actualizar<K extends TipoCatalogo>(tipo: K, id: number, datos: DatosCatalogo<K>) {
    return this.http
      .put<MapaCatalogos[K]>(this.urlDe(tipo) + '/' + id, datos)
      .pipe(manejarErrorHttp());
  }

  eliminar(tipo: TipoCatalogo, id: number) {
    return this.http.delete<void>(this.urlDe(tipo) + '/' + id).pipe(manejarErrorHttp());
  }
}
