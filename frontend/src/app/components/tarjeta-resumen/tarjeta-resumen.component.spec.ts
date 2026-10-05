import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TarjetaResumenComponent } from './tarjeta-resumen.component';

describe('TarjetaResumenComponent', () => {
  let component: TarjetaResumenComponent;
  let fixture: ComponentFixture<TarjetaResumenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TarjetaResumenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TarjetaResumenComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el título y el ícono que recibe', async () => {
    fixture.componentRef.setInput('titulo', 'Venta Neta');
    fixture.componentRef.setInput('icono', 'up.svg');
    await fixture.whenStable();

    const tarjeta: HTMLElement = fixture.nativeElement;
    expect(tarjeta.querySelector('h2')?.textContent).toBe('Venta Neta');
    expect(tarjeta.querySelector('img')?.getAttribute('src')).toBe('assets/icons/up.svg');
  });
});
