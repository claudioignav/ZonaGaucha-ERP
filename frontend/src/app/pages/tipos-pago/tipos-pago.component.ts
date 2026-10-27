import { Component } from '@angular/core';
import { TipoPago } from '../../models/tipo-pago';
import { PaginaCatalogo } from '../pagina-catalogo';

@Component({
  selector: 'app-tipos-pago',
  standalone: false,
  templateUrl: './tipos-pago.component.html',
  styleUrl: './tipos-pago.component.scss',
})
export class TiposPagoComponent extends PaginaCatalogo<'tipos-pago'> {
  protected readonly tipo = 'tipos-pago';

  protected readonly obligatorios: (keyof Omit<TipoPago, 'id'>)[] = ['nombre'];

  protected registroVacio(): Omit<TipoPago, 'id'> {
    return { nombre: '' };
  }
}
