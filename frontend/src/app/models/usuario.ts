export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  rol: 'Administrador' | 'Usuario';
}

export const usuariosRegistrados: Usuario[] = [];
