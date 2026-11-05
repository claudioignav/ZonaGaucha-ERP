import { finalize } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { aCentavos, subtotalLinea, totalLineas } from '../../models/importes';
import { DetalleProducto, nuevaVentaVacia, opcionesVenta, OpcionesVenta, VentaFormulario } from '../../models/venta';
import { VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-nueva-venta',
  standalone: false,
  templateUrl: './nueva-venta.component.html',
  styleUrl: './nueva-venta.component.scss',
})
export class NuevaVentaComponent implements OnInit {
  private readonly detector = inject(ChangeDetectorRef);

  refrescar(): void {
    this.detector.markForCheck();
  }

  venta: VentaFormulario = {
    ...nuevaVentaVacia(),
    productos: [{ producto: '', cantidad: 1, precioUnitario: null }],
  };

  opciones: OpcionesVenta = opcionesVenta;

  mensajeError = '';

  constructor(
    private readonly router: Router,
    private readonly ventaService: VentaService,
  ) {}

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
  }

  get valorBruto(): number {
    return totalLineas(this.venta.productos);
  }

  get valorNeto(): number {
    return (aCentavos(this.valorBruto) + aCentavos(this.venta.valorAdicional)) / 100;
  }

  subtotal(detalle: DetalleProducto): number {
    return subtotalLinea(detalle);
  }

  // el precio de catálogo solo es el valor inicial de la línea, el usuario puede cambiarlo sin tocar el catálogo.
  seleccionarProducto(detalle: DetalleProducto): void {
    const precio = this.opciones.preciosProductos?.find((item) => item.nombre === detalle.producto);

    detalle.precioUnitario = precio?.precioVenta ?? null;
  }

  agregarProducto(): void {
    this.venta.productos.push({ producto: '', cantidad: 1, precioUnitario: null });
  }

  quitarProducto(indice: number): void {
    this.venta.productos.splice(indice, 1);
  }

  get lineasCompletas(): boolean {
    return this.venta.productos.every(
      (linea) =>
        linea.producto !== '' && Number(linea.cantidad) > 0 && Number(linea.precioUnitario) > 0,
    );
  }

  guardarVenta(): void {
    this.ventaService
      .crear({
        ...this.venta,
        productos: this.venta.productos.map(({ producto, cantidad, precioUnitario }) => ({
          producto,
          cantidad,
          precioUnitario,
        })),
        valorBruto: this.valorBruto,
        valorNeto: this.valorNeto,
      })
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: () => {
          void this.router.navigate(['/ventas']);
        },
        error: (error: Error) => (this.mensajeError = error.message),
      });
  }
}
