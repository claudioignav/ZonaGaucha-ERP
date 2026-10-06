import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TiposPagoComponent } from './tipos-pago.component';
import { TablaContenidoComponent } from '../../components/tabla-contenido/tabla-contenido.component';
import { BotonesAccionesComponent } from '../../components/botones-acciones/botones-acciones.component';

describe('TiposPagoComponent', () => {
  let component: TiposPagoComponent;
  let fixture: ComponentFixture<TiposPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [TiposPagoComponent, TablaContenidoComponent, BotonesAccionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TiposPagoComponent);
    component = fixture.componentInstance;
    component.tiposPago = [{ id: 1, nombre: 'Transferencia' }];
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el tipo de pago registrado con sus botones', () => {
    const fila: HTMLElement = fixture.nativeElement.querySelector('tbody tr');

    expect(fila.textContent).toContain('Transferencia');
    expect(fila.querySelector('button[title="Editar"]')).toBeTruthy();
    expect(fila.querySelector('button[title="Eliminar"]')).toBeTruthy();
  });
});
