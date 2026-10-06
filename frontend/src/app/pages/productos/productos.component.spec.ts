import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ProductosComponent } from './productos.component';
import { TablaContenidoComponent } from '../../components/tabla-contenido/tabla-contenido.component';
import { BotonesAccionesComponent } from '../../components/botones-acciones/botones-acciones.component';

describe('ProductosComponent', () => {
  let component: ProductosComponent;
  let fixture: ComponentFixture<ProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [ProductosComponent, TablaContenidoComponent, BotonesAccionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosComponent);
    component = fixture.componentInstance;
    component.productos = [{ id: 1, nombre: 'Producto de Prueba', categoria: 'Categoría de Prueba' }];
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el producto con su categoría y los botones para editar y eliminar', () => {
    const fila: HTMLElement = fixture.nativeElement.querySelector('tbody tr');

    expect(fila.textContent).toContain('Producto de Prueba');
    expect(fila.textContent).toContain('Categoría de Prueba');
    expect(fila.querySelector('button[title="Editar"]')).toBeTruthy();
    expect(fila.querySelector('button[title="Eliminar"]')).toBeTruthy();
  });
});
