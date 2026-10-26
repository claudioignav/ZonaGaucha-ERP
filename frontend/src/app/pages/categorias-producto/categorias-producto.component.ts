import { Component } from '@angular/core';
import { CategoriaProducto } from '../../models/categoria-producto';
import { PaginaCatalogo } from '../pagina-catalogo';

@Component({
  selector: 'app-categorias-producto',
  standalone: false,
  templateUrl: './categorias-producto.component.html',
  styleUrl: './categorias-producto.component.scss',
})
export class CategoriasProductoComponent extends PaginaCatalogo<'categorias-producto'> {
  protected readonly tipo = 'categorias-producto';

  protected readonly obligatorios: (keyof Omit<CategoriaProducto, 'id'>)[] = ['nombre'];

  protected registroVacio(): Omit<CategoriaProducto, 'id'> {
    return { nombre: '' };
  }
}
