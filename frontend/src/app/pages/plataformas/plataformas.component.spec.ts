import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { PlataformasComponent } from './plataformas.component';
import { TablaContenidoComponent } from '../../components/tabla-contenido/tabla-contenido.component';
import { BotonesAccionesComponent } from '../../components/botones-acciones/botones-acciones.component';

describe('PlataformasComponent', () => {
  let component: PlataformasComponent;
  let fixture: ComponentFixture<PlataformasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [PlataformasComponent, TablaContenidoComponent, BotonesAccionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlataformasComponent);
    component = fixture.componentInstance;
    component.plataformas = [{ id: 1, nombre: 'Tienda de Prueba', tiposPago: ['Transferencia', 'Efectivo'] }];
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('muestra la plataforma con sus formas de pago separadas por guion', () => {
    const fila: HTMLElement = fixture.nativeElement.querySelector('tbody tr');

    expect(fila.textContent).toContain('Tienda de Prueba');
    expect(fila.textContent).toContain('Transferencia - Efectivo');
    expect(fila.querySelector('button[title="Editar"]')).toBeTruthy();
    expect(fila.querySelector('button[title="Eliminar"]')).toBeTruthy();
  });
});
