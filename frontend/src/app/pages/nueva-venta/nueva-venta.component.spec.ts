import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NuevaVentaComponent } from './nueva-venta.component';
import { NombreValidatorDirective } from '../../validators/nombre.validator';
import { TablaProductosComponent } from '../../components/tabla-productos/tabla-productos.component';

describe('NuevaVentaComponent', () => {
  let component: NuevaVentaComponent;
  let fixture: ComponentFixture<NuevaVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([{ path: 'ventas', children: [] }]), FormsModule],
      declarations: [NuevaVentaComponent, TablaProductosComponent, NombreValidatorDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevaVentaComponent);
    component = fixture.componentInstance;
    component.opciones = {
      tiposPago: ['Transferencia'],
      plataformas: ['Tienda de Prueba'],
      lotes: ['LOTE #1'],
      productos: ['Producto de Prueba'],
    };
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  function escribir(selector: string, valor: string): void {
    const campo: HTMLInputElement = fixture.nativeElement.querySelector(selector);
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  function elegir(selector: string, valor: string): void {
    const lista: HTMLSelectElement = fixture.nativeElement.querySelector(selector);
    lista.value = valor;
    lista.dispatchEvent(new Event('change'));
  }

  const filas = (): number => fixture.nativeElement.querySelectorAll('tbody tr').length;

  it('parte con una fila de producto lista para llenar', () => {
    expect(filas()).toBe(1);
  });

  it('guarda en la venta todo lo que se completa en el formulario', async () => {
    escribir('#cliente', 'Cliente de Prueba');
    elegir('#tipo-pago', 'Transferencia');
    escribir('#fecha-venta', '2026-09-01T10:00');
    elegir('#plataforma', 'Tienda de Prueba');
    elegir('#lote', 'LOTE #1');
    elegir('app-tabla-productos select', 'Producto de Prueba');
    escribir('input[aria-label="Cantidad"]', '2');
    escribir('#valor-bruto', '25000');
    escribir('#valor-adicional', '1500');
    await fixture.whenStable();

    expect(component.venta).toEqual({
      numeroFactura: '',
      cliente: 'Cliente de Prueba',
      fechaVenta: '2026-09-01T10:00',
      tipoPago: 'Transferencia',
      plataforma: 'Tienda de Prueba',
      lote: 'LOTE #1',
      productos: [{ producto: 'Producto de Prueba', cantidad: 2 }],
      valorNeto: 25000,
      valorAdicional: 1500,
    });
  });

  it('vuelve al listado de ventas al guardar', async () => {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/ventas');
  });
});
