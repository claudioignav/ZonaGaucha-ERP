import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { rolValido, rutaInicio } from '../models/permisos';

// deja entrar solo con una sesion activa
export const authGuard: CanActivateFn = () => {
  const sesion = inject(AuthService).sesion;
  return (sesion !== null && rolValido(sesion.rol)) || inject(Router).createUrlTree(['/login']);
};

// si no es administrador lo manda a la pantalla inicial de su rol
export const adminGuard: CanActivateFn = () =>
  inject(AuthService).sesion?.rol === 'Administrador' ||
  inject(Router).createUrlTree([rutaInicio(inject(AuthService).sesion?.rol)]);
