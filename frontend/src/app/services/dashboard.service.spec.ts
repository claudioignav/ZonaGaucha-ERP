import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { DashboardService, ResumenDashboard } from './dashboard.service';
import { RUTAS_API } from './api';

let servicio: DashboardService;
let http: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  servicio = TestBed.inject(DashboardService);
  http = TestBed.inject(HttpTestingController);
});

afterEach(() => http.verify());

it('recibe los totales y graficos calculados por el backend', () => {
  const resumen: ResumenDashboard = {
    totalVendido: 2000,
    totalComprado: 1200,
    utilidades: 800,
    productos: 8,
    cuentas: 3,
    proveedores: 2,
    categorias: 4,
    productosNuevosMes: 1,
    categoriasNuevasMes: 0,
    ventasPorMes: [{ mes: 'Ene', cantidad: 2 }],
    ventasPorPlataforma: [{ plataforma: 'Web', porcentaje: 100 }],
    tendencias: { totalVendido: [2000], totalComprado: [1200], utilidades: [800] },
    variaciones: { totalVendido: 20, totalComprado: null, utilidades: -10 },
  };

  servicio.resumen().subscribe((datos) => expect(datos).toEqual(resumen));
  const peticion = http.expectOne(RUTAS_API.dashboard);
  expect(peticion.request.method).toBe('GET');
  peticion.flush(resumen);
});

it('comunica el rechazo de acceso a las metricas financieras', async () => {
  const respuesta = firstValueFrom(servicio.resumen());

  http.expectOne(RUTAS_API.dashboard).flush(
    { error: 'No tienes permiso para consultar estas metricas' },
    { status: 403, statusText: 'Forbidden' },
  );
  await expect(respuesta).rejects.toThrow('No tienes permiso para consultar estas metricas');
});

it('comunica un mensaje general cuando falla el servidor sin detalle', async () => {
  const respuesta = firstValueFrom(servicio.resumen());

  http.expectOne(RUTAS_API.dashboard).flush(null, { status: 500, statusText: 'Server Error' });
  await expect(respuesta).rejects.toThrow('No se pudo completar la solicitud. Intenta nuevamente.');
});
