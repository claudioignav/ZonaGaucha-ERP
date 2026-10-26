import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-botones-acciones',
  standalone: false,
  templateUrl: './botones-acciones.component.html',
  styleUrl: './botones-acciones.component.scss',
})
export class BotonesAccionesComponent {
  @Output() editar = new EventEmitter<void>();

  @Output() eliminar = new EventEmitter<void>();
}
