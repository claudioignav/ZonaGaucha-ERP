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

  porcentajeDisponible(lote: Lote): number {
    if (!lote.unidadesTotales) {
      return 0;
    }
    return Math.round((lote.unidadesDisponibles / lote.unidadesTotales) * 100);
  }
}
