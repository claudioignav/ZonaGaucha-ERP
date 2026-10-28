import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { tienePermiso } from '../../models/permisos';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { resumenVentas, Venta, opcionesVenta } from '../../models/venta';
import { FiltrosVenta, VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-ventas',
  standalone: false,
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss',
})
export class VentasComponent implements OnInit {
  private readonly authService = inject(AuthService);

  get puedeVerMetricas(): boolean {
    return tienePermiso(this.authService.sesion?.rol, 'ver-metricas');
  }

  get puedeModificar(): boolean {
    return tienePermiso(this.authService.sesion?.rol, 'modificar-venta');
  }
  private readonly detector = inject(ChangeDetectorRef);

  refrescar(): void {
    this.detector.markForCheck();
  }

  mensajeError = '';

  private readonly ventaService = inject(VentaService);

  ventas: Venta[] = [];
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  get ventasVisibles(): Venta[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.ventas.slice(inicio, inicio + this.registrosPorPagina);
  }

  resumen = { ...resumenVentas };

  opciones = opcionesVenta;

  filtros: FiltrosVenta = { numeroFactura: '', fechaVenta: '', plataforma: '', tipoPago: '' };

  ngOnInit(): void {
    this.ventaService
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
    this.buscarVentas();
    if (this.puedeVerMetricas) {
      this.ventaService
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

  buscarVentas(): void {
    this.ventaService
      .listar(this.filtros)
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: (ventas) => {
          this.ventas = ventas;
          this.paginaActual = 1;
        },
        error: (error: Error) => {
          this.mensajeError = error.message;
        },
      });
  }

  unidades(venta: Venta): number {
    return venta.productos.reduce((suma, linea) => suma + Number(linea.cantidad), 0);
  }

  // venta abierta en el cuadro de detalle, null cuando no hay ninguna abierta.
  detalle: Venta | null = null;

  abrirDetalle(venta: Venta): void {
    this.detalle = venta;
  }

  cerrarDetalle(): void {
    this.detalle = null;
  }
}
