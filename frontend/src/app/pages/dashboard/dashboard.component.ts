import { finalize } from 'rxjs';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  estadisticasEmpresa,
  resumenFinanciero,
  ventasPorMes,
  ventasPorPlataforma,
} from '../../models/dashboard';
import { DashboardService, ResumenDashboard } from '../../services/dashboard.service';

// mismos colores que el prototipo para los canales de venta, en el orden en que llegan.
const COLORES_PLATAFORMA = ['#1e3f20', '#2e7d32', '#52b788', '#a3e635'];
const SUFIJOS_VARIACION: Record<string, string> = {
  'Total Vendido': 'este mes',
  Utilidades: 'de utilidad este mes',
  'Total Comprado': 'en insumos este mes',
};
// la línea mensual va de x=48 a x=580 dentro del viewBox de 620 px
const ORIGEN_EJE_X = 48;
const ANCHO_EJE_X = 532;
// las mini tendencias usan un viewBox de 96 x 40
const ANCHO_TENDENCIA = 96;
const ALTO_TENDENCIA = 40;

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly detector = inject(ChangeDetectorRef);

  refrescar(): void {
    this.detector.markForCheck();
  }

  mensajeError = '';

  private readonly dashboardService = inject(DashboardService);

  resumen = resumenFinanciero.map((tarjeta) => ({ ...tarjeta }));

  estadisticas = estadisticasEmpresa.map((estadistica) => ({ ...estadistica }));

  ventasMensuales = ventasPorMes;

  ventasPlataforma = ventasPorPlataforma;

  get ventasMaximas(): number {
    const mayor = Math.max(0, ...this.ventasMensuales.map((venta) => venta.cantidad));

    return mayor > 0 ? Math.ceil(mayor / 4) * 4 : 4;
  }

  get etiquetasEje(): number[] {
    return [4, 3, 2, 1, 0].map((parte) => (this.ventasMaximas * parte) / 4);
  }

  ngOnInit(): void {
    this.dashboardService
      .resumen()
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: (datos) => this.mostrar(datos),
        error: (error: Error) => {
          this.mensajeError = error.message;
        },
      });
  }

  private mostrar(datos: ResumenDashboard): void {
    const montos: Record<string, number> = {
      'Total Vendido': datos.totalVendido,
      Utilidades: datos.utilidades,
      'Total Comprado': datos.totalComprado,
    };
    const totales: Record<string, number> = {
      Productos: datos.productos,
      'Número de Cuentas': datos.cuentas,
      'Proveedores Activos': datos.proveedores,
      'Categorías de Productos': datos.categorias,
    };
    const tendencias: Record<string, number[]> = {
      'Total Vendido': datos.tendencias.totalVendido,
      Utilidades: datos.tendencias.utilidades,
      'Total Comprado': datos.tendencias.totalComprado,
    };
    const variaciones: Record<string, number | null> = {
      'Total Vendido': datos.variaciones.totalVendido,
      Utilidades: datos.variaciones.utilidades,
      'Total Comprado': datos.variaciones.totalComprado,
    };
    const nuevosMes: Record<string, number> = {
      Productos: datos.productosNuevosMes,
      'Categorías de Productos': datos.categoriasNuevasMes,
    };

    this.resumen = this.resumen.map((tarjeta) => ({
      ...tarjeta,
      monto: montos[tarjeta.titulo] ?? 0,
      tendencia: this.puntosTendencia(tendencias[tarjeta.titulo] ?? []),
      variacion: this.formatearVariacion(
        variaciones[tarjeta.titulo] ?? null,
        SUFIJOS_VARIACION[tarjeta.titulo],
      ),
    }));
    this.estadisticas = this.estadisticas.map((estadistica) => ({
      ...estadistica,
      total: totales[estadistica.etiqueta] ?? 0,
      detalle:
        estadistica.etiqueta in nuevosMes
          ? this.detalleNuevos(nuevosMes[estadistica.etiqueta])
          : undefined,
    }));
    this.ventasMensuales = datos.ventasPorMes;
    this.ventasPlataforma = datos.ventasPorPlataforma.map((item, i) => ({
      ...item,
      color: COLORES_PLATAFORMA[i % COLORES_PLATAFORMA.length],
    }));
  }

  puntoX(indice: number): number {
    const pasos = Math.max(this.ventasMensuales.length - 1, 1);

    return ORIGEN_EJE_X + (indice * ANCHO_EJE_X) / pasos;
  }

  puntosTendencia(valores: number[]): string {
    if (valores.length === 0) return '';

    const minimo = Math.min(...valores);
    const rango = Math.max(...valores) - minimo;
    const paso = ANCHO_TENDENCIA / Math.max(valores.length - 1, 1);

    return valores
      .map((valor, i) => {
        const y =
          rango === 0
            ? ALTO_TENDENCIA / 2
            : ALTO_TENDENCIA - 2 - ((valor - minimo) / rango) * (ALTO_TENDENCIA - 4);

        return (i * paso).toFixed(1) + ',' + y.toFixed(1);
      })
      .join(' ');
  }

  detalleNuevos(cantidad: number): string {
    return `${cantidad} ${cantidad === 1 ? 'nuevo' : 'nuevos'} este mes`;
  }

  formatearVariacion(variacion: number | null, sufijo: string): string {
    if (variacion === null) return 'Sin información del mes anterior';

    const signo = variacion > 0 ? '+' : '';

    return `${signo}${variacion.toFixed(1).replace('.', ',')}% ${sufijo}`;
  }

  puntoY(cantidad: number): number {
    return 200 - (cantidad / this.ventasMaximas) * 180;
  }

  get puntosLinea(): string {
    return this.ventasMensuales
      .map((venta, i) => this.puntoX(i) + ',' + this.puntoY(venta.cantidad))
      .join(' ');
  }

  get fondoDona(): string {
    let acumulado = 0;
    const tramos = this.ventasPlataforma.map((item) => {
      const inicio = acumulado;

      acumulado += item.porcentaje;

      return item.color + ' ' + inicio + '% ' + acumulado + '%';
    });

    return 'conic-gradient(' + tramos.join(', ') + ')';
  }
}
