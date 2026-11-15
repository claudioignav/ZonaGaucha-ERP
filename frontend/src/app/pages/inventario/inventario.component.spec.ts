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
    productos: [
      { id: 3, nombre: 'Poncho Pampa', categoria: 'Ropa', unidadesDisponibles: 5, unidadesIngresadas: 6, precioTotal: 90000 },
      { id: 4, nombre: 'Boina Criolla', categoria: 'Accesorios', unidadesDisponibles: 3, unidadesIngresadas: 4, precioTotal: 0 },
      { id: 5, nombre: 'Faja Tejida', categoria: null, unidadesDisponibles: 1, unidadesIngresadas: 2, precioTotal: null },
    ],
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

it('ordena los tipos de contenido en espanol y elimina los repetidos', () => {
  fixture.componentInstance.lotes = ['Zapatos', 'Álbumes', 'Ropa', 'Álbumes'].map(
    (tipoContenido, indice) => ({ ...registros[0], numero: indice + 1, tipoContenido }),
  );

  expect(fixture.componentInstance.tiposContenido).toEqual(['Álbumes', 'Ropa', 'Zapatos']);
});

it('el boton Aplicar Filtros aplica lo escrito en el formulario', () => {
  const componente = fixture.componentInstance;

  componente.filtroProveedor = 'otro proveedor';
  fixture.nativeElement.querySelector('button.boton-oscuro').click();

  expect(componente.lotesFiltrados).toEqual([]);
});

const botonVista = (vista: string): HTMLButtonElement =>
  fixture.nativeElement.querySelector(`[role="group"] button[data-vista="${vista}"]`);

const filasTabla = (): HTMLTableRowElement[] =>
  Array.from(fixture.nativeElement.querySelectorAll('.tabla-contenido tbody tr'));

async function elegirVista(vista: string): Promise<void> {
  botonVista(vista).click();
  await fixture.whenStable();
}

describe('selector de vista', () => {
  it('parte en Tarjetas con ese boton marcado y sin tabla', () => {
    expect(fixture.componentInstance.vista).toBe('tarjetas');
    expect(botonVista('tarjetas').getAttribute('aria-pressed')).toBe('true');
    expect(botonVista('tabla').getAttribute('aria-pressed')).toBe('false');
    expect(botonVista('tarjetas').textContent?.trim()).toBe('Tarjetas');
    expect(botonVista('tabla').textContent?.trim()).toBe('Tabla');
    expect(tarjetas()).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('.tabla-contenido')).toBeNull();
  });

  it('cambia a Tabla y vuelve a Tarjetas', async () => {
    await elegirVista('tabla');

    expect(fixture.componentInstance.vista).toBe('tabla');
    expect(botonVista('tabla').getAttribute('aria-pressed')).toBe('true');
    expect(botonVista('tarjetas').getAttribute('aria-pressed')).toBe('false');
    expect(botonVista('tabla').className).toContain('bg-verde-oscuro');
    expect(tarjetas()).toHaveLength(0);
    expect(filasTabla()).toHaveLength(1);

    await elegirVista('tarjetas');

    expect(fixture.componentInstance.vista).toBe('tarjetas');
    expect(tarjetas()).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('.tabla-contenido')).toBeNull();
  });

  it('la tabla muestra una fila por lote con los campos de la tarjeta', async () => {
    fixture.componentInstance.lotes = [
      registros[0],
      { ...registros[0], numero: 13, proveedor: 'Otro Proveedor Ltda', tipoContenido: 'Calzado', facturaAsociada: 'F2', unidadesDisponibles: 3, unidadesTotales: 5, fechaCreacion: '2026-10-08' },
    ];
    await elegirVista('tabla');

    const encabezados = Array.from(
      fixture.nativeElement.querySelectorAll('.tabla-contenido thead th') as NodeListOf<HTMLElement>,
    ).map((celda) => celda.textContent?.trim());

    expect(encabezados).toEqual([
      'N° Lote',
      'Proveedor',
      'Tipo de Contenido',
      'Factura Asociada',
      'Fecha Creación',
      'Disponibilidad',
      'Ver productos',
    ]);

    const celdas = filasTabla().map((fila) =>
      Array.from(fila.querySelectorAll('td')).map((celda) => celda.textContent?.replace(/\s+/g, ' ').trim()),
    );

    expect(celdas).toEqual([
      ['LOTE #12', 'Proveedor de Prueba', 'Ropa', 'F1', '2026-10-07', '8 / 10 uds', ''],
      ['LOTE #13', 'Otro Proveedor Ltda', 'Calzado', 'F2', '2026-10-08', '3 / 5 uds', ''],
    ]);
    expect(filasTabla()[0].querySelector('.insignia')?.textContent).toBe('Ropa');
    expect(fixture.nativeElement.textContent).toContain('Mostrando 2 registros');
  });

  it('la tabla queda sin filas cuando ningun lote coincide', async () => {
    await escribirYAplicar('#filtro-lote', '99');
    await elegirVista('tabla');

    expect(filasTabla()).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('Mostrando 0 registros');
  });
});

