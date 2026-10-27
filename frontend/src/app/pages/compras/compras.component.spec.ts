import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AppModule } from '../../app-module';
import { ComprasComponent } from './compras.component';
import { RUTAS_API } from '../../services/api';
import { AuthService } from '../../services/auth.service';

const registros = [
  {
    id: 1,
    numeroFactura: 'F1',
    numeroLote: '12',
    proveedor: 'Proveedor de Prueba',
    fechaCompra: '2026-10-07T12:00',
    tipoPago: 'Tarjeta',
    tipoContenido: 'Ropa',
    productos: [{ producto: 'Camisa', cantidad: 10 }],
    compraBruta: 1000,
    impuesto: 190,
    compraNeta: 1190,
  },
];
let fixture: ComponentFixture<ComprasComponent>;
let http: HttpTestingController;
let navegar: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  TestBed.inject(AuthService).sesion = { token: 'prueba', id: 1, nombre: 'Ana', rol: 'Administrador' };
  http = TestBed.inject(HttpTestingController);
  navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  fixture = TestBed.createComponent(ComprasComponent);
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
    else if (peticion.request.url === RUTAS_API.compras) peticion.flush(registros);
    else peticion.flush([{ id: 1, nombre: 'Tarjeta' }]);
  }

  await fixture.whenStable();
});

afterEach(() => http.verify());

it('muestra la respuesta recibida por http', () => {
  expect(fixture.componentInstance.compras.length).toBe(1);
});

it('vuelve a consultar al aplicar un filtro', () => {
  fixture.componentInstance.filtros.numeroFactura = 'F1';
  fixture.componentInstance.cargarCompras();

  const peticion = http.expectOne((r) => r.url === RUTAS_API.compras);

  expect(peticion.request.params.get('numeroFactura')).toBe('F1');

  peticion.flush([]);

  expect(fixture.componentInstance.compras).toEqual([]);
});

it('muestra el error de carga recibido del backend', async () => {
  fixture.componentInstance.cargarCompras();
  for (const peticion of http.match(() => true))
    peticion.flush({ error: 'No se pudo cargar' }, { status: 500, statusText: 'Error' });

  await fixture.whenStable();

  expect(fixture.componentInstance.mensajeError).toBe('No se pudo cargar');
});

it('muestra la fecha y los montos entregados por la API con sus formatos', () => {
  fixture.detectChanges();

  const texto = fixture.nativeElement.textContent;

  expect(texto).toContain('Oct 7, 2026 12:00');
  expect(texto).toContain('$1.000');
  expect(texto).toContain('$1.190');
});


it('el usuario registra pero no consulta metricas ni ve acciones de modificacion', async () => {
  fixture.destroy();
  TestBed.inject(AuthService).sesion = { token: 'prueba', id: 2, nombre: 'Luis', rol: 'Usuario' };
  const pantalla = TestBed.createComponent(ComprasComponent);
  pantalla.detectChanges();
  http.expectNone(RUTAS_API.compras + '/resumen');
  for (const peticion of http.match(() => true)) {
    if (peticion.request.url.endsWith('/opciones')) peticion.flush({});
    else peticion.flush(registros);
  }
  await pantalla.whenStable();
  expect(pantalla.nativeElement.querySelector('a[href="/compras/nueva"]')).not.toBeNull();
  expect(pantalla.nativeElement.querySelector('app-tarjeta-resumen')).toBeNull();
  expect(pantalla.nativeElement.querySelector('app-botones-acciones')).toBeNull();
});

it('el administrador conserva metricas y acciones de modificacion', () => {
  expect(fixture.nativeElement.querySelector('app-tarjeta-resumen')).not.toBeNull();
  expect(fixture.nativeElement.querySelector('app-botones-acciones')).not.toBeNull();
});

it('muestra una fila por compra con sus unidades y el resto de productos', () => {
  fixture.componentInstance.cargarCompras();
  http.expectOne((r) => r.url === RUTAS_API.compras).flush([
    {
      ...registros[0],
      productos: [
        { producto: 'Camisa', cantidad: 10 },
        { producto: 'Poncho', cantidad: 5 },
      ],
    },
  ]);
  fixture.detectChanges();

  const filas = fixture.nativeElement.querySelectorAll('tbody tr');

  expect(filas.length).toBe(1);
  expect(filas[0].textContent).toContain('y 1 más');
  expect(filas[0].textContent).toContain('15');
});

