import { Component } from '@angular/core';
import { resumenVentas, Venta, ventasRegistradas } from '../../models/venta';

@Component({
  selector: 'app-ventas',
  standalone: false,
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss',
})
export class VentasComponent {
  ventas: Venta[] = ventasRegistradas;
  resumen = resumenVentas;
}
