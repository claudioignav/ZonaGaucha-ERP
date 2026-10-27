import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-tabla-contenido',
  standalone: false,
  templateUrl: './tabla-contenido.component.html',
  styleUrl: './tabla-contenido.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TablaContenidoComponent {
  @Input() totalRegistros = 0;
  @Input() paginado = false;
  @Input() registrosPorPagina = 10;
  @Input() compacta = false;

  @Input() paginaActual = 1;
  @Output() paginaCambiada = new EventEmitter<number>();

  get totalPaginas(): number {
    return Math.ceil(this.totalRegistros / this.registrosPorPagina);
  }

  get paginasVisibles(): number[] {
    const cantidad = Math.min(this.totalPaginas, 10);
    const inicio = Math.max(1, Math.min(this.paginaActual - 4, this.totalPaginas - cantidad + 1));
    return Array.from({ length: cantidad }, (_, i) => inicio + i);
  }

  get primerRegistro(): number {
    return this.totalRegistros === 0 ? 0 : (this.paginaActual - 1) * this.registrosPorPagina + 1;
  }

  get ultimoRegistro(): number {
    return Math.min(this.paginaActual * this.registrosPorPagina, this.totalRegistros);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaActual) {
      this.paginaActual = pagina;
      this.paginaCambiada.emit(pagina);
    }
  }
}
