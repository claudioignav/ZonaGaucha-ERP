import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { AppModule } from '../../app-module';
import { InventarioComponent } from './inventario.component';
import { RUTAS_API } from '../../services/api';

const registros = [
  {
    numero: 12,
    proveedor: 'Proveedor de Prueba',
    tipoContenido: 'Ropa',
    facturaAsociada: 'F1',
    unidadesTotales: 10,
    unidadesDisponibles: 8,
    fechaCreacion: '2026-10-07',
  },
];
let fixture: ComponentFixture<InventarioComponent>;
let http: HttpTestingController;

beforeEach(async () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  http = TestBed.inject(HttpTestingController);
  fixture = TestBed.createComponent(InventarioComponent);
  fixture.detectChanges();
  http.expectOne(RUTAS_API.inventario + '/lotes').flush(registros);
  http.expectOne(RUTAS_API.inventario + '/resumen').flush({
    fechaActual: '2026-10-07T12:00',
    promedioVenta: 20,
    productosDisponibles: 8,
  });

  await fixture.whenStable();
});

afterEach(() => http.verify());

it('se crea correctamente', () => {
  expect(fixture.componentInstance).toBeTruthy();
});

it('muestra cada lote con su proveedor y lo que queda disponible', () => {
  const pantalla: string = fixture.nativeElement.textContent;

  expect(pantalla).toContain('LOTE #12');
  expect(pantalla).toContain('Proveedor de Prueba');
  expect(pantalla).toContain('/ 10 uds');
  expect(pantalla).toContain('2026-10-07');
});

it('llena la barra segun lo que queda del lote', () => {
  const barra: HTMLElement = fixture.nativeElement.querySelector('.bg-verde-boton');

  expect(barra.style.width).toBe('80%');
});

it('deja la barra vacia si el lote no tiene unidades', async () => {
  fixture.componentInstance.lotes = [
    { ...registros[0], unidadesDisponibles: 0, unidadesTotales: 0 },
  ];
  fixture.componentInstance.refrescar();
  await fixture.whenStable();

  const barra: HTMLElement = fixture.nativeElement.querySelector('.bg-verde-boton');

  expect(barra.style.width).toBe('0%');
});

async function escribirYAplicar(selector: string, valor: string): Promise<void> {
  const campo: HTMLInputElement = fixture.nativeElement.querySelector(selector);
  campo.value = valor;
  campo.dispatchEvent(new Event('input'));
  await fixture.whenStable();
  fixture.nativeElement.querySelector('button.boton-oscuro').click();
  await fixture.whenStable();
}

const tarjetas = (): HTMLElement[] =>
  Array.from(fixture.nativeElement.querySelectorAll('article h2.font-titulo'));

describe('filtros aplicados en la pantalla', () => {
  beforeEach(async () => {
    fixture.componentInstance.lotes = [
      registros[0],
      { ...registros[0], numero: 13, proveedor: 'Otro Proveedor Ltda' },
    ];
    fixture.componentInstance.refrescar();
    await fixture.whenStable();
  });

  it('deja solo el lote con el numero escrito', async () => {
    await escribirYAplicar('#filtro-lote', '13');

    expect(tarjetas().map((tarjeta) => tarjeta.textContent)).toEqual(['LOTE #13']);
  });

  it('busca por proveedor sin importar mayusculas', async () => {
    await escribirYAplicar('#filtro-proveedor', 'OTRO');

    expect(tarjetas().map((tarjeta) => tarjeta.textContent)).toEqual(['LOTE #13']);
  });

  it('no muestra lotes cuando ninguno coincide', async () => {
    await escribirYAplicar('#filtro-lote', '99');

    expect(tarjetas()).toHaveLength(0);
  });
});

it('muestra la respuesta recibida por http', () => {
  expect(fixture.componentInstance.lotes.length).toBe(1);
});

it('los filtros escritos no cambian la tabla hasta aplicarlos', () => {
  const componente = fixture.componentInstance;

  componente.filtroLote = 'otro';

  expect(componente.lotesFiltrados.length).toBe(1);

  componente.aplicarFiltros();

  expect(componente.lotesFiltrados).toEqual([]);

  componente.filtroLote = '12';
  componente.aplicarFiltros();

  expect(componente.lotesFiltrados.length).toBe(1);
  expect(componente.porcentajeDisponible(registros[0])).toBe(80);
  expect(componente.porcentajeDisponible({ ...registros[0], unidadesTotales: 0 })).toBe(0);
});

it('filtra por tipo de contenido y fecha de creación al aplicar', () => {
  const componente = fixture.componentInstance;

  expect(componente.tiposContenido).toEqual(['Ropa']);

  componente.filtroContenido = 'Ropa';
  componente.filtroFecha = '2026-10-08';
  componente.aplicarFiltros();

  expect(componente.lotesFiltrados).toEqual([]);

  componente.filtroFecha = '2026-10-07';
  componente.aplicarFiltros();

  expect(componente.lotesFiltrados.length).toBe(1);
});

it('el boton Aplicar Filtros aplica lo escrito en el formulario', () => {
  const componente = fixture.componentInstance;

  componente.filtroProveedor = 'otro proveedor';
  fixture.nativeElement.querySelector('button.boton-oscuro').click();

  expect(componente.lotesFiltrados).toEqual([]);
});

it('muestra el error de carga recibido del backend', async () => {
  fixture.componentInstance.ngOnInit();
  for (const peticion of http.match(() => true))
    peticion.flush({ error: 'No se pudo cargar' }, { status: 500, statusText: 'Error' });

  await fixture.whenStable();

  expect(fixture.componentInstance.mensajeError).toBe('No se pudo cargar');
});
