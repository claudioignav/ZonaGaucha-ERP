import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { VentaService } from './venta.service';
import { RUTAS_API, API_URL } from './api';

let servicio: VentaService;
let http: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  servicio = TestBed.inject(VentaService);
  http = TestBed.inject(HttpTestingController);
});

afterEach(() => http.verify());

it('consulta listado con los filtros de la pantalla', () => {
  servicio.listar({ numeroFactura: 'F1' }).subscribe();

  const peticion = http.expectOne((r) => r.url === RUTAS_API.ventas);

  expect(peticion.request.params.get('numeroFactura')).toBe('F1');

  peticion.flush([]);
});

it('consulta resumen y opciones del backend', () => {
  servicio.resumen().subscribe();
  http.expectOne(RUTAS_API.ventas + '/resumen').flush({});
  servicio.opciones().subscribe();
  http.expectOne(RUTAS_API.ventas + '/opciones').flush({});
});

it('envia el formulario y recibe los totales calculados', () => {
  const datos = {
    cliente: 'Cliente',
    fechaVenta: '2026-10-07',
    tipoPago: 'Tarjeta',
    plataforma: 'Web',
    lote: '12',
    productos: [{ producto: 'Camisa', cantidad: 2, precioUnitario: 1000 }],
    valorBruto: 2000,
    valorNeto: 2100,
    valorAdicional: 100,
  };

  servicio.crear(datos).subscribe();

  const peticion = http.expectOne(RUTAS_API.ventas);

  expect(peticion.request.method).toBe('POST');
  expect(peticion.request.body).toEqual(datos);

  peticion.flush({ id: 1 });
});
