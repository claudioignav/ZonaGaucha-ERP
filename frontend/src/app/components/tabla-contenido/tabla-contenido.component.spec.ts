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
});
