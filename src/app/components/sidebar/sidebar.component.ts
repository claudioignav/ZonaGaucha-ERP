import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false
})
export class SidebarComponent {
  pestanaActiva: string = 'administrar-cuentas';

  cambiarPestana(pestana: string): void {
    this.pestanaActiva = pestana;
  }
}