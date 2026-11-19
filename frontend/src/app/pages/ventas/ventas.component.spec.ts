import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AppModule } from '../../app-module';
import { VentasComponent } from './ventas.component';
import { RUTAS_API } from '../../services/api';
import { AuthService } from '../../services/auth.service';

const registros = [
  {
    id: 1,
    numeroFactura: 'B1',
    cliente: 'Cliente de Prueba',
    fechaVenta: '2026-10-07T12:00',
    tipoPago: 'Tarjeta',
    plataforma: 'Web',
    lote: '12',
    productos: [{ producto: 'Camisa', cantidad: 2, precioUnitario: 1000, subtotal: 2000 }],
    valorNeto: 2100,
    valorAdicional: 100,
  },
];
let fixture: ComponentFixture<VentasComponent>;
let http: HttpTestingController;
let navegar: ReturnType<typeof vi.spyOn>;
const mostrarDialogoOriginal = HTMLDialogElement.prototype.showModal;
const cerrarDialogoOriginal = HTMLDialogElement.prototype.close;

beforeEach(async () => {
  // jsdom no implementa los metodos nativos del dialogo.
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  TestBed.inject(AuthService).sesion = { token: 'prueba', id: 1, nombre: 'Ana', rol: 'Administrador' };
  http = TestBed.inject(HttpTestingController);
  navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  fixture = TestBed.createComponent(VentasComponent);
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
    else if (peticion.request.url === RUTAS_API.ventas) peticion.flush(registros);
    else peticion.flush([{ id: 1, nombre: 'Tarjeta' }]);
  }

  await fixture.whenStable();
});

afterEach(() => {
  HTMLDialogElement.prototype.showModal = mostrarDialogoOriginal;
  HTMLDialogElement.prototype.close = cerrarDialogoOriginal;
  http.verify();
});

it('muestra la respuesta recibida por http', () => {
  expect(fixture.componentInstance.ventas.length).toBe(1);
});

it('vuelve a consultar al aplicar un filtro', () => {
  fixture.componentInstance.filtros.numeroFactura = 'F1';
  fixture.componentInstance.buscarVentas();

  const peticion = http.expectOne((r) => r.url === RUTAS_API.ventas);

  expect(peticion.request.params.get('numeroFactura')).toBe('F1');

  peticion.flush([]);

  expect(fixture.componentInstance.ventas).toEqual([]);
});

it('envia el rango de fechas elegido como aaaa-mm-dd', () => {
  fixture.componentInstance.rango = { desde: new Date(2026, 10, 1), hasta: new Date(2026, 10, 15) };
  fixture.componentInstance.buscarVentas();

  const peticion = http.expectOne((r) => r.url === RUTAS_API.ventas);

  expect(peticion.request.params.get('desde')).toBe('2026-11-01');
  expect(peticion.request.params.get('hasta')).toBe('2026-11-15');

  peticion.flush([]);
});

it('sin rango no limita las fechas del listado', () => {
  fixture.componentInstance.buscarVentas();

  const peticion = http.expectOne((r) => r.url === RUTAS_API.ventas);

  expect(peticion.request.params.get('desde')).toBe('');
  expect(peticion.request.params.get('hasta')).toBe('');

  peticion.flush([]);
});

it('no consulta si la fecha desde es posterior a la fecha hasta', () => {
  fixture.componentInstance.rango = { desde: new Date(2026, 10, 20), hasta: new Date(2026, 10, 5) };
  fixture.componentInstance.buscarVentas();

  http.expectNone((r) => r.url === RUTAS_API.ventas);
  expect(fixture.componentInstance.mensajeError).toBe('La fecha desde no puede ser posterior a la fecha hasta');
});

it('abre el calendario de rango al hacer clic en el campo de fecha', () => {
  const campo = fixture.nativeElement.querySelector('mat-date-range-input').parentElement as HTMLElement;
  campo.click();
  fixture.detectChanges();

  expect(document.querySelector('mat-calendar')).not.toBeNull();
  expect(document.querySelector('.mat-calendar-previous-button')?.getAttribute('aria-label')).toBe('Mes anterior');
});

