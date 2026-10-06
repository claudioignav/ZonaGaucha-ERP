import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventarioComponent } from './inventario.component';
import { TarjetaResumenComponent } from '../../components/tarjeta-resumen/tarjeta-resumen.component';
import { Lote } from '../../models/lote';

describe('InventarioComponent', () => {
  let component: InventarioComponent;
  let fixture: ComponentFixture<InventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), FormsModule],
      declarations: [InventarioComponent, TarjetaResumenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioComponent);
    component = fixture.componentInstance;
    component.lotes = [lotePrueba];
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  function escribir(selector: string, valor: string): void {
    const campo: HTMLInputElement = fixture.nativeElement.querySelector(selector);
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  async function refrescar(): Promise<void> {
    fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
    await fixture.whenStable();
  }

  const lotePrueba: Lote = {
    numero: 1,
    proveedor: 'Proveedor de Prueba SpA',
    tipoContenido: 'Surtido',
    facturaAsociada: '2000001',
    unidadesDisponibles: 8,
    unidadesTotales: 10,
    fechaCreacion: '2026-09-01',
  };

  const tarjetas = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('article h2.font-titulo'));
  const barra = (): HTMLElement => fixture.nativeElement.querySelector('.bg-verde-boton');

  it('muestra cada lote con su proveedor y lo que queda disponible', () => {
    const pantalla: string = fixture.nativeElement.textContent;
    expect(pantalla).toContain('LOTE #1');
    expect(pantalla).toContain('Proveedor de Prueba SpA');
    expect(pantalla).toContain('/ 10 uds');
  });

  it('llena la barra según lo que queda del lote', () => {
    expect(barra().style.width).toBe('80%');
  });

  it('deja la barra vacía si el lote no tiene unidades', async () => {
    component.lotes = [{ ...lotePrueba, unidadesDisponibles: 0, unidadesTotales: 0 }];

    await refrescar();

    expect(barra().style.width).toBe('0%');
  });

  describe('filtros', () => {
    beforeEach(async () => {
      component.lotes = [lotePrueba, { ...lotePrueba, numero: 2, proveedor: 'Otro Proveedor Ltda' }];
      await refrescar();
    });

    it('deja solo el lote con el número escrito', async () => {
      escribir('#filtro-lote', '2');
      await fixture.whenStable();

      expect(tarjetas().map((t) => t.textContent)).toEqual(['LOTE #2']);
    });

    it('busca por proveedor sin importar mayúsculas', async () => {
      escribir('#filtro-proveedor', 'OTRO');
      await fixture.whenStable();

      expect(tarjetas().map((t) => t.textContent)).toEqual(['LOTE #2']);
    });

    it('no muestra lotes cuando ninguno coincide', async () => {
      escribir('#filtro-lote', '99');
      await fixture.whenStable();

      expect(tarjetas().length).toBe(0);
    });
  });
});
