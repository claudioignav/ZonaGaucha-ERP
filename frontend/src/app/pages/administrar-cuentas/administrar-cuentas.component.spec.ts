import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { AppModule } from '../../app-module';
import { AdministrarCuentasComponent } from './administrar-cuentas.component';
import { RUTAS_API } from '../../services/api';

const registros = [
  {
    id: 1,
    nombre: 'Ana',
    apellidos: 'Rojas',
    correo: 'ana@correo.cl',
    telefono: '912345678',
    rol: 'Usuario' as const,
    estado: 'Activo' as const,
  },
];
let fixture: ComponentFixture<AdministrarCuentasComponent>;
let http: HttpTestingController;
let navegar: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  http = TestBed.inject(HttpTestingController);
  navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  fixture = TestBed.createComponent(AdministrarCuentasComponent);
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
    else if (peticion.request.url === RUTAS_API.usuarios) peticion.flush(registros);
    else peticion.flush([{ id: 1, nombre: 'Tarjeta' }]);
  }

  await fixture.whenStable();
});

afterEach(() => http.verify());

it('muestra la respuesta recibida por http', () => {
  expect(fixture.nativeElement.textContent).toContain('Ana');
});

it('cambia estado y vuelve a consultar la tabla', () => {
  fixture.componentInstance.cambiarEstado(registros[0]);

  const cambio = http.expectOne(RUTAS_API.usuarios + '/1/eliminar');

  expect(cambio.request.method).toBe('PATCH');

  cambio.flush({ ...registros[0], estado: 'Eliminado' });
  http.expectOne(RUTAS_API.usuarios).flush([{ ...registros[0], estado: 'Eliminado' }]);
  fixture.componentInstance.cambiarEstado(fixture.componentInstance.usuarios[0]);
  http.expectOne(RUTAS_API.usuarios + '/1/restaurar').flush(registros[0]);
  http.expectOne(RUTAS_API.usuarios).flush(registros);

  expect(fixture.componentInstance.usuarios[0].estado).toBe('Activo');
});

it('muestra el error de carga recibido del backend', async () => {
  fixture.componentInstance.cargarUsuarios();
  for (const peticion of http.match(() => true))
    peticion.flush({ error: 'No se pudo cargar' }, { status: 500, statusText: 'Error' });

  await fixture.whenStable();

  expect(fixture.componentInstance.mensajeError).toBe('No se pudo cargar');
});

it('valida y envia el formulario de cuenta', async () => {
  const formulario = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);

  fixture.componentInstance.agregarUsuario(formulario);

  expect(fixture.componentInstance.mensajeError).toContain('Revisa');

  fixture.componentInstance.nuevoUsuario = {
    nombre: 'Luis',
    apellidos: 'Soto',
    correo: 'luis@correo.cl',
    contrasena: crypto.randomUUID(),
    telefono: '912345678',
    rol: 'Usuario',
  };
  fixture.componentInstance.refrescar();
  await fixture.whenStable();
  fixture.componentInstance.agregarUsuario(formulario);

  const crear = http.expectOne(RUTAS_API.usuarios);

  expect(crear.request.body.nombre).toBe('Luis');

  crear.flush({ id: 2 });
  http.expectOne(RUTAS_API.usuarios).flush(registros);

  expect(fixture.componentInstance.nuevoUsuario.nombre).toBe('');
});

it('impide enviar una cuenta con telefono de longitud incorrecta', async () => {
  fixture.componentInstance.nuevoUsuario = {
    nombre: 'Juan',
    apellidos: 'Pérez García',
    correo: 'usuario@gmail.com',
    contrasena: crypto.randomUUID(),
    telefono: '123',
    rol: 'Usuario',
  };
  fixture.componentInstance.refrescar();
  await fixture.whenStable();

  const formulario = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);

  expect(formulario.controls['telefono'].errors).toEqual({ telefono: true });
  fixture.componentInstance.agregarUsuario(formulario);
  http.expectNone(RUTAS_API.usuarios);
  expect(fixture.componentInstance.mensajeError).toContain('Revisa');
});
