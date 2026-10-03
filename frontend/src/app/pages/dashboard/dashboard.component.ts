import { Component } from '@angular/core';
import { estadisticasEmpresa, resumenFinanciero, ventasPorMes, ventasPorPlataforma } from '../../models/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  resumen = resumenFinanciero;
  estadisticas = estadisticasEmpresa;
  ventasMensuales = ventasPorMes;
  ventasPlataforma = ventasPorPlataforma;

  private readonly ventasMaximas = 4000;

  puntoX(indice: number): number {
    return 48 + indice * 76;
  }

  puntoY(cantidad: number): number {
    return 200 - (cantidad / this.ventasMaximas) * 180;
  }

  get puntosLinea(): string {
    return this.ventasMensuales.map((venta, i) => this.puntoX(i) + ',' + this.puntoY(venta.cantidad)).join(' ');
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
