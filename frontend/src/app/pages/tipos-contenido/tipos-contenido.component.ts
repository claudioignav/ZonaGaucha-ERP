import { Component } from '@angular/core';
import { TipoContenido, tiposContenidoRegistrados } from '../../models/tipo-contenido';

@Component({
  selector: 'app-tipos-contenido',
  standalone: false,
  templateUrl: './tipos-contenido.component.html',
  styleUrl: './tipos-contenido.component.scss',
})
export class TiposContenidoComponent {
  tiposContenido: TipoContenido[] = tiposContenidoRegistrados;
}
