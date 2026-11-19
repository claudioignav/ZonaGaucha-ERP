import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { RUTAS_API } from './api';

const claveDePrueba = crypto.getRandomValues(new Uint32Array(4)).join('-');

let servicio: AuthService;
let http: HttpTestingController;

// arma un jwt de prueba con el vencimiento indicado en segundos
const jwt = (exp?: number) =>
  ['e30', btoa(JSON.stringify(exp === undefined ? {} : { exp })).replace(/=+$/, ''), 'firma'].join('.');
const enSegundos = (segundos: number) => Math.floor(Date.now() / 1000) + segundos;
const nuevoServicio = () => TestBed.runInInjectionContext(() => new AuthService());

beforeEach(() => {
  localStorage.clear();
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

it('recupera la sesion al recargar mientras el token esta vigente', () => {
  const token = jwt(enSegundos(3600));
  servicio.iniciarSesion({ correo: 'ana@correo.cl', contrasena: claveDePrueba }).subscribe();
  http.expectOne(RUTAS_API.login).flush({ usuario: { id: 7, nombre: 'Ana', rol: 'Administrador' }, token });

  const recargado = nuevoServicio();

  expect(recargado.sesion).toEqual({ id: 7, nombre: 'Ana', rol: 'Administrador', token });
  expect(recargado.estaAutenticado()).toBe(true);
});

it('cerrar sesion borra la sesion guardada', () => {
  localStorage.setItem('zg-sesion', JSON.stringify({ id: 7, nombre: 'Ana', rol: 'Usuario', token: jwt() }));
  const recargado = nuevoServicio();
  expect(recargado.estaAutenticado()).toBe(true);

  recargado.cerrarSesion();

  expect(localStorage.getItem('zg-sesion')).toBeNull();
  expect(nuevoServicio().sesion).toBeNull();
});

it('descarta una sesion guardada vencida, danada o con rol desconocido', () => {
  const guardadas = [
    JSON.stringify({ id: 7, nombre: 'Ana', rol: 'Usuario', token: jwt(enSegundos(-60)) }),
    JSON.stringify({ id: 7, nombre: 'Ana', rol: 'Usuario', token: 'sin-formato' }),
    JSON.stringify({ id: 7, nombre: 'Ana', rol: 'Operador', token: jwt(enSegundos(3600)) }),
    '{no es json',
  ];
  for (const guardada of guardadas) {
    localStorage.setItem('zg-sesion', guardada);

    expect(nuevoServicio().sesion).toBeNull();
    expect(localStorage.getItem('zg-sesion')).toBeNull();
  }
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
