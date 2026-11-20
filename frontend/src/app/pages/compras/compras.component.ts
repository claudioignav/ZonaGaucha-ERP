import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { tienePermiso } from '../../models/permisos';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Compra, resumenCompras, opcionesCompra } from '../../models/compra';
import { CompraService, FiltrosCompra } from '../../services/compra.service';

@Component({
  selector: 'app-compras',
  standalone: false,
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.scss',
})
export class ComprasComponent implements OnInit {
  private readonly authService = inject(AuthService);

  get puedeVerMetricas(): boolean {
    return tienePermiso(this.authService.sesion?.rol, 'ver-metricas');
  }

  get puedeModificar(): boolean {
    return tienePermiso(this.authService.sesion?.rol, 'modificar-compra');
  }
  private readonly detector = inject(ChangeDetectorRef);

  refrescar(): void {
    this.detector.markForCheck();
  }

  mensajeError = '';

  private readonly compraService = inject(CompraService);

  compras: Compra[] = [];
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  get comprasVisibles(): Compra[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.compras.slice(inicio, inicio + this.registrosPorPagina);
  }

  resumen = { ...resumenCompras };

  opciones = opcionesCompra;

  filtros: FiltrosCompra = { numeroFactura: '', fechaCompra: '', proveedor: '', tipoPago: '' };

  // filtros de la ultima busqueda, el pdf usa estos para que coincida con la tabla
  private filtrosAplicados: FiltrosCompra = { ...this.filtros };

  exportando = false;

  // compra abierta en el cuadro de detalle, null cuando no hay ninguna abierta
  detalle: Compra | null = null;

  ngOnInit(): void {
    this.compraService
      .opciones()
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: (opciones) => {
          this.opciones = opciones;
          this.refrescar();
        },
        error: (error: Error) => {
          this.mensajeError = error.message;
          this.refrescar();
        },
      });
    this.cargarCompras();
    if (this.puedeVerMetricas) {
      this.compraService
        .resumen()
        .pipe(finalize(() => this.refrescar()))
        .subscribe({
          next: (resumen) => (this.resumen = resumen),
          error: (error: Error) => {
            this.mensajeError = error.message;
          },
        });
    }
  }

  cargarCompras(): void {
    this.filtrosAplicados = { ...this.filtros };
    this.compraService
      .listar(this.filtros)
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: (compras) => {
          this.compras = compras;
          this.paginaActual = 1;
        },
        error: (error: Error) => {
          this.mensajeError = error.message;
        },
      });
  }

  exportarPdf(): void {
    if (this.exportando) return;
    this.exportando = true;
    this.mensajeError = '';
    this.compraService
      .exportarPdf(this.filtrosAplicados)
      .pipe(
        finalize(() => {
          this.exportando = false;
          this.refrescar();
        }),
      )
      .subscribe({
        next: (pdf) => this.descargar(pdf, `historial-compras-${new Date().toISOString().slice(0, 10)}.pdf`),
        error: (error: Error) => {
          this.mensajeError = error.message;
        },
      });
  }

  private descargar(archivo: Blob, nombre: string): void {
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  unidades(compra: Compra): number {
    return compra.productos.reduce((suma, linea) => suma + Number(linea.cantidad), 0);
  }

  abrirDetalle(compra: Compra): void {
    this.detalle = compra;
  }

  cerrarDetalle(): void {
    this.detalle = null;
  }
}
