import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdministrarCuentasComponent } from './administrar-cuentas.component';
import { TelefonoPipe } from '../../pipes/telefono.pipe';
import { NombrePropioPipe } from '../../pipes/nombre-propio.pipe';
import { TablaContenidoComponent } from '../../components/tabla-contenido/tabla-contenido.component';
import { CorreoValidatorDirective } from '../../validators/correo.validator';
import { NombreValidatorDirective } from '../../validators/nombre.validator';
import { ContrasenaValidatorDirective } from '../../validators/contrasena.validator';
import { TelefonoValidatorDirective } from '../../validators/telefono.validator';

describe('AdministrarCuentasComponent', () => {
  let component: AdministrarCuentasComponent;
  let fixture: ComponentFixture<AdministrarCuentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), FormsModule],
      declarations: [
        AdministrarCuentasComponent,
        TablaContenidoComponent,
        TelefonoPipe,
        NombrePropioPipe,
        CorreoValidatorDirective,
        NombreValidatorDirective,
        ContrasenaValidatorDirective,
        TelefonoValidatorDirective,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministrarCuentasComponent);
    component = fixture.componentInstance;
    component.usuarios = [
      {
        id: 1,
        nombre: 'usuario',
        apellidos: 'de prueba',
        correo: 'usuario.prueba@correo.cl',
        telefono: '911112222',
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

  async function escribir(campos: Record<string, string>): Promise<void> {
    for (const [selector, valor] of Object.entries(campos)) {
      const campo: HTMLInputElement = fixture.nativeElement.querySelector(selector);
      campo.value = valor;
      campo.dispatchEvent(new Event('input'));
      campo.dispatchEvent(new Event('blur'));
    }
    await fixture.whenStable();
  }

  async function enviar(): Promise<void> {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  const pantalla = (): string => fixture.nativeElement.textContent;
  const filas = (): number => fixture.nativeElement.querySelectorAll('tbody tr').length;

  it('muestra al usuario con mayúscula inicial y el teléfono formateado', () => {
    expect(pantalla()).toContain('Usuario');
    expect(pantalla()).toContain('De Prueba');
    expect(pantalla()).toContain('+56 9 1111 2222');
  });

  it('deja ver la contraseña nueva al tocar el ojito', async () => {
    const campo: HTMLInputElement = fixture.nativeElement.querySelector('#contrasena');

    fixture.nativeElement.querySelector('button[title="Mostrar contraseña"]').click();
    await fixture.whenStable();

    expect(campo.type).toBe('text');
  });

  it('agrega el usuario a la tabla cuando el formulario está bien', async () => {
    await escribir({ '#nombre': 'José', '#apellidos': 'Muñoz', '#correo': 'jose@correo.cl', '#contrasena': 'gaucho' });

    await enviar();

    expect(filas()).toBe(2);
    expect(pantalla()).toContain('jose@correo.cl');
  });

  it('marca y explica los campos con errores', async () => {
    await escribir({ '#nombre': 'Ana2', '#correo': 'ana@correo', '#contrasena': 'abc', '#telefono': '123' });

    expect(pantalla()).toContain('Solo se permiten letras y espacios.');
    expect(pantalla()).toContain('El correo debe tener @ y punto.');
    expect(pantalla()).toContain('La contraseña debe tener al menos 6 caracteres.');
    expect(pantalla()).toContain('El teléfono no es válido.');
    expect(fixture.nativeElement.querySelector('#nombre').classList).toContain('border-red-500');
  });

  it('no agrega nada si faltan datos', async () => {
    await enviar();

    expect(pantalla()).toContain('Revisa los campos marcados antes de guardar.');
    expect(filas()).toBe(1);
  });

  it('elimina al usuario y lo puede restaurar', async () => {
    boton('Eliminar').click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.insignia').classList).toContain('bg-red-100');

    boton('Restaurar').click();
    await fixture.whenStable();

    expect(boton('Eliminar')).toBeTruthy();
  });
});
