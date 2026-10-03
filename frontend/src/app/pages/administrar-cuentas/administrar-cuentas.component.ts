import { Component } from '@angular/core';
import { Usuario, usuariosRegistrados } from '../../models/usuario';

@Component({
  selector: 'app-administrar-cuentas',
  standalone: false,
  templateUrl: './administrar-cuentas.component.html',
  styleUrl: './administrar-cuentas.component.scss',
})
export class AdministrarCuentasComponent {
  usuarios: Usuario[] = usuariosRegistrados;

  mostrarContrasena = false;
}