it('abre el calendario de rango con la tecla enter', () => {
  const campo = fixture.nativeElement.querySelector('mat-date-range-input').parentElement as HTMLElement;
  campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  fixture.detectChanges();

  expect(document.querySelector('mat-calendar')).not.toBeNull();
});

it('muestra el error de carga recibido del backend', async () => {
  fixture.componentInstance.buscarVentas();
  for (const peticion of http.match(() => true))
    peticion.flush({ error: 'No se pudo cargar' }, { status: 500, statusText: 'Error' });

  await fixture.whenStable();

  expect(fixture.componentInstance.mensajeError).toBe('No se pudo cargar');
});


it('el usuario registra pero no consulta metricas ni ve acciones de modificacion', async () => {
  fixture.destroy();
  TestBed.inject(AuthService).sesion = { token: 'prueba', id: 2, nombre: 'Luis', rol: 'Usuario' };
  const pantalla = TestBed.createComponent(VentasComponent);
  pantalla.detectChanges();
  http.expectNone(RUTAS_API.ventas + '/resumen');
  for (const peticion of http.match(() => true)) {
    if (peticion.request.url.endsWith('/opciones')) peticion.flush({});
    else peticion.flush(registros);
  }
  await pantalla.whenStable();
  expect(pantalla.nativeElement.querySelector('a[href="/ventas/nueva"]')).not.toBeNull();
  expect(pantalla.nativeElement.querySelector('app-tarjeta-resumen')).toBeNull();
  expect(pantalla.nativeElement.querySelector('app-botones-acciones')).toBeNull();
});

it('el administrador conserva metricas y acciones de modificacion', () => {
  expect(fixture.nativeElement.querySelector('app-tarjeta-resumen')).not.toBeNull();
  expect(fixture.nativeElement.querySelector('app-botones-acciones')).not.toBeNull();
});

