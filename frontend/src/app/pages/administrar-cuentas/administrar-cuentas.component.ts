import { finalize } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { UsuarioEdicion, UsuarioNuevo, UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-administrar-cuentas',
  standalone: false,
  templateUrl: './administrar-cuentas.component.html',
  styleUrl: './administrar-cuentas.component.scss',
})
export class AdministrarCuentasComponent implements OnInit {
  private readonly detector = inject(ChangeDetectorRef);

  refrescar(): void {
    this.detector.markForCheck();
  }

  usuarios: Usuario[] = [];

  nuevoUsuario: UsuarioNuevo = this.formularioVacio();

  mostrarContrasena = false;

  // copia que se edita en la ventana, separada del formulario de registro.
  edicion: UsuarioEdicion | null = null;
  editandoId: number | null = null;

  mensajeError = '';
  mensajeEdicion = '';

  constructor(private readonly usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService
      .listar()
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: (usuarios) => (this.usuarios = usuarios),
        error: (error: Error) => {
          this.mensajeError = error.message;
        },
      });
  }

  agregarUsuario(formulario: NgForm): void {
    if (formulario.invalid) {
      formulario.form.markAllAsTouched();
      this.mensajeError = 'Revisa los campos marcados antes de guardar.';

      return;
    }

    this.usuarioService
      .crear(this.nuevoUsuario)
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: () => {
          this.mensajeError = '';
          this.nuevoUsuario = this.formularioVacio();
          formulario.resetForm(this.nuevoUsuario);
          this.cargarUsuarios();
        },
        error: (error: Error) => (this.mensajeError = error.message),
      });
  }

  abrirEdicion(usuario: Usuario): void {
    this.editandoId = usuario.id;
    this.edicion = {
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol,
    };
    this.mensajeEdicion = '';
  }

  cancelarEdicion(): void {
    this.edicion = null;
    this.editandoId = null;
    this.mensajeEdicion = '';
  }

  guardarEdicion(formulario: NgForm): void {
    if (!this.edicion || this.editandoId === null) return;

    if (formulario.invalid) {
      formulario.form.markAllAsTouched();
      this.mensajeEdicion = 'Revisa los campos marcados antes de guardar.';

      return;
    }

    this.usuarioService
      .actualizar(this.editandoId, this.edicion)
      .pipe(finalize(() => this.refrescar()))
      .subscribe({
        next: () => {
          this.cancelarEdicion();
          this.cargarUsuarios();
        },
        error: (error: Error) => (this.mensajeEdicion = error.message),
      });
  }

  cambiarEstado(usuario: Usuario): void {
    const accion =
      usuario.estado === 'Activo'
        ? this.usuarioService.eliminar(usuario.id)
        : this.usuarioService.restaurar(usuario.id);

    accion.pipe(finalize(() => this.refrescar())).subscribe({
      next: () => this.cargarUsuarios(),
      error: (error: Error) => {
        this.mensajeError = error.message;
      },
    });
  }

  private formularioVacio(): UsuarioNuevo {
    return { nombre: '', apellidos: '', correo: '', contrasena: '', telefono: '', rol: 'Usuario' };
  }
}
