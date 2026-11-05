import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { InventarioService } from './inventario.service';
import { RUTAS_API, API_URL } from './api';

let servicio: InventarioService;
let http: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  servicio = TestBed.inject(InventarioService);
  http = TestBed.inject(HttpTestingController);
});

afterEach(() => http.verify());

it('consulta existencias desde el backend', () => {
  servicio.lotes().subscribe((lotes) => expect(lotes[0].unidadesDisponibles).toBe(4));
  http.expectOne(RUTAS_API.inventario + '/lotes').flush([{ numero: 12, unidadesDisponibles: 4 }]);
  servicio.resumen().subscribe();
  http.expectOne(RUTAS_API.inventario + '/resumen').flush({});
});
