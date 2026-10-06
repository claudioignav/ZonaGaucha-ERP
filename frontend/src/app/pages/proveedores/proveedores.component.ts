import { Component } from '@angular/core';
import { Proveedor, proveedoresRegistrados } from '../../models/proveedor';

@Component({
  selector: 'app-proveedores',
  standalone: false,
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss',
})
export class ProveedoresComponent {
  proveedores: Proveedor[] = proveedoresRegistrados;
}
