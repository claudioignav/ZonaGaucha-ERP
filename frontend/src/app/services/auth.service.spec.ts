import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { RUTAS_API } from './api';

const claveDePrueba = crypto.getRandomValues(new Uint32Array(4)).join('-');

let servicio: AuthService;
let http: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  servicio = TestBed.inject(AuthService);
  http = TestBed.inject(HttpTestingController);
});

afterEach(() => http.verify());

it('envia credenciales y conserva la identidad respondida', () => {
  servicio.iniciarSesion({ correo: ' ANA@CORREO.CL ', contrasena: claveDePrueba }).subscribe();

  const peticion = http.expectOne(RUTAS_API.login);

  expect(peticion.request.method).toBe('POST');
  expect(peticion.request.body.correo).toBe('ana@correo.cl');

  peticion.flush({ usuario: { id: 7, nombre: 'Ana', rol: 'Usuario' }, token: 'token-real' });

  expect(servicio.sesion?.rol).toBe('Usuario');
  expect(servicio.estaAutenticado()).toBe(true);

  servicio.cerrarSesion();

  expect(servicio.estaAutenticado()).toBe(false);
});

it('muestra el error del backend sin crear sesion', () => {
  let mensaje = '';

  servicio
    .iniciarSesion({ correo: 'ana@correo.cl', contrasena: claveDePrueba + '-incorrecta' })
    .subscribe({ error: (e) => (mensaje = e.message) });
  http
    .expectOne(RUTAS_API.login)
    .flush(
      { error: 'Correo o contraseña incorrectos' },
      { status: 401, statusText: 'Unauthorized' },
    );

  expect(mensaje).toContain('incorrectos');
  expect(servicio.sesion).toBeNull();
});

it('muestra error de conexion cuando falta respuesta del backend', () => {
  let mensaje = '';

  servicio
    .iniciarSesion({ correo: 'ana@correo.cl', contrasena: claveDePrueba })
    .subscribe({ error: (e) => (mensaje = e.message) });
  http.expectOne(RUTAS_API.login).error(new ProgressEvent('error'));

  expect(mensaje).toContain('Intenta nuevamente');
});

it('una respuesta con rol desconocido no conserva una sesion anterior', () => {
  servicio.sesion = { token: 'anterior', id: 1, nombre: 'Ana', rol: 'Administrador' };
  let mensaje = '';
  servicio.iniciarSesion({ correo: 'ana@correo.cl', contrasena: claveDePrueba })
    .subscribe({ error: error => mensaje = error.message });
  http.expectOne(RUTAS_API.login).flush({ usuario: { id: 1, rol: 'Operador' }, token: 'nuevo' });
  expect(servicio.sesion).toBeNull();
  expect(mensaje).toContain('perfil');
});
