import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Credenciales } from '../models/credenciales';
import { RUTAS_API } from './api';
import { manejarErrorHttp } from './errores';
import { RolUsuario, rolValido } from '../models/permisos';

export interface SesionUsuario {
  token: string;
  id: number;
  nombre: string;
  apellidos?: string;
  rol: RolUsuario;
}

interface RespuestaLogin {
  token: string;
  usuario: Omit<SesionUsuario, 'token'>;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  sesion: SesionUsuario | null = null;

  iniciarSesion(credenciales: Credenciales): Observable<SesionUsuario> {
    this.sesion = null;
    return this.http
      .post<RespuestaLogin>(RUTAS_API.login, {
        ...credenciales,
        correo: credenciales.correo.trim().toLowerCase(),
      })
      .pipe(
        manejarErrorHttp(),
        map((respuesta) => {
          if (!rolValido(respuesta.usuario.rol))
            throw new Error('El perfil de la cuenta no tiene acceso al sistema');
          return { ...respuesta.usuario, token: respuesta.token };
        }),
        tap((sesion) => (this.sesion = sesion)),
      );
  }

  cerrarSesion(): void {
    this.sesion = null;
  }

  estaAutenticado(): boolean {
    return this.sesion !== null;
  }
}
