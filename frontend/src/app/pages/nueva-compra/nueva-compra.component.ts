import { finalize } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CompraFormulario, DetalleCompra, nuevaCompraVacia, opcionesCompra } from '../../models/compra';
import { impuestoDe, interpretarImpuesto, netoDe, subtotalLinea, totalLineas } from '../../models/importes';
import { CompraService } from '../../services/compra.service';

@Component({
  selector: 'app-nueva-compra',
  standalone: false,
  templateUrl: './nueva-compra.component.html',
  styleUrl: './nueva-compra.component.scss',
})
export class NuevaCompraComponent implements OnInit {
  private readonly detector = inject(ChangeDetectorRef);

  refrescar(): void {
    this.detector.markForCheck();
  }

  compra: CompraFormulario = {
    ...nuevaCompraVacia(),
    productos: [{ producto: '', cantidad: 1, precioUnitario: null }],
  };

  opciones = opcionesCompra;

  mensajeError = '';

  constructor(
    private readonly router: Router,
    private readonly compraService: CompraService,
  ) {}

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
  }

  // la compra bruta sale de las líneas, el precio de cada línea se escribe a mano.
  get compraBruta(): number {
    return totalLineas(this.compra.productos);
  }

  get impuesto(): number {
    return impuestoDe(this.compraBruta, this.compra.impuesto);
  }

  get compraNeta(): number {
    return netoDe(this.compraBruta, this.impuesto);
  }

  subtotal(detalle: DetalleCompra): number {
    return subtotalLinea(detalle);
  }

  agregarProducto(): void {
    this.compra.productos.push({ producto: '', cantidad: 1, precioUnitario: null });
  }

  quitarProducto(indice: number): void {
    this.compra.productos.splice(indice, 1);
  }

  get lineasCompletas(): boolean {
    return this.compra.productos.every(
      (linea) =>
        linea.producto !== '' && Number(linea.cantidad) > 0 && Number(linea.precioUnitario) > 0,
    );
  }

  get impuestoValido(): boolean {
    return interpretarImpuesto(this.compra.impuesto).valido;
  }

  guardarCompra(): void {
    const { porcentaje, valor } = interpretarImpuesto(this.compra.impuesto);

    this.compraService
      .crear({
        ...this.compra,
        productos: this.compra.productos.map(({ producto, cantidad, precioUnitario }) => ({
          producto,
          cantidad,
          precioUnitario,
        })),
        compraBruta: this.compraBruta,
        impuesto: valor,
        tipoImpuesto: porcentaje ? 'porcentaje' : 'monto',
      })
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: () => {
          void this.router.navigate(['/compras']);
        },
        error: (error: Error) => (this.mensajeError = error.message),
      });
  }
}
