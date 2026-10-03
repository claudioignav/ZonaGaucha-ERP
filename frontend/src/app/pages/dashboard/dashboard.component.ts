import { Component } from '@angular/core';
import { estadisticasEmpresa, resumenFinanciero } from '../../models/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  resumen = resumenFinanciero;
  estadisticas = estadisticasEmpresa;
}
