import { finalize } from 'rxjs';
import { Directive, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  CatalogoService,
  DatosCatalogo,
  MapaCatalogos,
  TipoCatalogo,
} from '../services/catalogo.service';

@Directive()
export abstract class PaginaCatalogo<K extends TipoCatalogo> implements OnInit {
  private readonly detector = inject(ChangeDetectorRef);

  protected refrescar(): void {
    this.detector.markForCheck();
  }

  protected readonly catalogoService = inject(CatalogoService);
  protected abstract readonly tipo: K;
  protected abstract readonly obligatorios: (keyof DatosCatalogo<K>)[];

  registros: MapaCatalogos[K][] = [];
  nuevo: DatosCatalogo<K> = this.registroVacio();
  // copia que se edita en la ventana, separada del formulario de alta.
  edicion: DatosCatalogo<K> | null = null;
  editandoId: number | null = null;
  mensajeError = '';
  mensajeEdicion = '';

  protected abstract registroVacio(): DatosCatalogo<K>;

  // las páginas amplían estas reglas cuando un campo necesita validación o formato propio.
  protected validar(datos: DatosCatalogo<K>): boolean {
    return this.obligatorios.every((campo) => {
      const valor = datos[campo] as unknown;

      return Array.isArray(valor) ? valor.length > 0 : String(valor ?? '').trim() !== '';
    });
  }

  protected normalizar(datos: DatosCatalogo<K>): DatosCatalogo<K> {
    return datos;
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.catalogoService
      .listar(this.tipo)
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: (registros) => (this.registros = registros),
        error: (error: Error) => {
          this.mensajeError = error.message;
        },
      });
  }

  guardar(valido: boolean | null = true): void {
    if (!valido || !this.validar(this.nuevo)) {
      this.mensajeError = 'Completa los campos obligatorios con datos válidos.';

      return;
    }

    this.catalogoService
      .crear(this.tipo, this.normalizar(this.nuevo))
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: () => this.limpiar(),
        error: (error: Error) => (this.mensajeError = error.message),
      });
  }

  guardarEdicion(valido: boolean | null = true): void {
    if (!this.edicion || this.editandoId === null) return;

    if (!valido || !this.validar(this.edicion)) {
      this.mensajeEdicion = 'Completa los campos obligatorios con datos válidos.';

      return;
    }

    this.catalogoService
      .actualizar(this.tipo, this.editandoId, this.normalizar(this.edicion))
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: () => {
          this.cancelarEdicion();
          this.cargar();
        },
        error: (error: Error) => (this.mensajeEdicion = error.message),
      });
  }

  editar(registro: MapaCatalogos[K]): void {
    const { id, ...datos } = registro;

    this.editandoId = id;
    this.edicion = datos as DatosCatalogo<K>;
    this.mensajeEdicion = '';
  }

  cancelarEdicion(): void {
    this.edicion = null;
    this.editandoId = null;
    this.mensajeEdicion = '';
  }

  eliminar(registro: MapaCatalogos[K]): void {
    this.catalogoService
      .eliminar(this.tipo, registro.id)
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: () => this.cargar(),
        error: (error: Error) => (this.mensajeError = error.message),
      });
  }

  private limpiar(): void {
    this.nuevo = this.registroVacio();
    this.mensajeError = '';
    this.cargar();
  }
}
