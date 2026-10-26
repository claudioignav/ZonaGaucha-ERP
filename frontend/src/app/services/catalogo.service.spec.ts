import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CatalogoService } from './catalogo.service';
import { RUTAS_API, API_URL } from './api';

let servicio: CatalogoService;
let http: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  servicio = TestBed.inject(CatalogoService);
  http = TestBed.inject(HttpTestingController);
});

afterEach(() => http.verify());

it('lista crea edita y elimina en la ruta del catalogo elegido', () => {
  const url = RUTAS_API.catalogos + '/tipos-pago';

  servicio.listar('tipos-pago').subscribe();
  http.expectOne(url).flush([]);
  servicio.crear('tipos-pago', { nombre: 'Tarjeta' }).subscribe();

  const crear = http.expectOne(url);

  expect(crear.request.method).toBe('POST');

  crear.flush({ id: 3, nombre: 'Tarjeta' });
  servicio.actualizar('tipos-pago', 3, { nombre: 'Efectivo' }).subscribe();

  const editar = http.expectOne(url + '/3');

  expect(editar.request.method).toBe('PUT');

  editar.flush({ id: 3, nombre: 'Efectivo' });
  servicio.eliminar('tipos-pago', 3).subscribe();

  const eliminar = http.expectOne(url + '/3');

  expect(eliminar.request.method).toBe('DELETE');

  eliminar.flush(null);
});

it('conserva categoria y medios de pago elegidos en el formulario', () => {
  servicio.crear('productos', { nombre: 'Camisa', categoria: 'Ropa', precioVenta: 12990 }).subscribe();

  const producto = http.expectOne(RUTAS_API.catalogos + '/productos');

  expect(producto.request.body.categoria).toBe('Ropa');

  producto.flush({ id: 1 });
  servicio.crear('plataformas', { nombre: 'Web', tiposPago: ['Tarjeta'] }).subscribe();

  const plataforma = http.expectOne(RUTAS_API.catalogos + '/plataformas');

  expect(plataforma.request.body.tiposPago).toEqual(['Tarjeta']);

  plataforma.flush({ id: 2 });
});
