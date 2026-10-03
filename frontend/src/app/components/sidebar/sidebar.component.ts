import { Component } from '@angular/core';
import { enlacesCatalogos, enlacesModulos, enlacesPrincipales, usuarioActual } from '../../models/menu';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  enlacesPrincipales = enlacesPrincipales;
  enlacesModulos = enlacesModulos;
  enlacesCatalogos = enlacesCatalogos;
  usuario = usuarioActual;

  menuMovilAbierto = false;

  modulosAbierto = true;
  catalogosAbierto = true;

  alternarMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }
}
