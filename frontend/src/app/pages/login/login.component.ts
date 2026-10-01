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

  constructor(private router: Router) {}

  // Todavía no hay backend: solo revisa que el usuario haya escrito sus datos y lo deja entrar
  iniciarSesion(): void {
    const { correo, contrasena } = this.credenciales;
    if (!correo.trim() || !contrasena.trim()) {
      this.mensajeError = 'Ingresa tu correo y contraseña.';
      return;
    }

    this.mensajeError = '';
    this.router.navigate(['/dashboard']);
  }
}
