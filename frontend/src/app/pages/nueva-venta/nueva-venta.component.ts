import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { nuevaVentaVacia, opcionesVenta } from '../../models/venta';

@Component({
  selector: 'app-nueva-venta',
  standalone: false,
  templateUrl: './nueva-venta.component.html',
  styleUrl: './nueva-venta.component.scss',
})
export class NuevaVentaComponent {
  venta = nuevaVentaVacia();
  opciones = opcionesVenta;

  constructor(private readonly router: Router) {}

  guardarVenta(): void {
    void this.router.navigate(['/ventas']);
  }
}
