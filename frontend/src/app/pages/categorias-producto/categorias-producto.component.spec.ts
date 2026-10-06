import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { CategoriasProductoComponent } from './categorias-producto.component';
import { TablaContenidoComponent } from '../../components/tabla-contenido/tabla-contenido.component';
import { BotonesAccionesComponent } from '../../components/botones-acciones/botones-acciones.component';

describe('CategoriasProductoComponent', () => {
  let component: CategoriasProductoComponent;
  let fixture: ComponentFixture<CategoriasProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [CategoriasProductoComponent, TablaContenidoComponent, BotonesAccionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriasProductoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });
});
