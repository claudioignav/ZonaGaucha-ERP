import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CompraService } from './compra.service';
import { RUTAS_API, API_URL } from './api';

let servicio: CompraService;
let http: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  servicio = TestBed.inject(CompraService);
  http = TestBed.inject(HttpTestingController);
});

afterEach(() => http.verify());

it('consulta listado con los filtros de la pantalla', () => {
  servicio.listar({ numeroFactura: 'F1' }).subscribe();

  const peticion = http.expectOne((r) => r.url === RUTAS_API.compras);

  expect(peticion.request.params.get('numeroFactura')).toBe('F1');

  peticion.flush([]);
});

it('consulta resumen y opciones del backend', () => {
  servicio.resumen().subscribe();
  http.expectOne(RUTAS_API.compras + '/resumen').flush({});
  servicio.opciones().subscribe();
  http.expectOne(RUTAS_API.compras + '/opciones').flush({});
});

it('envia el formulario y recibe los totales calculados', () => {
  const datos = {
    numeroLote: '12',
    numeroFactura: 'F1',
    proveedor: 'Proveedor',
    fechaCompra: '2026-10-07',
    tipoPago: 'Tarjeta',
    tipoContenido: 'Ropa',
    productos: [{ producto: 'Camisa', cantidad: 3, precioUnitario: 333.33 }],
    compraBruta: 999.99,
    impuesto: 19,
    tipoImpuesto: 'porcentaje' as const,
  };

  servicio.crear(datos).subscribe();

  const peticion = http.expectOne(RUTAS_API.compras);

  expect(peticion.request.method).toBe('POST');
  expect(peticion.request.body).toEqual(datos);

  peticion.flush({ id: 1 });
});
