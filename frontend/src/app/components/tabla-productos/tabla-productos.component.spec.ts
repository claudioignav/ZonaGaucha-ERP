import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TablaProductosComponent } from './tabla-productos.component';
import { DetalleProducto } from '../../models/venta';

describe('TablaProductosComponent', () => {
  let component: TablaProductosComponent;
  let fixture: ComponentFixture<TablaProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [TablaProductosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TablaProductosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  const filas = (): HTMLTableRowElement[] => Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));

  async function mostrar(productos: DetalleProducto[], filaAlterna = false): Promise<void> {
    fixture.componentRef.setInput('productos', productos);
    fixture.componentRef.setInput('opciones', ['Producto de Prueba']);
    fixture.componentRef.setInput('filaAlterna', filaAlterna);
    await fixture.whenStable();
  }

  it('agrega una fila vacía al tocar el botón de agregar', async () => {
    const productos = [{ producto: 'Producto de Prueba', cantidad: 2 }];
    await mostrar(productos);

    fixture.nativeElement.querySelector('button.text-verde-boton').click();
    await fixture.whenStable();

    expect(filas().length).toBe(2);
    expect(productos[1]).toEqual({ producto: '', cantidad: 1 });
  });

  it('quita la fila al tocar el tacho', async () => {
    const productos = [{ producto: 'Producto de Prueba', cantidad: 2 }];
    await mostrar(productos);

    fixture.nativeElement.querySelector('button[title="Quitar producto"]').click();
    await fixture.whenStable();

    expect(filas().length).toBe(0);
    expect(productos).toEqual([]);
  });

  it('muestra el texto del botón que recibe', async () => {
    fixture.componentRef.setInput('textoBoton', 'Agregar Otro Producto');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('button.text-verde-boton').textContent).toContain('Agregar Otro Producto');
  });

  it('pinta una fila sí y una no solo cuando se pide', async () => {
    const dosProductos = (): DetalleProducto[] => [
      { producto: '', cantidad: 1 },
      { producto: '', cantidad: 1 },
    ];
    await mostrar(dosProductos());
    expect(filas()[1].classList).not.toContain('bg-fondo');

    await mostrar(dosProductos(), true);
    expect(filas()[0].classList).not.toContain('bg-fondo');
    expect(filas()[1].classList).toContain('bg-fondo');
  });
});