it.each(['Shopify', 'SHOPIFY', ' shopify ', 'Mercado Libre', 'MercadoLibre', ' MERCADO  LIBRE '])(
  'oculta editar y eliminar para las ventas de %s y conserva su detalle', async (plataforma) => {
    fixture.componentInstance.buscarVentas();
    http.expectOne((r) => r.url === RUTAS_API.ventas).flush([{ ...registros[0], plataforma }]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('button[title="Editar"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('button[title="Eliminar"]')).toBeNull();
    fixture.nativeElement.querySelector('button[title="Ver detalle"]').click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('dialog').open).toBe(true);
    expect(fixture.componentInstance.detalle?.plataforma).toBe(plataforma);
  },
);

it('mantiene las acciones de otras plataformas junto a ventas externas de solo lectura', async () => {
  fixture.componentInstance.buscarVentas();
  http.expectOne((r) => r.url === RUTAS_API.ventas).flush(
    ['Shopify', 'Mercado Libre', 'WhatsApp', 'Instagram', 'Facebook', 'Web'].map((plataforma, i) => ({
      ...registros[0], id: i + 1, plataforma,
    })),
  );
  await fixture.whenStable();

  const filas = Array.from(
    fixture.nativeElement.querySelectorAll('app-tabla-contenido tbody tr'),
  ) as HTMLTableRowElement[];
  expect(filas).toHaveLength(6);
  filas.forEach((fila, i) => {
    expect(fila.querySelector('button[title="Ver detalle"]')).not.toBeNull();
    expect(fila.querySelectorAll('button[title="Editar"], button[title="Eliminar"]'))
      .toHaveLength(i < 2 ? 0 : 2);
  });
});

it('muestra una fila por venta y abre su detalle con precio por linea', () => {
  fixture.componentInstance.buscarVentas();
  http.expectOne((r) => r.url === RUTAS_API.ventas).flush([
    {
      ...registros[0],
      productos: [
        { producto: 'Camisa', cantidad: 2, precioUnitario: 1000, subtotal: 2000 },
        { producto: 'Bolso', cantidad: 1, precioUnitario: null, subtotal: null },
      ],
    },
  ]);
  fixture.detectChanges();

  const filas = fixture.nativeElement.querySelectorAll('tbody tr');

  expect(filas.length).toBe(1);
  expect(filas[0].textContent).toContain('y 1 más');

  fixture.nativeElement.querySelector('button[title="Ver detalle"]').click();
  fixture.detectChanges();

  const dialogo: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');

  expect(dialogo.open).toBe(true);
  expect(dialogo.textContent).toContain('$2.000');
  expect(dialogo.textContent).toContain('Sin precio registrado');

  dialogo.querySelector<HTMLButtonElement>('button')!.click();
  fixture.detectChanges();

  expect(dialogo.open).toBe(false);
  expect(fixture.nativeElement.querySelector('dialog')).toBeNull();
  expect(fixture.componentInstance.detalle).toBeNull();
});

it('cierra el detalle al cancelar el dialogo', () => {
  fixture.nativeElement.querySelector('button[title="Ver detalle"]').click();
  fixture.detectChanges();

  const dialogo: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
  dialogo.dispatchEvent(new Event('cancel', { cancelable: true }));
  fixture.detectChanges();

  expect(dialogo.open).toBe(false);
  expect(fixture.nativeElement.querySelector('dialog')).toBeNull();
  expect(fixture.componentInstance.detalle).toBeNull();
});


it('cambia las filas visibles al avanzar y volver a la primera página', async () => {
  fixture.componentInstance.buscarVentas();
  http.expectOne((r) => r.url === RUTAS_API.ventas).flush(
    Array.from({ length: 21 }, (_, i) => ({ ...registros[0], id: i + 1, numeroFactura: 'B' + (i + 1) })),
  );
  await fixture.whenStable();

  const filas = () => Array.from(fixture.nativeElement.querySelectorAll('app-tabla-contenido tbody tr')) as HTMLTableRowElement[];
  const boton = (texto: string) => (Array.from(fixture.nativeElement.querySelectorAll('app-tabla-contenido button')) as HTMLButtonElement[])
    .find((b) => b.textContent?.trim() === texto)!;

  expect(filas()).toHaveLength(10);
  expect(filas()[0].cells[0].textContent).toBe('B1');
  boton('Siguiente').click();
  await fixture.whenStable();
  expect(filas()).toHaveLength(10);
  expect(filas()[0].cells[0].textContent).toBe('B11');
  boton('Siguiente').click();
  await fixture.whenStable();
  expect(filas()).toHaveLength(1);
  expect(filas()[0].cells[0].textContent).toBe('B21');
  expect(boton('Siguiente').disabled).toBe(true);
  boton('1').click();
  await fixture.whenStable();
  expect(filas()).toHaveLength(10);
  expect(filas()[0].cells[0].textContent).toBe('B1');
});

it('vuelve a la primera página al filtrar y muestra cero cuando no hay resultados', async () => {
  const listado = Array.from({ length: 21 }, (_, i) => ({
    ...registros[0], id: i + 1, numeroFactura: 'B' + (i + 1),
  }));
  fixture.componentInstance.buscarVentas();
  http.expectOne((r) => r.url === RUTAS_API.ventas).flush(listado);
  await fixture.whenStable();
  const siguiente = () => (Array.from(fixture.nativeElement.querySelectorAll('app-tabla-contenido button')) as HTMLButtonElement[])
    .find((b) => b.textContent?.trim() === 'Siguiente')!;
  siguiente().click();
  await fixture.whenStable();

  fixture.componentInstance.filtros.numeroFactura = 'FILTRADA';
  fixture.componentInstance.buscarVentas();
  http.expectOne((r) => r.url === RUTAS_API.ventas).flush(
    listado.map((registro) => ({ ...registro, numeroFactura: 'FILTRADA-' + registro.id })),
  );
  await fixture.whenStable();
  const tabla = fixture.nativeElement.querySelector('app-tabla-contenido');
  expect(tabla.querySelector('tbody tr td').textContent).toBe('FILTRADA-1');
  expect(tabla.textContent.replace(/\s+/g, ' ')).toContain('Mostrando 1-10 de 21 registros');

  fixture.componentInstance.buscarVentas();
  http.expectOne((r) => r.url === RUTAS_API.ventas).flush([]);
  await fixture.whenStable();
  expect(tabla.querySelectorAll('tbody tr')).toHaveLength(0);
  expect(tabla.textContent.replace(/\s+/g, ' ')).toContain('Mostrando 0-0 de 0 registros');
  expect(siguiente().disabled).toBe(true);
});
