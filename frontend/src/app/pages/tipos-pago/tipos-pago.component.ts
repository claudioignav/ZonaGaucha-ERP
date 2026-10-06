import { Component } from '@angular/core';
import { TipoPago, tiposPagoRegistrados } from '../../models/tipo-pago';

@Component({
  selector: 'app-tipos-pago',
  standalone: false,
  templateUrl: './tipos-pago.component.html',
  styleUrl: './tipos-pago.component.scss',
})
export class TiposPagoComponent {
  tiposPago: TipoPago[] = tiposPagoRegistrados;
}
