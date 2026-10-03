import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Credenciales, credencialesIniciales } from '../../models/credenciales';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  credenciales: Credenciales = { ...credencialesIniciales };
  mensajeError = '';
  mostrarContrasena = false;

  constructor(private readonly router: Router) {}

  iniciarSesion(): void {
    const { correo, contrasena } = this.credenciales;
    if (!correo.trim() || !contrasena.trim()) {
      this.mensajeError = 'Ingresa tu correo y contraseña.';
      return;
    }

    if (!correo.includes('@')) {
      this.mensajeError = 'El correo electrónico no es válido.';
      return;
    }

    this.mensajeError = '';
    this.router.navigate(['/dashboard']).catch(() => {
      this.mensajeError = 'No se pudo abrir el dashboard. Inténtalo nuevamente.';
    });
  }
}
