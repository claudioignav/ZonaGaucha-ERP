import { Component } from '@angular/core';
import { CategoriaProducto, categoriasRegistradas } from '../../models/categoria-producto';

@Component({
  selector: 'app-categorias-producto',
  standalone: false,
  templateUrl: './categorias-producto.component.html',
  styleUrl: './categorias-producto.component.scss',
})
export class CategoriasProductoComponent {
  categorias: CategoriaProducto[] = categoriasRegistradas;
}
