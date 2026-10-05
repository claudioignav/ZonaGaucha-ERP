import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NuevaCompraComponent } from './nueva-compra.component';
import { TablaProductosComponent } from '../../components/tabla-productos/tabla-productos.component';

describe('NuevaCompraComponent', () => {
  let component: NuevaCompraComponent;
  let fixture: ComponentFixture<NuevaCompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([{ path: 'compras', children: [] }]), FormsModule],
      declarations: [NuevaCompraComponent, TablaProductosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevaCompraComponent);
    component = fixture.componentInstance;
    component.opciones = {
      proveedores: ['Proveedor de Prueba SpA'],
      tiposPago: ['Transferencia'],
      tiposContenido: ['Surtido'],
      productos: ['Producto de Prueba'],
    };
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  async function completar(campos: Record<string, string>): Promise<void> {
    for (const [selector, valor] of Object.entries(campos)) {
      const campo: HTMLInputElement = fixture.nativeElement.querySelector(selector);
      campo.value = valor;
      campo.dispatchEvent(new Event(campo.tagName === 'SELECT' ? 'change' : 'input'));
    }
    await fixture.whenStable();
  }

  const compraNeta = (): string => fixture.nativeElement.querySelector('#compra-neta').value;

  it('guarda en la compra todo lo que se completa en el formulario', async () => {
    await completar({
      '#numero-lote': '1',
      '#numero-factura': '2000001',
      '#proveedor': 'Proveedor de Prueba SpA',
      '#fecha-compra': '2026-09-01T09:00',
      '#tipo-pago': 'Transferencia',
      '#tipo-contenido': 'Surtido',
      '#compra-bruta': '100000',
      '#impuesto': '19000',
      'select[aria-label="Seleccionar producto..."]': 'Producto de Prueba',
      'input[aria-label="Cantidad"]': '10',
    });

    expect(component.compra).toEqual({
      numeroFactura: '2000001',
      numeroLote: '1',
      proveedor: 'Proveedor de Prueba SpA',
      fechaCompra: '2026-09-01T09:00',
      tipoPago: 'Transferencia',
      tipoContenido: 'Surtido',
      productos: [{ producto: 'Producto de Prueba', cantidad: 10 }],
      compraBruta: 100000,
      impuesto: 19000,
    });
  });

  it('muestra la compra neta en $0 mientras no se escriban montos', () => {
    expect(compraNeta()).toBe('$0');
  });

  it('calcula la compra neta al escribir la compra bruta y el impuesto', async () => {
    await completar({
      '#compra-bruta': '100000',
      '#impuesto': '19000',
    });

    expect(compraNeta()).toBe('$119,000');
  });

  const filas = (): number => fixture.nativeElement.querySelectorAll('tbody tr').length;

  it('parte con una fila de producto lista para llenar', () => {
    expect(filas()).toBe(1);
  });

  it('vuelve al listado de compras al guardar', async () => {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/compras');
  });
});
