import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { VentasComponent } from './ventas.component';
import { TablaContenidoComponent } from '../../components/tabla-contenido/tabla-contenido.component';
import { BotonesAccionesComponent } from '../../components/botones-acciones/botones-acciones.component';
import { TarjetaResumenComponent } from '../../components/tarjeta-resumen/tarjeta-resumen.component';

describe('VentasComponent', () => {
  let component: VentasComponent;
  let fixture: ComponentFixture<VentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [VentasComponent, TablaContenidoComponent, BotonesAccionesComponent, TarjetaResumenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VentasComponent);
    component = fixture.componentInstance;
    component.ventas = [
      {
        id: 1,
        numeroFactura: '1000001',
        cliente: 'Cliente de Prueba',
        fechaVenta: '01-09-2026 10:00',
        tipoPago: 'Transferencia',
        plataforma: 'Tienda de Prueba',
        lote: 'LOTE #1',
        productos: [{ producto: 'Producto de Prueba', cantidad: 2 }],
        valorNeto: 25000,
        valorAdicional: 1500,
      },
    ];
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  const pantalla = (): string => fixture.nativeElement.textContent;

  it('muestra el resumen del día y la venta registrada en la tabla', () => {
    expect(pantalla()).toContain('Venta Neta');
    expect(pantalla()).toContain('1000001');
    expect(pantalla()).toContain('Cliente de Prueba');
    expect(pantalla()).toContain('Producto de Prueba');
  });

  it('tiene el botón para agregar una venta nueva', () => {
    const agregar: HTMLAnchorElement = fixture.nativeElement.querySelector('a.boton-verde');

    expect(agregar.textContent).toContain('Agregar Venta');
    expect(agregar.getAttribute('href')).toBe('/ventas/nueva');
  });
});
