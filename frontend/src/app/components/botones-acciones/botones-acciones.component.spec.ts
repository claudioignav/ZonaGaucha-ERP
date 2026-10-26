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

  it.each([
    ['Editar', 'editar'],
    ['Eliminar', 'eliminar'],
  ] as const)('el botón %s avisa con el evento %s', (titulo, evento) => {
    const escuchar = vi.fn();

    component[evento].subscribe(escuchar);

    fixture.nativeElement.querySelector(`button[title="${titulo}"]`).click();

    expect(escuchar).toHaveBeenCalledTimes(1);
  });
});
