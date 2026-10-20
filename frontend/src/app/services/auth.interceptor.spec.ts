import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { RUTAS_API, API_URL } from './api';
import { authInterceptor } from './auth.interceptor';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const claveDePrueba = crypto.getRandomValues(new Uint32Array(4)).join('-');

let servicio: AuthService;
let http: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
  });
  servicio = TestBed.inject(AuthService);
  http = TestBed.inject(HttpTestingController);
});

afterEach(() => http.verify());

it('envia token solo a la api y no al login', () => {
  servicio.sesion = { id: 7, nombre: 'Ana', rol: 'Usuario', token: 'token' };

  const cliente = TestBed.inject(HttpClient);

  cliente.get(RUTAS_API.usuarios).subscribe();

  const api = http.expectOne(RUTAS_API.usuarios);

  expect(api.request.headers.get('Authorization')).toBe('Bearer token');

  api.flush([]);
  cliente.get('https://otro.cl/datos').subscribe();

  const externa = http.expectOne('https://otro.cl/datos');

  expect(externa.request.headers.has('Authorization')).toBe(false);

  externa.flush([]);
  servicio.iniciarSesion({ correo: 'a@b.cl', contrasena: claveDePrueba }).subscribe();

  const login = http.expectOne(RUTAS_API.login);

  expect(login.request.headers.has('Authorization')).toBe(false);

  login.flush({ token: 'nuevo', usuario: { id: 7, nombre: 'Ana', rol: 'Usuario' } });
});

it('cierra sesion al expirar el token y conserva sesion ante falta de permisos', () => {
  const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

  servicio.sesion = { id: 7, nombre: 'Ana', rol: 'Usuario', token: 'token' };

  const cliente = TestBed.inject(HttpClient);

  cliente.get(RUTAS_API.usuarios).subscribe({ error: () => {} });
  http
    .expectOne(RUTAS_API.usuarios)
    .flush({ error: 'Sin permisos' }, { status: 403, statusText: 'Forbidden' });

  expect(servicio.sesion).not.toBeNull();

  cliente.get(RUTAS_API.usuarios).subscribe({ error: () => {} });
  http
    .expectOne(RUTAS_API.usuarios)
    .flush({ error: 'Token expirado' }, { status: 401, statusText: 'Unauthorized' });

  expect(servicio.sesion).toBeNull();
  expect(navegar).toHaveBeenCalledWith(['/login']);
});
