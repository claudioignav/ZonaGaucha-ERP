import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';
import { PesosPipe } from '../../pipes/pesos.pipe';
import { RUTAS_API } from '../../services/api';

const registros = {
  totalVendido: 2100,
  totalComprado: 1190,
  utilidades: 910,
  productos: 1,
  cuentas: 1,
  proveedores: 1,
  categorias: 1,
  productosNuevosMes: 2,
  categoriasNuevasMes: 1,
  ventasPorMes: [{ mes: 'Oct', cantidad: 1 }],
  ventasPorPlataforma: [{ plataforma: 'Web', porcentaje: 100 }],
  tendencias: {
    totalVendido: [1000, 2000, 2100],
    totalComprado: [500, 600, 1190],
    utilidades: [500, 1400, 910],
  },
  variaciones: { totalVendido: 14.2, totalComprado: null, utilidades: -35 },
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [DashboardComponent, PesosPipe],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const peticion = http.expectOne(RUTAS_API.dashboard);
    expect(peticion.request.method).toBe('GET');
    peticion.flush(registros);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

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
    expect(pantalla()).toContain('$2.100');
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

  it('muestra la respuesta recibida por http', () => {
    expect(fixture.nativeElement.textContent).toContain('Web');
    expect(fixture.componentInstance.puntosLinea).toContain('48,');
  });

  it('arma los graficos segun el resumen recibido', () => {
    expect(fixture.componentInstance.fondoDona).toContain('100%');
    expect(fixture.componentInstance.puntoY(1)).toBeLessThan(200);
  });

  it('muestra variaciones, tendencias y nuevos del mes calculados por el backend', () => {
    const componente = fixture.componentInstance;

    expect(componente.resumen.map((tarjeta) => tarjeta.variacion)).toEqual([
      '+14,2% este mes',
      '-35,0% de utilidad este mes',
      'Sin información del mes anterior',
    ]);
    expect(componente.resumen[0].tendencia.split(' ')).toHaveLength(3);
    expect(componente.estadisticas[0].detalle).toBe('2 nuevos este mes');
    expect(componente.estadisticas[3].detalle).toBe('1 nuevo este mes');
    expect(componente.estadisticas[1].detalle).toBeUndefined();
  });

  it('reparte los doce meses dentro del eje del grafico', () => {
    const componente = fixture.componentInstance;

    componente.ventasMensuales = Array.from({ length: 12 }, (_, i) => ({
      mes: String(i),
      cantidad: 1,
    }));

    expect(componente.puntoX(0)).toBe(48);
    expect(componente.puntoX(11)).toBe(580);
  });

  it('dibuja las tendencias sin dividir por cero cuando todos los valores son iguales', () => {
    const componente = fixture.componentInstance;

    expect(componente.puntosTendencia([5, 5])).toBe('0.0,20.0 96.0,20.0');
    expect(componente.puntosTendencia([0, 10]).split(' ')[1]).toBe('96.0,2.0');
    expect(componente.puntosTendencia([])).toBe('');
  });

  it('muestra el error de carga recibido del backend', async () => {
    fixture.componentInstance.ngOnInit();
    http.expectOne(RUTAS_API.dashboard).flush(
      { error: 'No se pudo cargar' },
      { status: 500, statusText: 'Error' },
    );

    await fixture.whenStable();

    expect(fixture.componentInstance.mensajeError).toBe('No se pudo cargar');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se pudo cargar');
  });
});
