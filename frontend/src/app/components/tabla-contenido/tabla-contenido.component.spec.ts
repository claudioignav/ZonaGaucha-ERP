import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablaContenidoComponent } from './tabla-contenido.component';

describe('TablaContenidoComponent', () => {
  let component: TablaContenidoComponent;
  let fixture: ComponentFixture<TablaContenidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TablaContenidoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TablaContenidoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  function boton(texto: string): HTMLButtonElement {
    const botones: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    return botones.find((b) => b.textContent?.trim() === texto) as HTMLButtonElement;
  }

  const pie = (): string => fixture.nativeElement.textContent.replace(/\s+/g, ' ');

  async function mostrar(totalRegistros: number, paginado: boolean): Promise<void> {
    fixture.componentRef.setInput('totalRegistros', totalRegistros);
    fixture.componentRef.setInput('paginado', paginado);
    await fixture.whenStable();
  }

  it('sin paginación solo dice cuántos registros hay', async () => {
    await mostrar(3, false);

    expect(pie()).toContain('Mostrando 3 registros');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('con paginación muestra un botón por página y el rango visible', async () => {
    await mostrar(25, true);

    expect(pie()).toContain('Mostrando 1-10 de 25 registros');
    expect(boton('3')).toBeTruthy();
    expect(boton('4')).toBeUndefined();
  });

  it('cambia de página al tocar su número', async () => {
    await mostrar(25, true);

    boton('2').click();
    await fixture.whenStable();

    expect(pie()).toContain('Mostrando 11-20 de 25 registros');
  });

  it('llega a la última página con Siguiente y ahí lo desactiva', async () => {
    await mostrar(25, true);

    boton('Siguiente').click();
    await fixture.whenStable();
    boton('Siguiente').click();
    await fixture.whenStable();

    expect(pie()).toContain('Mostrando 21-25 de 25 registros');
    expect(boton('Siguiente').disabled).toBe(true);
  });

  it('no se mueve si se pide una página que no existe', async () => {
    await mostrar(25, true);

    component.cambiarPagina(9);
    await fixture.whenStable();

    expect(pie()).toContain('Mostrando 1-10 de 25 registros');
  });

  it('muestra solo 10 botones y unos puntos cuando hay muchas páginas', async () => {
    await mostrar(150, true);

    expect(boton('10')).toBeTruthy();
    expect(boton('11')).toBeUndefined();
    expect(pie()).toContain('...');
  });


  it('notifica el cambio de página una sola vez y rechaza páginas inválidas', async () => {
    await mostrar(25, true);
    const cambios: number[] = [];
    component.paginaCambiada.subscribe((pagina) => cambios.push(pagina));

    boton('2').click();
    await fixture.whenStable();
    component.cambiarPagina(2);
    component.cambiarPagina(0);
    component.cambiarPagina(4);

    expect(cambios).toEqual([2]);
  });

  it('sin resultados muestra un rango vacío y desactiva Siguiente', async () => {
    await mostrar(0, true);

    expect(pie()).toContain('Mostrando 0-0 de 0 registros');
    expect(boton('Siguiente').disabled).toBe(true);
  });

  it('permite regresar con los botones al superar diez páginas', async () => {
    await mostrar(150, true);
    component.cambiarPagina(11);
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();

    expect(boton('11')).toBeTruthy();
    boton('10').click();
    await fixture.whenStable();
    expect(pie()).toContain('Mostrando 91-100 de 150 registros');
  });
});
