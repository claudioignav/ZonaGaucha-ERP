import { finalize } from 'rxjs';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Lote, resumenInventario } from '../../models/lote';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-inventario',
  standalone: false,
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss',
})
export class InventarioComponent implements OnInit {
  private readonly detector = inject(ChangeDetectorRef);

  refrescar(): void {
    this.detector.markForCheck();
  }

  mensajeError = '';

  private readonly inventarioService = inject(InventarioService);

  lotes: Lote[] = [];

  resumen = { ...resumenInventario };

  // valores escritos en el formulario, la tabla no cambia hasta aplicarlos.
  filtroLote = '';

  filtroProveedor = '';

  filtroContenido = '';

  filtroFecha = '';

  private filtrosAplicados = { lote: '', proveedor: '', contenido: '', fecha: '' };

  aplicarFiltros(): void {
    this.filtrosAplicados = {
      lote: this.filtroLote.trim(),
      proveedor: this.filtroProveedor.trim().toLowerCase(),
      contenido: this.filtroContenido,
      fecha: this.filtroFecha,
    };
  }

  ngOnInit(): void {
    this.inventarioService
      .lotes()
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: (lotes) => (this.lotes = lotes),
        error: (error: Error) => {
          this.mensajeError = error.message;
        },
      });
    this.inventarioService
      .resumen()
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: (resumen) => (this.resumen = resumen),
        error: (error: Error) => {
          this.mensajeError = error.message;
        },
      });
  }

  get tiposContenido(): string[] {
    return [...new Set(this.lotes.map((lote) => lote.tipoContenido))].sort((primero, segundo) =>
      primero.localeCompare(segundo, 'es'),
    );
  }

  get lotesFiltrados(): Lote[] {
    const { lote, proveedor, contenido, fecha } = this.filtrosAplicados;

    return this.lotes.filter(
      (registro) =>
        (!lote || String(registro.numero) === lote) &&
        (!proveedor || registro.proveedor.toLowerCase().includes(proveedor)) &&
        (!contenido || registro.tipoContenido === contenido) &&
        (!fecha || registro.fechaCreacion === fecha),
    );
  }

  porcentajeDisponible(lote: Lote): number {
    if (!lote.unidadesTotales) {
      return 0;
    }

    return Math.round((lote.unidadesDisponibles / lote.unidadesTotales) * 100);
  }
}
