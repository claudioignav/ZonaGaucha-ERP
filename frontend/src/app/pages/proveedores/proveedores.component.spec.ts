import { By } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AppModule } from '../../app-module';
import { ProveedoresComponent } from './proveedores.component';
import { RUTAS_API } from '../../services/api';

const registros = [
  {
    id: 1,
    razonSocial: 'Proveedor de Prueba',
    rut: '12345678-5',
    telefono: '912345678',
    correo: 'proveedor@correo.cl',
  },
];
let fixture: ComponentFixture<ProveedoresComponent>;
let http: HttpTestingController;
let navegar: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  http = TestBed.inject(HttpTestingController);
  navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  fixture = TestBed.createComponent(ProveedoresComponent);
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
    else if (peticion.request.url === RUTAS_API.catalogos + '/proveedores')
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

  const crear = http.expectOne(RUTAS_API.catalogos + '/proveedores');

  expect(crear.request.method).toBe('POST');

  crear.flush(registros[0]);
  http.expectOne(RUTAS_API.catalogos + '/proveedores').flush(registros);
  fixture.componentInstance.editar(registros[0]);
  fixture.componentInstance.guardarEdicion();

  const editar = http.expectOne(RUTAS_API.catalogos + '/proveedores' + '/1');

  expect(editar.request.method).toBe('PUT');

  editar.flush(registros[0]);
  http.expectOne(RUTAS_API.catalogos + '/proveedores').flush(registros);
  fixture.componentInstance.eliminar(registros[0]);

  const borrar = http.expectOne(RUTAS_API.catalogos + '/proveedores' + '/1');

  expect(borrar.request.method).toBe('DELETE');

  borrar.flush(null);
  http.expectOne(RUTAS_API.catalogos + '/proveedores').flush([]);

  expect(fixture.componentInstance.registros).toEqual([]);
});

it('muestra error del servidor al guardar', async () => {
  const { id, ...nuevo } = registros[0];

  fixture.componentInstance.nuevo = nuevo;
  fixture.componentInstance.guardar();
  http
    .expectOne(RUTAS_API.catalogos + '/proveedores')
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

it('permite guardar un proveedor con telefono de otro formato', async () => {
  fixture.componentInstance.nuevo = {
    razonSocial: 'Importadora Global S.A.',
    rut: '12345678-5',
    telefono: '+54 11 1234 5678',
    correo: 'contacto@empresa.com',
  };
  fixture.changeDetectorRef.markForCheck();
  await fixture.whenStable();

  const formulario = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);

  expect(formulario.controls['telefono'].valid).toBe(true);
  fixture.componentInstance.guardar(formulario.valid);

  const peticion = http.expectOne(RUTAS_API.catalogos + '/proveedores');

  expect(peticion.request.body.telefono).toBe('+54 11 1234 5678');
  peticion.flush({ id: 2, ...fixture.componentInstance.nuevo });
  http.expectOne(RUTAS_API.catalogos + '/proveedores').flush(registros);
});
