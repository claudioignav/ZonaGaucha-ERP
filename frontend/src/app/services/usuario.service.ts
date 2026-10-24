import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../models/usuario';
import { RUTAS_API } from './api';
import { manejarErrorHttp } from './errores';

export type UsuarioNuevo = Omit<Usuario, 'id' | 'estado'> & { contrasena: string };

export type UsuarioEdicion = Omit<Usuario, 'id' | 'estado'>;

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);

  listar() {
    return this.http.get<Usuario[]>(RUTAS_API.usuarios).pipe(manejarErrorHttp());
  }

  crear(datos: UsuarioNuevo) {
    return this.http.post<Usuario>(RUTAS_API.usuarios, datos).pipe(manejarErrorHttp());
  }

  actualizar(id: number, datos: UsuarioEdicion) {
    return this.http.put<Usuario>(RUTAS_API.usuarios + '/' + id, datos).pipe(manejarErrorHttp());
  }

  eliminar(id: number) {
    return this.http
      .patch<Usuario>(RUTAS_API.usuarios + '/' + id + '/eliminar', {})
      .pipe(manejarErrorHttp());
  }

  restaurar(id: number) {
    return this.http
      .patch<Usuario>(RUTAS_API.usuarios + '/' + id + '/restaurar', {})
      .pipe(manejarErrorHttp());
  }
}
