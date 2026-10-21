import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { rolValido, rutaInicio } from '../models/permisos';

export const authGuard: CanActivateFn = () => {
  const sesion = inject(AuthService).sesion;
  return (sesion !== null && rolValido(sesion.rol)) || inject(Router).createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () =>
  inject(AuthService).sesion?.rol === 'Administrador' ||
  inject(Router).createUrlTree([rutaInicio(inject(AuthService).sesion?.rol)]);
