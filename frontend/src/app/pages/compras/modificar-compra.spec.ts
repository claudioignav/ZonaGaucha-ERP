import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { AppModule } from '../../app-module';
import { ComprasComponent } from './compras.component';
import { RUTAS_API } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { Compra } from '../../models/compra';

const compra: Compra = {
  id: 7,
  numeroFactura: 'F-100',
  numeroLote: '12',
  proveedor: 'Textil SpA',
  fechaCompra: '2026-10-05T12:00',
  tipoPago: 'Efectivo',
  tipoContenido: 'Ropa',
  productos: [{ producto: 'Poncho', cantidad: 25 }],
  compraBruta: 100000,
  impuesto: 19000,
  compraNeta: 119000,
};

let fixture: ComponentFixture<ComprasComponent>;
let pantalla: ComprasComponent;
let http: HttpTestingController;

const responderCarga = () => {
  for (const peticion of http.match(() => true)) {
    if (peticion.request.url.endsWith('/opciones'))
      peticion.flush({
        proveedores: ['Textil SpA', 'Lanas del Sur'],
        tiposPago: ['Efectivo', 'Transferencia'],
        tiposContenido: ['Ropa'],
        productos: ['Poncho'],
      });
    else if (peticion.request.url.endsWith('/resumen'))
      peticion.flush({ fechaActual: '', compraBruta: 0, compraNeta: 0, impuestosTotales: 0 });
    else peticion.flush([compra]);
  }
};

beforeEach(async () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  TestBed.inject(AuthService).sesion = { token: 'prueba', id: 1, nombre: 'Ana', rol: 'Administrador' };
  http = TestBed.inject(HttpTestingController);
  fixture = TestBed.createComponent(ComprasComponent);
  pantalla = fixture.componentInstance;
  fixture.detectChanges();
  responderCarga();
  await fixture.whenStable();
});

afterEach(() => http.verify());

describe('modificar compra', () => {
  it('el botón editar abre el formulario con los datos de la factura', () => {
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button[title="Editar"]').click();
    fixture.detectChanges();

    expect(pantalla.edicion).toEqual({
      id: 7,
      numeroFactura: 'F-100',
      proveedor: 'Textil SpA',
      tipoPago: 'Efectivo',
      compraBruta: 100000,
      fechaCompra: '2026-10-05',
      impuesto: 19000,
    });
    expect(fixture.nativeElement.textContent).toContain('Modificar compra F-100');
  });

  it('la vista previa del neto cambia con el impuesto que se escribe', () => {
    pantalla.abrirEdicion(compra);

    pantalla.edicion!.impuesto = '10%';
    expect(pantalla.netoEdicion).toBe(110000);

    pantalla.edicion!.impuesto = '20000';
    expect(pantalla.netoEdicion).toBe(120000);
  });

  it('un impuesto con texto no válido no se puede guardar', () => {
    pantalla.abrirEdicion(compra);
    pantalla.edicion!.impuesto = 'abc';

    expect(pantalla.impuestoEdicionValido).toBe(false);
    pantalla.guardarEdicion();
    http.expectNone((r) => r.method === 'PUT');
  });

  it('guarda los cambios, cierra el formulario y vuelve a cargar las compras', () => {
    pantalla.abrirEdicion(compra);
    pantalla.edicion!.numeroFactura = 'F-200';
    pantalla.edicion!.proveedor = 'Lanas del Sur';
    pantalla.edicion!.impuesto = '19%';
    pantalla.guardarEdicion();

    const peticion = http.expectOne((r) => r.method === 'PUT');
    expect(peticion.request.url).toBe(`${RUTAS_API.compras}/7`);
    expect(peticion.request.body).toEqual({
      numeroFactura: 'F-200',
      proveedor: 'Lanas del Sur',
      fechaCompra: '2026-10-05',
      tipoPago: 'Efectivo',
      impuesto: 19,
      tipoImpuesto: 'porcentaje',
    });
    expect(pantalla.guardando).toBe(true);

    peticion.flush({ id: 7, impuesto: 19000, compraNeta: 119000 });

    expect(pantalla.edicion).toBeNull();
    expect(pantalla.guardando).toBe(false);
    http.expectOne((r) => r.method === 'GET' && r.url === RUTAS_API.compras).flush([compra]);
  });

  it('muestra el error del backend y deja el formulario abierto', () => {
    pantalla.abrirEdicion(compra);
    pantalla.edicion!.numeroFactura = '   ';
    pantalla.guardarEdicion();

    http
      .expectOne((r) => r.method === 'PUT')
      .flush({ error: 'El numero de factura no es valido' }, { status: 400, statusText: 'Error' });

    expect(pantalla.mensajeError).toBe('El numero de factura no es valido');
    expect(pantalla.edicion).not.toBeNull();
  });

  it('cancelar cierra el formulario sin guardar', () => {
    pantalla.abrirEdicion(compra);
    pantalla.cerrarEdicion();

    expect(pantalla.edicion).toBeNull();
    expect(pantalla.netoEdicion).toBe(0);
    expect(pantalla.impuestoEdicionValido).toBe(false);
    pantalla.guardarEdicion();
    http.expectNone((r) => r.method === 'PUT');
  });
});
