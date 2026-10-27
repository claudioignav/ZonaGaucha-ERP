import { Component } from '@angular/core';
import { Producto } from '../../models/producto';
import { PaginaCatalogo } from '../pagina-catalogo';

@Component({
  selector: 'app-productos',
  standalone: false,
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss',
})
export class ProductosComponent extends PaginaCatalogo<'productos'> {
  protected readonly tipo = 'productos';

  protected readonly obligatorios: (keyof Omit<Producto, 'id'>)[] = ['nombre', 'categoria'];

  protected registroVacio(): Omit<Producto, 'id'> {
    return { nombre: '', categoria: '', precioVenta: null };
  }

  categorias: string[] = [];

  // el precio es opcional, cuando existe debe ser un monto con hasta dos decimales.
  protected override validar(datos: Omit<Producto, 'id'>): boolean {
    const precio = datos.precioVenta ?? null;
    const precioValido = precio === null || /^\d+(\.\d{1,2})?$/.test(String(precio));

    return super.validar(datos) && precioValido;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.catalogoService.listar('categorias-producto').subscribe({
      next: (registros) => {
        this.categorias = registros.map((registro) => registro.nombre);
        this.refrescar();
      },
      error: (error: Error) => {
        this.mensajeError = error.message;
        this.refrescar();
      },
    });
  }
}
