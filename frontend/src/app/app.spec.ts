import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AppModule } from './app-module';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppModule] }).compileComponents();
  });

  it('abre el login al entrar sin una ruta', async () => {
    const harness = await RouterTestingHarness.create('/');

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeNativeElement?.textContent).toContain('ZonaGaucha ERP');
  });

  it('manda al login cuando la ruta no existe', async () => {
    await RouterTestingHarness.create('/pagina-que-no-existe');

    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it.each([
    { ruta: '/dashboard', texto: 'Panel de control y métricas generales' },
    { ruta: '/cuentas', texto: 'Administración de cuentas de usuario y control de accesos' },
    { ruta: '/ventas', texto: 'Seguimiento de salida de productos' },
    { ruta: '/ventas/nueva', texto: 'Registrar Información de Venta' },
  ])('la ruta $ruta muestra su página junto al menú', async ({ ruta, texto }) => {
    const harness = await RouterTestingHarness.create(ruta);

    const pantalla = harness.routeNativeElement?.textContent;
    expect(pantalla).toContain(texto);
    expect(pantalla).toContain('MÓDULOS');
  });
});
