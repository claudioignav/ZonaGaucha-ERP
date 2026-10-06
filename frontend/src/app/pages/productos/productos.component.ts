import { Component } from '@angular/core';
import { Producto, productosRegistrados } from '../../models/producto';

@Component({
  selector: 'app-productos',
  standalone: false,
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss',
})
export class ProductosComponent {
  productos: Producto[] = productosRegistrados;
}
