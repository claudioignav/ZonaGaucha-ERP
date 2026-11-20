import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { tienePermiso } from '../../models/permisos';
import { Component, inject, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { resumenVentas, Venta, opcionesVenta } from '../../models/venta';
import { FiltrosVenta, VentaService } from '../../services/venta.service';

// usa la fecha local para que el dia elegido no cambie al pasarlo a utc
const aTexto = (fecha: Date | null): string =>
  fecha
    ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
    : '';

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

  puedeModificarVenta(venta: Venta): boolean {
    const plataforma = venta.plataforma.toLowerCase().replace(/\s+/g, '');
    return this.puedeModificar && !['shopify', 'mercadolibre'].includes(plataforma);
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

  filtros: FiltrosVenta = { numeroFactura: '', plataforma: '', tipoPago: '' };

  // el calendario entrega fechas, la api las recibe como aaaa-mm-dd
  rango: { desde: Date | null; hasta: Date | null } = { desde: null, hasta: null };

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
    const { desde, hasta } = this.rango;
    if (desde && hasta && desde > hasta) {
      this.mensajeError = 'La fecha desde no puede ser posterior a la fecha hasta';
      return;
    }
    this.mensajeError = '';
    this.ventaService
      .listar({ ...this.filtros, desde: aTexto(desde), hasta: aTexto(hasta) })
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

  // venta abierta en el cuadro de detalle, null cuando no hay ninguna abierta
  detalle: Venta | null = null;

  private dialogoDetalle?: HTMLDialogElement;

  @ViewChild('dialogoDetalle')
  set referenciaDetalle(referencia: ElementRef<HTMLDialogElement> | undefined) {
    this.dialogoDetalle = referencia?.nativeElement;
    if (this.dialogoDetalle && !this.dialogoDetalle.open) {
      this.dialogoDetalle.showModal();
    }
  }

  abrirDetalle(venta: Venta): void {
    this.detalle = venta;
  }

  cerrarDetalle(): void {
    if (this.dialogoDetalle?.open) {
      this.dialogoDetalle.close();
    }
    this.detalle = null;
  }
}
