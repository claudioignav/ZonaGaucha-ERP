import { Component } from '@angular/core';
import { Lote, lotesRegistrados, resumenInventario } from '../../models/lote';

@Component({
  selector: 'app-inventario',
  standalone: false,
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss',
})
export class InventarioComponent {
  lotes: Lote[] = lotesRegistrados;
  resumen = resumenInventario;

  filtroLote = '';
  filtroProveedor = '';

  get lotesFiltrados(): Lote[] {
    const numero = this.filtroLote.trim();
    const proveedor = this.filtroProveedor.trim().toLowerCase();
    return this.lotes.filter(
      (lote) =>
        (!numero || String(lote.numero) === numero) &&
        (!proveedor || lote.proveedor.toLowerCase().includes(proveedor)),
    );
  }

  porcentajeDisponible(lote: Lote): number {
    if (!lote.unidadesTotales) {
      return 0;
    }
    return Math.round((lote.unidadesDisponibles / lote.unidadesTotales) * 100);
  }
}