it('abre el detalle de la compra con precio y subtotal por linea', () => {
  fixture.componentInstance.cargarCompras();
  http.expectOne((r) => r.url === RUTAS_API.compras).flush([
    {
      ...registros[0],
      productos: [
        { producto: 'Camisa', cantidad: 10, precioUnitario: 100, subtotal: 1000 },
        { producto: 'Poncho', cantidad: 2, precioUnitario: null, subtotal: null },
      ],
    },
  ]);
  fixture.detectChanges();
  fixture.nativeElement.querySelector('button[title="Ver detalle"]').click();
  fixture.detectChanges();

  const dialogo = fixture.nativeElement.querySelector('[role="dialog"]');

  expect(dialogo.textContent).toContain('Camisa');
  expect(dialogo.textContent).toContain('$1.000');
  expect(dialogo.textContent).toContain('Sin precio registrado');

  dialogo.querySelector('button').click();
  fixture.detectChanges();

  expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
});


it('cambia las filas visibles al avanzar y volver a la primera página', async () => {
  fixture.componentInstance.cargarCompras();
  http.expectOne((r) => r.url === RUTAS_API.compras).flush(
    Array.from({ length: 21 }, (_, i) => ({ ...registros[0], id: i + 1, numeroFactura: 'F' + (i + 1) })),
  );
  await fixture.whenStable();

  const filas = () => Array.from(fixture.nativeElement.querySelectorAll('app-tabla-contenido tbody tr')) as HTMLTableRowElement[];
  const boton = (texto: string) => (Array.from(fixture.nativeElement.querySelectorAll('app-tabla-contenido button')) as HTMLButtonElement[])
    .find((b) => b.textContent?.trim() === texto)!;

  expect(filas()).toHaveLength(10);
  expect(filas()[0].cells[0].textContent).toBe('F1');
  boton('Siguiente').click();
  await fixture.whenStable();
  expect(filas()).toHaveLength(10);
  expect(filas()[0].cells[0].textContent).toBe('F11');
  boton('Siguiente').click();
  await fixture.whenStable();
  expect(filas()).toHaveLength(1);
  expect(filas()[0].cells[0].textContent).toBe('F21');
  expect(boton('Siguiente').disabled).toBe(true);
  boton('1').click();
  await fixture.whenStable();
  expect(filas()).toHaveLength(10);
  expect(filas()[0].cells[0].textContent).toBe('F1');
});

it('vuelve a la primera página al filtrar y muestra cero cuando no hay resultados', async () => {
  const listado = Array.from({ length: 21 }, (_, i) => ({
    ...registros[0], id: i + 1, numeroFactura: 'F' + (i + 1),
  }));
  fixture.componentInstance.cargarCompras();
  http.expectOne((r) => r.url === RUTAS_API.compras).flush(listado);
  await fixture.whenStable();
  const siguiente = () => (Array.from(fixture.nativeElement.querySelectorAll('app-tabla-contenido button')) as HTMLButtonElement[])
    .find((b) => b.textContent?.trim() === 'Siguiente')!;
  siguiente().click();
  await fixture.whenStable();

  fixture.componentInstance.filtros.numeroFactura = 'FILTRADA';
  fixture.componentInstance.cargarCompras();
  http.expectOne((r) => r.url === RUTAS_API.compras).flush(
    listado.map((registro) => ({ ...registro, numeroFactura: 'FILTRADA-' + registro.id })),
  );
  await fixture.whenStable();
  const tabla = fixture.nativeElement.querySelector('app-tabla-contenido');
  expect(tabla.querySelector('tbody tr td').textContent).toBe('FILTRADA-1');
  expect(tabla.textContent.replace(/\s+/g, ' ')).toContain('Mostrando 1-10 de 21 registros');

  fixture.componentInstance.cargarCompras();
  http.expectOne((r) => r.url === RUTAS_API.compras).flush([]);
  await fixture.whenStable();
  expect(tabla.querySelectorAll('tbody tr')).toHaveLength(0);
  expect(tabla.textContent.replace(/\s+/g, ' ')).toContain('Mostrando 0-0 de 0 registros');
  expect(siguiente().disabled).toBe(true);
});
