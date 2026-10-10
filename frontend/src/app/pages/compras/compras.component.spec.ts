import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ComprasComponent } from './compras.component';
import { PesosPipe } from '../../pipes/pesos.pipe';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { TablaContenidoComponent } from '../../components/tabla-contenido/tabla-contenido.component';
import { BotonesAccionesComponent } from '../../components/botones-acciones/botones-acciones.component';
import { TarjetaResumenComponent } from '../../components/tarjeta-resumen/tarjeta-resumen.component';

describe('ComprasComponent', () => {
  let component: ComprasComponent;
  let fixture: ComponentFixture<ComprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [ComprasComponent, TablaContenidoComponent, BotonesAccionesComponent, TarjetaResumenComponent, PesosPipe, FechaPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(ComprasComponent);
    component = fixture.componentInstance;
    component.compras = [
      {
        id: 1,
        numeroFactura: '2000001',
        numeroLote: '1',
        proveedor: 'Proveedor de Prueba SpA',
        fechaCompra: '01-09-2026 09:00',
        tipoPago: 'Transferencia',
        tipoContenido: 'Surtido',
        productos: [{ producto: 'Producto de Prueba', cantidad: 10 }],
        compraBruta: 100000,
        impuesto: 19000,
        compraNeta: 119000,
      },
    ];
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  const pantalla = (): string => fixture.nativeElement.textContent;

  it('muestra el resumen de compras y la compra registrada en la tabla', () => {
    expect(pantalla()).toContain('Impuestos Totales');
    expect(pantalla()).toContain('2000001');
    expect(pantalla()).toContain('Proveedor de Prueba SpA');
  });

  it('tiene el botón para agregar una compra nueva', () => {
    const agregar: HTMLAnchorElement = fixture.nativeElement.querySelector('a.boton-verde');

    expect(agregar.textContent).toContain('Agregar Compra');
    expect(agregar.getAttribute('href')).toBe('/compras/nueva');
  });
});
