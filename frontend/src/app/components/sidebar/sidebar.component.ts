import { Component } from '@angular/core';
import { enlacesCatalogos, enlacesModulos, enlacesPrincipales } from '../../models/menu';
import { AuthService } from '../../services/auth.service';
import { rutaInicio, tienePermiso } from '../../models/permisos';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  get enlacesPrincipales() {
    return enlacesPrincipales.filter((enlace) =>
      tienePermiso(this.sesion?.rol, enlace.ruta === '/dashboard' ? 'ver-metricas' : 'gestionar-cuentas'),
    );
  }

  get inicio(): string {
    return rutaInicio(this.sesion?.rol);
  }

  enlacesModulos = enlacesModulos;

  enlacesCatalogos = enlacesCatalogos;

  menuMovilAbierto = false;

  modulosAbierto = true;

  catalogosAbierto = true;

  constructor(private readonly authService: AuthService) {}

  get sesion() {
    return this.authService.sesion;
  }

  get nombreCompleto(): string {
    const nombre = this.sesion?.nombre || '';
    const apellidos = this.sesion?.apellidos || '';

    return `${nombre} ${apellidos}`.trim();
  }

  alternarMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}
