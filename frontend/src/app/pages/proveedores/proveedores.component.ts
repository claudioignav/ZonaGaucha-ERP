import { Component } from '@angular/core';
import { Proveedor } from '../../models/proveedor';
import { PaginaCatalogo } from '../pagina-catalogo';
import { normalizarRut } from '../../validators/rut.validator';

@Component({
  selector: 'app-proveedores',
  standalone: false,
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss',
})
export class ProveedoresComponent extends PaginaCatalogo<'proveedores'> {
  protected readonly tipo = 'proveedores';

  protected readonly obligatorios: (keyof Omit<Proveedor, 'id'>)[] = ['razonSocial', 'rut'];

  protected registroVacio(): Omit<Proveedor, 'id'> {
    return { razonSocial: '', rut: '', telefono: '', correo: '' };
  }

  protected override normalizar(datos: Omit<Proveedor, 'id'>): Omit<Proveedor, 'id'> {
    const rut = normalizarRut(datos.rut);

    return rut ? { ...datos, rut } : datos;
  }
}
