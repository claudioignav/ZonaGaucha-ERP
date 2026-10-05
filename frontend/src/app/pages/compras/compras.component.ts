import { Component } from '@angular/core';
import { Compra, comprasRegistradas, resumenCompras } from '../../models/compra';

@Component({
  selector: 'app-compras',
  standalone: false,
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.scss',
})
export class ComprasComponent {
  compras: Compra[] = comprasRegistradas;
  resumen = resumenCompras;
}
