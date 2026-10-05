import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BotonesAccionesComponent } from './botones-acciones.component';

describe('BotonesAccionesComponent', () => {
  let component: BotonesAccionesComponent;
  let fixture: ComponentFixture<BotonesAccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BotonesAccionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BotonesAccionesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('muestra los botones para editar y eliminar', () => {
    const pantalla: HTMLElement = fixture.nativeElement;
    expect(pantalla.querySelector('button[title="Editar"]')).toBeTruthy();
    expect(pantalla.querySelector('button[title="Eliminar"]')).toBeTruthy();
  });
});
