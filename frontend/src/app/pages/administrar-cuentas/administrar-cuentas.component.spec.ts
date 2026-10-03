import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AdministrarCuentasComponent } from './administrar-cuentas.component';
import { TablaContenidoComponent } from '../../components/tabla-contenido/tabla-contenido.component';

describe('AdministrarCuentasComponent', () => {
  let component: AdministrarCuentasComponent;
  let fixture: ComponentFixture<AdministrarCuentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [AdministrarCuentasComponent, TablaContenidoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministrarCuentasComponent);
    component = fixture.componentInstance;
    component.usuarios = [
      {
        id: 1,
        nombre: 'Usuario',
        apellidos: 'De Prueba',
        correo: 'usuario.prueba@correo.cl',
        rol: 'Usuario',
        estado: 'Activo',
      },
    ];
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  function boton(texto: string): HTMLButtonElement {
    const botones: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    return botones.find((b) => b.textContent?.trim() === texto) as HTMLButtonElement;
  }

  const pantalla = (): string => fixture.nativeElement.textContent;

  it('muestra el formulario de registro y al usuario en la tabla', () => {
    expect(pantalla()).toContain('Registrar Nuevo Usuario');
    expect(pantalla()).toContain('usuario.prueba@correo.cl');
    expect(pantalla()).toContain('Activo');
  });

  it('deja ver la contraseña nueva al tocar el ojito', async () => {
    const campo: HTMLInputElement = fixture.nativeElement.querySelector('#contrasena');

    fixture.nativeElement.querySelector('button[title="Mostrar contraseña"]').click();
    await fixture.whenStable();

    expect(campo.type).toBe('text');
  });
});
