import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TiposContenidoComponent } from './tipos-contenido.component';
import { TablaContenidoComponent } from '../../components/tabla-contenido/tabla-contenido.component';
import { BotonesAccionesComponent } from '../../components/botones-acciones/botones-acciones.component';

describe('TiposContenidoComponent', () => {
  let component: TiposContenidoComponent;
  let fixture: ComponentFixture<TiposContenidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [TiposContenidoComponent, TablaContenidoComponent, BotonesAccionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TiposContenidoComponent);
    component = fixture.componentInstance;
    component.tiposContenido = [{ id: 1, nombre: 'Surtido' }];
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el tipo de contenido registrado con sus botones', () => {
    const fila: HTMLElement = fixture.nativeElement.querySelector('tbody tr');

    expect(fila.textContent).toContain('Surtido');
    expect(fila.querySelector('button[title="Editar"]')).toBeTruthy();
    expect(fila.querySelector('button[title="Eliminar"]')).toBeTruthy();
  });
});
