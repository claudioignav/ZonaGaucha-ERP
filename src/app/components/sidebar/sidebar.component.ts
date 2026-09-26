import { Component, EventEmitter, Output } from '@angular/core';

export interface ElementoMenu {
  id: string;
  nombre: string;
  icono: string;
}

interface SeccionMenu {
  id: string;
  titulo: string;
  expandida: boolean;
  elementos: ElementoMenu[];
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Output() elementoSeleccionado = new EventEmitter<ElementoMenu>();

  menuMovilAbierto = false;
  elementoActivo = 'dashboard';

  readonly elementosPrincipales: ElementoMenu[] = [
    {
      id: 'dashboard',
      nombre: 'Dashboard',
      icono: 'assets/icons/home.svg'
    },
    {
      id: 'administrar-cuentas',
      nombre: 'Administrar Cuentas',
      icono: 'assets/icons/user-check.svg'
    }
  ];

  readonly secciones: SeccionMenu[] = [
    {
      id: 'modulos',
      titulo: 'MÓDULOS',
      expandida: true,
      elementos: [
        { id: 'ventas', nombre: 'Ventas', icono: 'assets/icons/shopping-cart.svg' },
        { id: 'compras', nombre: 'Compras', icono: 'assets/icons/shopping-bag.svg' },
        { id: 'inventario', nombre: 'Inventario', icono: 'assets/icons/database.svg' }
      ]
    },
    {
      id: 'catalogos',
      titulo: 'CATÁLOGOS',
      expandida: true,
      elementos: [
        { id: 'productos', nombre: 'Productos', icono: 'assets/icons/package.svg' },
        { id: 'proveedores', nombre: 'Proveedores', icono: 'assets/icons/users.svg' },
        { id: 'tipos-pago', nombre: 'Tipos de Pago', icono: 'assets/icons/credit-card.svg' },
        { id: 'plataformas', nombre: 'Plataformas', icono: 'assets/icons/globe.svg' },
        { id: 'tipos-contenido', nombre: 'Tipos de Contenido', icono: 'assets/icons/layers.svg' },
        { id: 'categoria-producto', nombre: 'Categoría de Producto', icono: 'assets/icons/tag.svg' }
      ]
    }
  ];

  seleccionarElemento(elemento: ElementoMenu): void {
    this.elementoActivo = elemento.id;
    this.elementoSeleccionado.emit(elemento);
    this.menuMovilAbierto = false;
  }

  alternarSeccion(seccion: SeccionMenu): void {
    seccion.expandida = !seccion.expandida;
  }

  alternarMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }
}
