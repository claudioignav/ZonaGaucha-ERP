import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authGuard, adminGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Component({ template: '' })
class PantallaPrueba {}

const auth = { sesion: null as { rol: string } | null };

beforeEach(() => {
  auth.sesion = null;
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: auth },
      provideRouter([
        { path: 'login', component: PantallaPrueba },
        { path: '', canActivate: [authGuard], canActivateChild: [authGuard], children: [
          { path: 'dashboard', component: PantallaPrueba, canActivate: [adminGuard] },
          { path: 'cuentas', component: PantallaPrueba, canActivate: [adminGuard] },
          { path: 'inventario', component: PantallaPrueba },
          { path: 'catalogos', component: PantallaPrueba },
        ] },
      ]),
    ],
  });
});

it.each(['/dashboard', '/cuentas'])('el usuario no puede entrar directamente a %s', async ruta => {
  auth.sesion = { rol: 'Usuario' };
  const router = TestBed.inject(Router);
  await router.navigateByUrl(ruta);
  expect(router.url).toBe('/inventario');
});

it.each(['/dashboard', '/cuentas'])('el administrador puede entrar a %s', async ruta => {
  auth.sesion = { rol: 'Administrador' };
  const router = TestBed.inject(Router);
  await router.navigateByUrl(ruta);
  expect(router.url).toBe(ruta);
});

it('la navegacion entre modulos vuelve a comprobar la sesion', async () => {
  auth.sesion = { rol: 'Usuario' };
  const router = TestBed.inject(Router);
  await router.navigateByUrl('/inventario');
  auth.sesion = null;
  await router.navigateByUrl('/catalogos');
  expect(router.url).toBe('/login');
});

it('el permiso de administrador sin sesion envia al login', () => {
  const resultado = TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
  expect(TestBed.inject(Router).serializeUrl(resultado as never)).toBe('/login');
});
