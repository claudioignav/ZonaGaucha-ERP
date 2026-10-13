import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EstadoService } from './estado.service';
import { RUTAS_API, API_URL } from './api';

let servicio: EstadoService;
let http: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  servicio = TestBed.inject(EstadoService);
  http = TestBed.inject(HttpTestingController);
});

afterEach(() => http.verify());

it('consulta la ruta de estado del backend', () => {
  let mensaje = '';

  servicio.consultar().subscribe((r) => (mensaje = r.mensaje));

  const peticion = http.expectOne(API_URL + '/');

  expect(peticion.request.method).toBe('GET');

  peticion.flush({ mensaje: 'api funcionando' });

  expect(mensaje).toBe('api funcionando');
});
