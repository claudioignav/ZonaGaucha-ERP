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
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });
});
