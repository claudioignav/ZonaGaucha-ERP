export interface Proveedor {
  id: number;
  razonSocial: string;
  rut: string;
  telefono: string;
  correo: string;
}

export const proveedoresRegistrados: Proveedor[] = [];