describe('filtros al alternar la vista', () => {
  beforeEach(async () => {
    fixture.componentInstance.lotes = [
      registros[0],
      { ...registros[0], numero: 13, proveedor: 'Otro Proveedor Ltda' },
      { ...registros[0], numero: 14, proveedor: 'Otro Proveedor Ltda', tipoContenido: 'Calzado' },
    ];
    fixture.componentInstance.refrescar();
    await fixture.whenStable();
  });

  const numerosEnTabla = (): (string | undefined)[] =>
    filasTabla().map((fila) => fila.querySelector('td')?.textContent?.trim());

  it('la tabla usa los mismos lotes filtrados que las tarjetas', async () => {
    await escribirYAplicar('#filtro-proveedor', 'otro');

    expect(tarjetas().map((tarjeta) => tarjeta.textContent)).toEqual(['LOTE #13', 'LOTE #14']);

    await elegirVista('tabla');

    expect(numerosEnTabla()).toEqual(['LOTE #13', 'LOTE #14']);
  });

  it('conserva filtros aplicados y escritos al ir y volver de la tabla', async () => {
    await escribirYAplicar('#filtro-lote', '14');
    await elegirVista('tabla');

    expect(numerosEnTabla()).toEqual(['LOTE #14']);

    await elegirVista('tarjetas');

    expect(tarjetas().map((tarjeta) => tarjeta.textContent)).toEqual(['LOTE #14']);
    expect(fixture.componentInstance.filtroLote).toBe('14');
    expect((fixture.nativeElement.querySelector('#filtro-lote') as HTMLInputElement).value).toBe('14');
  });

  it('aplicar filtros estando en la tabla actualiza sus filas y mantiene la vista', async () => {
    await elegirVista('tabla');

    expect(filasTabla()).toHaveLength(3);

    await escribirYAplicar('#filtro-proveedor', 'OTRO');

    expect(fixture.componentInstance.vista).toBe('tabla');
    expect(numerosEnTabla()).toEqual(['LOTE #13', 'LOTE #14']);
  });
});

