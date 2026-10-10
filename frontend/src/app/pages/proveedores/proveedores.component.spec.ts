import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ProveedoresComponent } from './proveedores.component';
import { RutPipe } from '../../pipes/rut.pipe';
import { TelefonoPipe } from '../../pipes/telefono.pipe';
import { TablaContenidoComponent } from '../../components/tabla-contenido/tabla-contenido.component';
import { BotonesAccionesComponent } from '../../components/botones-acciones/botones-acciones.component';

describe('ProveedoresComponent', () => {
  let component: ProveedoresComponent;
  let fixture: ComponentFixture<ProveedoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [ProveedoresComponent, TablaContenidoComponent, BotonesAccionesComponent, RutPipe, TelefonoPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedoresComponent);
    component = fixture.componentInstance;
    component.proveedores = [
      {
        id: 1,
        razonSocial: 'Proveedor de Prueba SpA',
        rut: '11111111-1',
        telefono: '+56911112222',
        correo: 'contacto@proveedorprueba.cl',
      },
    ];
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el proveedor con el RUT y el teléfono formateados', () => {
    const fila: HTMLElement = fixture.nativeElement.querySelector('tbody tr');

    expect(fila.textContent).toContain('Proveedor de Prueba SpA');
    expect(fila.textContent).toContain('11.111.111-1');
    expect(fila.textContent).toContain('+56 9 1111 2222');
    expect(fila.textContent).toContain('contacto@proveedorprueba.cl');
    expect(fila.querySelector('button[title="Editar"]')).toBeTruthy();
    expect(fila.querySelector('button[title="Eliminar"]')).toBeTruthy();
  });
});
