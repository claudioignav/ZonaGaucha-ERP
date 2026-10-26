import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AppModule } from '../../app-module';
import { TiposContenidoComponent } from './tipos-contenido.component';
import { RUTAS_API } from '../../services/api';

const registros = [{ id: 1, nombre: 'Ropa' }];
let fixture: ComponentFixture<TiposContenidoComponent>;
let http: HttpTestingController;
let navegar: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  http = TestBed.inject(HttpTestingController);
  navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  fixture = TestBed.createComponent(TiposContenidoComponent);
  fixture.detectChanges();
  for (const peticion of http.match(() => true)) {
    if (peticion.request.url.endsWith('/opciones'))
      peticion.flush({
        proveedores: ['Proveedor de Prueba'],
        tiposPago: ['Tarjeta'],
        tiposContenido: ['Ropa'],
        productos: ['Camisa'],
        plataformas: ['Web'],
        lotes: ['12'],
      });
    else if (peticion.request.url.endsWith('/resumen'))
      peticion.flush({
        fechaActual: '2026-10-07T12:00',
        compraBruta: 1000,
        compraNeta: 1190,
        impuestosTotales: 190,
        ventaNeta: 2100,
        totalAdicional: 100,
        promedioVenta: 20,
        productosDisponibles: 8,
      });
    else if (peticion.request.url === RUTAS_API.catalogos + '/tipos-contenido')
      peticion.flush(registros);
    else peticion.flush([{ id: 1, nombre: 'Tarjeta' }]);
  }

  await fixture.whenStable();
});

afterEach(() => http.verify());

it('muestra la respuesta recibida por http', () => {
  expect(fixture.componentInstance.registros.length).toBe(1);
});

it('guarda edita y elimina usando la api', async () => {
  fixture.componentInstance.guardar(false);

  expect(fixture.componentInstance.mensajeError).toContain('Completa');

  const { id, ...nuevo } = registros[0];

  fixture.componentInstance.nuevo = nuevo;
  fixture.componentInstance.guardar();

  const crear = http.expectOne(RUTAS_API.catalogos + '/tipos-contenido');

  expect(crear.request.method).toBe('POST');

  crear.flush(registros[0]);
  http.expectOne(RUTAS_API.catalogos + '/tipos-contenido').flush(registros);
  fixture.componentInstance.editar(registros[0]);
  fixture.componentInstance.guardarEdicion();

  const editar = http.expectOne(RUTAS_API.catalogos + '/tipos-contenido' + '/1');

  expect(editar.request.method).toBe('PUT');

  editar.flush(registros[0]);
  http.expectOne(RUTAS_API.catalogos + '/tipos-contenido').flush(registros);
  fixture.componentInstance.eliminar(registros[0]);

  const borrar = http.expectOne(RUTAS_API.catalogos + '/tipos-contenido' + '/1');

  expect(borrar.request.method).toBe('DELETE');

  borrar.flush(null);
  http.expectOne(RUTAS_API.catalogos + '/tipos-contenido').flush([]);

  expect(fixture.componentInstance.registros).toEqual([]);
});

it('muestra error del servidor al guardar', async () => {
  const { id, ...nuevo } = registros[0];

  fixture.componentInstance.nuevo = nuevo;
  fixture.componentInstance.guardar();
  http
    .expectOne(RUTAS_API.catalogos + '/tipos-contenido')
    .flush({ error: 'Registro repetido' }, { status: 409, statusText: 'Conflict' });
  await fixture.whenStable();

  expect(fixture.nativeElement.textContent).toContain('Registro repetido');
});

it('muestra el error de carga recibido del backend', async () => {
  fixture.componentInstance.cargar();
  for (const peticion of http.match(() => true))
    peticion.flush({ error: 'No se pudo cargar' }, { status: 500, statusText: 'Error' });

  await fixture.whenStable();

  expect(fixture.componentInstance.mensajeError).toBe('No se pudo cargar');
});