describe('ver productos de un lote', () => {
  const modal = (): HTMLElement | null => fixture.nativeElement.querySelector('[role="dialog"]');

  const botonVer = (contenedor: string): HTMLButtonElement =>
    fixture.nativeElement.querySelector(`${contenedor} button[title="Ver productos"]`);

  const filasModal = (): (string | undefined)[][] =>
    Array.from(modal()!.querySelectorAll('tbody tr') as NodeListOf<HTMLTableRowElement>).map((fila) =>
      Array.from(fila.querySelectorAll('td')).map((celda) => celda.textContent?.trim()),
    );

  async function abrirDesde(contenedor: string): Promise<void> {
    botonVer(contenedor).click();
    await fixture.whenStable();
  }

  it('parte sin el cuadro abierto', () => {
    expect(modal()).toBeNull();
  });

  it('el ojo de la tarjeta es accesible y abre el cuadro con los productos del lote', async () => {
    const boton = botonVer('article');

    expect(boton.getAttribute('aria-label')).toBe('Ver productos del lote 12');
    expect(boton.querySelector('img')?.getAttribute('src')).toBe('assets/icons/eye.svg');

    await abrirDesde('article');

    expect(modal()?.getAttribute('aria-modal')).toBe('true');
    expect(modal()?.querySelector('#titulo-productos-lote')?.textContent?.trim()).toBe('Productos del lote #12');
    expect(
      Array.from(modal()!.querySelectorAll('thead th') as NodeListOf<HTMLElement>).map((celda) => celda.textContent?.trim()),
    ).toEqual(['Producto', 'Categoría', 'Disponibles', 'Ingresadas', 'Precio total lote']);
    expect(filasModal()).toEqual([
      ['Poncho Pampa', 'Ropa', '5', '6', '$90.000'],
      ['Boina Criolla', 'Accesorios', '3', '4', '$0'],
      ['Faja Tejida', '-', '1', '2', '-'],
    ]);
  });

  it('los encabezados del cuadro no se transforman a mayusculas', async () => {
    await abrirDesde('article');

    const encabezado: HTMLElement = modal()!.querySelector('thead')!;

    expect(encabezado.classList).not.toContain('uppercase');
    expect(getComputedStyle(encabezado).textTransform).not.toBe('uppercase');
    expect(modal()!.querySelector('.overflow-x-auto table')).not.toBeNull();
  });

  it('el ojo de la tabla abre el mismo cuadro y mantiene la vista Tabla', async () => {
    await elegirVista('tabla');

    expect(botonVer('.tabla-contenido tbody').getAttribute('aria-label')).toBe('Ver productos del lote 12');

    await abrirDesde('.tabla-contenido tbody');

    expect(fixture.componentInstance.detalle).toBe(fixture.componentInstance.lotes[0]);
    expect(filasModal()).toHaveLength(3);

    fixture.nativeElement.querySelector('[role="dialog"] button.boton-oscuro').click();
    await fixture.whenStable();

    expect(modal()).toBeNull();
    expect(fixture.componentInstance.vista).toBe('tabla');
    expect(filasTabla()).toHaveLength(1);
  });

  it('avisa cuando el lote no tiene productos', async () => {
    fixture.componentInstance.lotes = [{ ...registros[0], productos: [] }];
    fixture.componentInstance.refrescar();
    await fixture.whenStable();
    await abrirDesde('article');

    expect(modal()?.querySelector('table')).toBeNull();
    expect(modal()?.textContent).toContain('Este lote no tiene productos registrados.');
  });

  it('se cierra con Escape y conserva los filtros aplicados', async () => {
    fixture.componentInstance.lotes = [registros[0], { ...registros[0], numero: 13, proveedor: 'Otro Proveedor Ltda' }];
    await escribirYAplicar('#filtro-proveedor', 'otro');
    await abrirDesde('article');

    expect(modal()?.textContent).toContain('Productos del lote #13');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(modal()).toBeNull();
    expect(fixture.componentInstance.filtroProveedor).toBe('otro');
    expect(tarjetas().map((tarjeta) => tarjeta.textContent)).toEqual(['LOTE #13']);
  });
});

it('muestra el error de carga recibido del backend', async () => {
  fixture.componentInstance.ngOnInit();
  for (const peticion of http.match(() => true))
    peticion.flush({ error: 'No se pudo cargar' }, { status: 500, statusText: 'Error' });

  await fixture.whenStable();

  expect(fixture.componentInstance.mensajeError).toBe('No se pudo cargar');
});
