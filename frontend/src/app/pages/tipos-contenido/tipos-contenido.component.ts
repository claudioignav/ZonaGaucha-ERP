import { Component } from '@angular/core';
import { TipoContenido } from '../../models/tipo-contenido';
import { PaginaCatalogo } from '../pagina-catalogo';

@Component({
  selector: 'app-tipos-contenido',
  standalone: false,
  templateUrl: './tipos-contenido.component.html',
  styleUrl: './tipos-contenido.component.scss',
})
export class TiposContenidoComponent extends PaginaCatalogo<'tipos-contenido'> {
  protected readonly tipo = 'tipos-contenido';

  protected readonly obligatorios: (keyof Omit<TipoContenido, 'id'>)[] = ['nombre'];

  protected registroVacio(): Omit<TipoContenido, 'id'> {
    return { nombre: '' };
  }
}
