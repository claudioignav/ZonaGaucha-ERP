import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { nuevaCompraVacia, opcionesCompra } from '../../models/compra';

@Component({
  selector: 'app-nueva-compra',
  standalone: false,
  templateUrl: './nueva-compra.component.html',
  styleUrl: './nueva-compra.component.scss',
})
export class NuevaCompraComponent {
  compra = nuevaCompraVacia();
  opciones = opcionesCompra;

  constructor(private readonly router: Router) {}

  get compraNeta(): number {
    return (Number(this.compra.compraBruta) || 0) + (Number(this.compra.impuesto) || 0);
  }

  guardarCompra(): void {
    this.router.navigate(['/compras']);
  }
}
