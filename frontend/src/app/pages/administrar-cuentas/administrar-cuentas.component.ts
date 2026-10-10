import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Usuario, usuariosRegistrados } from '../../models/usuario';

type UsuarioNuevo = Omit<Usuario, 'id' | 'estado'> & { contrasena: string };

@Component({
  selector: 'app-administrar-cuentas',
  standalone: false,
  templateUrl: './administrar-cuentas.component.html',
  styleUrl: './administrar-cuentas.component.scss',
})
export class AdministrarCuentasComponent {
  usuarios: Usuario[] = usuariosRegistrados.map((usuario) => ({ ...usuario }));
  nuevoUsuario: UsuarioNuevo = this.formularioVacio();

  mostrarContrasena = false;
  mensajeError = '';

  // por ahora el usuario solo se suma a la tabla, falta conectarlo al back
  agregarUsuario(formulario: NgForm): void {
    if (formulario.invalid) {
      formulario.form.markAllAsTouched();
      this.mensajeError = 'Revisa los campos marcados antes de guardar.';
      return;
    }

    const { contrasena, ...datos } = this.nuevoUsuario;
    this.usuarios = [...this.usuarios, { ...datos, id: this.usuarios.length + 1, estado: 'Activo' }];
    this.mensajeError = '';
    this.nuevoUsuario = this.formularioVacio();
    formulario.resetForm(this.nuevoUsuario);
  }

  cambiarEstado(usuario: Usuario): void {
    usuario.estado = usuario.estado === 'Activo' ? 'Eliminado' : 'Activo';
  }

  private formularioVacio(): UsuarioNuevo {
    return { nombre: '', apellidos: '', correo: '', contrasena: '', telefono: '', rol: 'Usuario' };
  }
}
