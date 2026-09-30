export interface Credenciales {
  correo: string;
  contrasena: string;
}

// El formulario parte vacío cada vez que se abre el login
export const credencialesIniciales: Credenciales = {
  correo: '',
  contrasena: '',
};
