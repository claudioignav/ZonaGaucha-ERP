import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tarjeta-resumen',
  standalone: false,
  templateUrl: './tarjeta-resumen.component.html',
  styleUrl: './tarjeta-resumen.component.scss',
  host: { class: 'block' },
})
export class TarjetaResumenComponent {
  @Input() titulo = '';
  @Input() icono = '';
  @Input() claseValor = '';
}
