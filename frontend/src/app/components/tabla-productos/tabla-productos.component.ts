import { Component, Input } from '@angular/core';
import { DetalleProducto } from '../../models/venta';

@Component({
  selector: 'app-tabla-productos',
  standalone: false,
  templateUrl: './tabla-productos.component.html',
  styleUrl: './tabla-productos.component.scss',
  host: { class: 'block' },
})
export class TablaProductosComponent {
  @Input() productos: DetalleProducto[] = [];
  @Input() opciones: string[] = [];
  @Input() textoBoton = 'Agregar Producto';
  @Input() filaAlterna = false;

  agregarProducto(): void {
    this.productos.push({ producto: '', cantidad: 1 });
  }

  quitarProducto(indice: number): void {
    this.productos.splice(indice, 1);
  }
}
