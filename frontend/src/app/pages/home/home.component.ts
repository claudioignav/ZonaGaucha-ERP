import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent {
  // Datos seteados estáticamente para mostrar en la interfaz
  totalVendido: number = 12450000;
  porcentajeVendido: string = '+14.2%';
  
  utilidades: number = 3200000;
  porcentajeUtilidades: string = '+8.5%';
  
  totalComprado: number = 9940000;
  porcentajeComprado: string = '+4.1%';

  // Estadísticas del catálogo inferior
  totalProductos: number = 12;
  metodosPago: number = 4;
  proveedoresActivos: number = 5;
  categoriasProductos: number = 3;
}