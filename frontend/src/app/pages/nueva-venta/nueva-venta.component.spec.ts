import { By } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AppModule } from '../../app-module';
import { NuevaVentaComponent } from './nueva-venta.component';
import { RUTAS_API } from '../../services/api';

const registros = [
  {
    id: 1,
    numeroFactura: 'B1',
    cliente: 'Cliente de Prueba',
    fechaVenta: '2026-10-07T12:00',
    tipoPago: 'Tarjeta',
    plataforma: 'Web',
    lote: '12',
    productos: [{ producto: 'Camisa', cantidad: 2, precioUnitario: 1000 }],
    valorNeto: 2100,
    valorAdicional: 100,
  },
];
let fixture: ComponentFixture<NuevaVentaComponent>;
let http: HttpTestingController;
let navegar: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  http = TestBed.inject(HttpTestingController);
  navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  fixture = TestBed.createComponent(NuevaVentaComponent);
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
        preciosProductos: [],
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
    else if (peticion.request.url === RUTAS_API.ventas) peticion.flush(registros);
    else peticion.flush([{ id: 1, nombre: 'Tarjeta' }]);
  }

  await fixture.whenStable();
});

afterEach(() => http.verify());

it('muestra la respuesta recibida por http', () => {
  expect(fixture.componentInstance.opciones.productos).toEqual(['Camisa']);
});

it('envia formulario y navega despues de guardar', async () => {
  fixture.componentInstance.venta = registros[0];
  fixture.componentInstance.guardarVenta();

  const guardar = http.expectOne(RUTAS_API.ventas);

  expect(guardar.request.method).toBe('POST');

  guardar.flush({ id: 1 });

  expect(navegar).toHaveBeenCalledWith(['/ventas']);
});

it('muestra el error al rechazar el registro', async () => {
  fixture.componentInstance.guardarVenta();
  http
    .expectOne(RUTAS_API.ventas)
    .flush({ error: 'Datos no validos' }, { status: 400, statusText: 'Bad Request' });
  await fixture.whenStable();

  expect(fixture.componentInstance.mensajeError).toBe('Datos no validos');
  expect(navegar).not.toHaveBeenCalled();
});

it('acepta la razon social del placeholder como cliente', async () => {
  fixture.componentInstance.venta.cliente = 'Distribuidora del Norte S.A.';
  fixture.componentInstance.refrescar();
  await fixture.whenStable();

  const formulario = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);

  expect(formulario.controls['cliente'].valid).toBe(true);
});

it('carga el precio de catalogo al elegir producto y el usuario puede cambiarlo', () => {
  const componente = fixture.componentInstance;

  componente.opciones = {
    ...componente.opciones,
    productos: ['Camisa'],
    preciosProductos: [{ nombre: 'Camisa', precioVenta: 12990 }],
  };
  componente.venta.productos = [{ producto: '', cantidad: 1, precioUnitario: null }];
  fixture.detectChanges();

  const select = fixture.nativeElement.querySelector('select[aria-label="Seleccionar producto..."]');

  select.value = 'Camisa';
  select.dispatchEvent(new Event('change'));

  expect(componente.venta.productos[0].precioUnitario).toBe(12990);

  componente.venta.productos[0].precioUnitario = 11990;

  expect(componente.opciones.preciosProductos?.[0]?.precioVenta).toBe(12990);
});

it('calcula bruto y neto desde las lineas y envia el bruto calculado', () => {
  const componente = fixture.componentInstance;

  componente.venta = {
    ...registros[0],
    productos: [
      { producto: 'Camisa', cantidad: 2, precioUnitario: 1000 },
      { producto: 'Bolso', cantidad: 1, precioUnitario: 0.5 },
    ],
    valorAdicional: 100,
  };

  expect(componente.valorBruto).toBe(2000.5);
  expect(componente.valorNeto).toBe(2100.5);

  componente.guardarVenta();

  const guardar = http.expectOne(RUTAS_API.ventas);

  expect(guardar.request.body).toMatchObject({ valorBruto: 2000.5, valorNeto: 2100.5 });
  expect(guardar.request.body.productos[1]).toEqual({
    producto: 'Bolso',
    cantidad: 1,
    precioUnitario: 0.5,
  });

  guardar.flush({ id: 1 });
});

it('no considera completas las lineas sin precio', () => {
  const componente = fixture.componentInstance;

  componente.venta.productos = [{ producto: 'Camisa', cantidad: 1, precioUnitario: null }];

  expect(componente.lineasCompletas).toBe(false);

  componente.venta.productos[0].precioUnitario = 0;

  expect(componente.lineasCompletas).toBe(false);

  componente.venta.productos[0].precioUnitario = 1500;

  expect(componente.lineasCompletas).toBe(true);
});
