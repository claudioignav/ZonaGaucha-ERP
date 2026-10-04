import { Component, Input, ViewEncapsulation } from '@angular/core';

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

  paginaActual = 1;

  get totalPaginas(): number {
    return Math.ceil(this.totalRegistros / this.registrosPorPagina);
  }

  get paginasVisibles(): number[] {
    const cantidad = Math.min(this.totalPaginas, 10);
    return Array.from({ length: cantidad }, (_, i) => i + 1);
  }

  get primerRegistro(): number {
    return (this.paginaActual - 1) * this.registrosPorPagina + 1;
  }

  get ultimoRegistro(): number {
    return Math.min(this.paginaActual * this.registrosPorPagina, this.totalRegistros);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }
}
