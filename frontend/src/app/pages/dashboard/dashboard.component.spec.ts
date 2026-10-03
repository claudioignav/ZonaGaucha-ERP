import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  const pantalla = (): string => fixture.nativeElement.textContent;

  async function refrescar(): Promise<void> {
    fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
    await fixture.whenStable();
  }

  it('muestra las tarjetas del resumen y las estadísticas de la empresa', () => {
    expect(pantalla()).toContain('Total Vendido');
    expect(pantalla()).toContain('Utilidades');
    expect(pantalla()).toContain('Total Comprado');
    expect(pantalla()).toContain('Estadísticas empresariales');
    expect(pantalla()).toContain('Proveedores Activos');
  });

  it('no muestra la línea de detalle cuando la estadística no la tiene', async () => {
    component.estadisticas = [{ etiqueta: 'Número de Cuentas', icono: 'assets/icons/user-green.svg', total: 1 }];

    await refrescar();

    expect(pantalla()).toContain('Número de Cuentas');
    expect(fixture.nativeElement.querySelector('section.tarjeta .text-green-700')).toBeNull();
  });

  it('dibuja un punto por cada mes y deja más arriba el mes con más ventas', async () => {
    component.ventasMensuales = [
      { mes: 'Ene', cantidad: 1000 },
      { mes: 'Feb', cantidad: 3000 },
    ];

    await refrescar();

    const puntos: SVGCircleElement[] = Array.from(fixture.nativeElement.querySelectorAll('circle'));
    expect(puntos.length).toBe(2);
    expect(Number(puntos[1].getAttribute('cy'))).toBeLessThan(Number(puntos[0].getAttribute('cy')));
    expect(pantalla()).toContain('Feb');
  });

  it('muestra cada plataforma en la leyenda con su porcentaje', async () => {
    component.ventasPlataforma = [{ plataforma: 'Tienda de Prueba', porcentaje: 40, color: '#1e3f20' }];

    await refrescar();

    expect(pantalla()).toContain('Tienda de Prueba');
    expect(pantalla()).toContain('40%');
  });

  it('reparte la dona según el porcentaje de cada plataforma', () => {
    component.ventasPlataforma = [
      { plataforma: 'Tienda de Prueba', porcentaje: 60, color: '#1e3f20' },
      { plataforma: 'Venta Presencial', porcentaje: 40, color: '#52b788' },
    ];

    const fondo = component.fondoDona;

    expect(fondo).toBe('conic-gradient(#1e3f20 0% 60%, #52b788 60% 100%)');
  });
});
