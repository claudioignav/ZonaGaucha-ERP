import { Component } from '@angular/core';
import { Plataforma } from '../../models/plataforma';
import { PaginaCatalogo } from '../pagina-catalogo';

@Component({
  selector: 'app-plataformas',
  standalone: false,
  templateUrl: './plataformas.component.html',
  styleUrl: './plataformas.component.scss',
})
export class PlataformasComponent extends PaginaCatalogo<'plataformas'> {
  protected readonly tipo = 'plataformas';

  protected readonly obligatorios: (keyof Omit<Plataforma, 'id'>)[] = ['nombre', 'tiposPago'];

  protected registroVacio(): Omit<Plataforma, 'id'> {
    return { nombre: '', tiposPago: [] };
  }

  tiposPagoDisponibles: string[] = [];

  override ngOnInit(): void {
    super.ngOnInit();
    this.catalogoService.listar('tipos-pago').subscribe({
      next: (registros) => {
        this.tiposPagoDisponibles = registros.map((registro) => registro.nombre);
        this.refrescar();
      },
      error: (error: Error) => {
        this.mensajeError = error.message;
        this.refrescar();
      },
    });
  }

  get tipoPagoElegido(): string {
    return this.nuevo.tiposPago[0] ?? '';
  }

  set tipoPagoElegido(valor: string) {
    this.nuevo.tiposPago = valor ? [valor] : [];
  }

  get tipoPagoEditado(): string {
    return this.edicion?.tiposPago[0] ?? '';
  }

  set tipoPagoEditado(valor: string) {
    if (this.edicion) this.edicion.tiposPago = valor ? [valor] : [];
  }
}
