import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AppModule } from '../../app-module';
import { NuevaCompraComponent } from './nueva-compra.component';
import { RUTAS_API } from '../../services/api';

const registros = [
  {
    id: 1,
    numeroFactura: 'F1',
    numeroLote: '12',
    proveedor: 'Proveedor de Prueba',
    fechaCompra: '2026-10-07T12:00',
    tipoPago: 'Tarjeta',
    tipoContenido: 'Ropa',
    productos: [{ producto: 'Camisa', cantidad: 10, precioUnitario: 100 }],
    compraBruta: 1000,
    impuesto: 190,
    compraNeta: 1190,
  },
];
let fixture: ComponentFixture<NuevaCompraComponent>;
let http: HttpTestingController;
let navegar: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  http = TestBed.inject(HttpTestingController);
  navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  fixture = TestBed.createComponent(NuevaCompraComponent);
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
  expect(fixture.componentInstance.opciones.productos).toEqual(['Camisa']);
});

it('suma las lineas y calcula el impuesto en porcentaje', () => {
  const componente = fixture.componentInstance;

  componente.compra.productos = [
    { producto: 'Camisa', cantidad: 3, precioUnitario: 1000 },
    { producto: 'Poncho', cantidad: 1, precioUnitario: 0.5 },
  ];
  componente.compra.impuesto = '19%';

  expect(componente.compraBruta).toBe(3000.5);
  expect(componente.compraNeta).toBe(3570.6);
});

it('no carga un precio al elegir producto; el precio se escribe a mano', () => {
  const linea = fixture.componentInstance.compra.productos[0];

  linea.producto = 'Camisa';

  expect(linea.precioUnitario).toBeNull();
  expect(fixture.componentInstance.lineasCompletas).toBe(false);
});

it('envia las lineas con precio, la bruta y el tipo de impuesto', () => {
  const componente = fixture.componentInstance;

  componente.compra = {
    ...registros[0],
    productos: [{ producto: 'Camisa', cantidad: 10, precioUnitario: 100 }],
    impuesto: '19%',
  };
  componente.guardarCompra();

  const guardar = http.expectOne(RUTAS_API.compras);

  expect(guardar.request.method).toBe('POST');
  expect(guardar.request.body).toMatchObject({
    compraBruta: 1000,
    impuesto: 19,
    tipoImpuesto: 'porcentaje',
    productos: [{ producto: 'Camisa', cantidad: 10, precioUnitario: 100 }],
  });

  guardar.flush({ id: 1 });

  expect(navegar).toHaveBeenCalledWith(['/compras']);
});

it('un impuesto con texto invalido no permite guardar y el monto con signo pesos se envia tal cual', () => {
  const componente = fixture.componentInstance;

  componente.compra.productos = [{ producto: 'Camisa', cantidad: 1, precioUnitario: 1000 }];
  componente.compra.impuesto = 'abc';

  expect(componente.impuestoValido).toBe(false);

  componente.compra.impuesto = '$190';

  expect(componente.impuestoValido).toBe(true);
  expect(componente.compraNeta).toBe(1190);

  componente.guardarCompra();

  const guardar = http.expectOne(RUTAS_API.compras);

  expect(guardar.request.body).toMatchObject({ impuesto: 190, tipoImpuesto: 'monto' });

  guardar.flush({ id: 1 });
});

it('muestra el error al rechazar el registro', async () => {
  fixture.componentInstance.guardarCompra();
  http
    .expectOne(RUTAS_API.compras)
    .flush({ error: 'Datos no validos' }, { status: 400, statusText: 'Bad Request' });
  await fixture.whenStable();

  expect(fixture.componentInstance.mensajeError).toBe('Datos no validos');
  expect(navegar).not.toHaveBeenCalled();
});
