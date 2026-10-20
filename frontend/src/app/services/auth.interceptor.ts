import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL, RUTAS_API } from './api';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const esApi = peticion.url.startsWith(API_URL + '/');
  const esLogin = peticion.url === RUTAS_API.login;
  const token = auth.sesion?.token;
  const solicitud =
    esApi && !esLogin && token
      ? peticion.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
      : peticion;

  return siguiente(solicitud).pipe(
    catchError((error) => {
      if (esApi && !esLogin && error.status === 401) {
        auth.cerrarSesion();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
