import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authGuard, adminGuard } from './auth.guard';
import { AuthService } from './auth.service';

const auth = { estaAutenticado: () => false, sesion: null as { rol: string } | null };

beforeEach(() => {
  auth.sesion = null;
  auth.estaAutenticado = () => false;
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
  });
});

it('envia al login si no hay sesion', () => {
  const resultado = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

  expect(TestBed.inject(Router).serializeUrl(resultado as never)).toBe('/login');
});

it('permite sesion y limita administrar cuentas', () => {
  auth.estaAutenticado = () => true;
  auth.sesion = { rol: 'Administrador' };

  expect(TestBed.runInInjectionContext(() => authGuard({} as never, {} as never))).toBe(true);

  auth.sesion = { rol: 'Usuario' };

  const denegado = TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));

  expect(TestBed.inject(Router).serializeUrl(denegado as never)).toBe('/inventario');

  auth.sesion = { rol: 'Administrador' };

  expect(TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never))).toBe(true);
});
