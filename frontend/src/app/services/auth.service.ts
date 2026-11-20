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

const CLAVE_SESION = 'zg-sesion';

// lee el vencimiento del jwt para no recuperar una sesion caducada
function tokenVigente(token: string): boolean {
  try {
    const datos = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof datos.exp !== 'number' || datos.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function sesionGuardada(): SesionUsuario | null {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION) ?? 'null');
    if (sesion && rolValido(sesion.rol) && tokenVigente(sesion.token)) return sesion;
  } catch {
    // si el contenido no se puede leer se descarta
  }
  localStorage.removeItem(CLAVE_SESION);
  return null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  sesion: SesionUsuario | null = sesionGuardada();

  // guarda la sesion en localStorage para mantenerla al recargar
  iniciarSesion(credenciales: Credenciales): Observable<SesionUsuario> {
    this.cerrarSesion();
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
        tap((sesion) => {
          this.sesion = sesion;
          localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
        }),
      );
  }

  cerrarSesion(): void {
    this.sesion = null;
    localStorage.removeItem(CLAVE_SESION);
  }

  estaAutenticado(): boolean {
    return this.sesion !== null;
  }
}
