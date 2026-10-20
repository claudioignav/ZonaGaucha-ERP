import { finalize } from 'rxjs';
import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Credenciales, credencialesIniciales } from '../../models/credenciales';
import { esCorreoValido } from '../../validators/correo.validator';
import { AuthService } from '../../services/auth.service';
import { rutaInicio } from '../../models/permisos';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly detector = inject(ChangeDetectorRef);

  refrescar(): void {
    this.detector.markForCheck();
  }

  credenciales: Credenciales = { ...credencialesIniciales };

  mensajeError = '';

  mostrarContrasena = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  iniciarSesion(): void {
    const { correo, contrasena } = this.credenciales;
    if (!correo.trim() || !contrasena.trim()) {
      this.mensajeError = 'Ingresa tu correo y contraseña.';

      return;
    }

    if (!esCorreoValido(correo)) {
      this.mensajeError = 'El correo electrónico no es válido.';

      return;
    }

    this.mensajeError = '';

    this.authService
      .iniciarSesion(this.credenciales)
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: (sesion) => {
          this.mensajeError = '';
          this.router.navigate([rutaInicio(sesion.rol)]).catch(() => {
            this.mensajeError = 'No se pudo abrir el sistema. Inténtalo nuevamente.';
            this.refrescar();
          });
        },
        error: (error: Error) => (this.mensajeError = error.message),
      });
  }
}
