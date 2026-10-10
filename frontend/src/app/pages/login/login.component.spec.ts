import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([{ path: 'dashboard', children: [] }]), FormsModule],
      declarations: [LoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  function escribir(selector: string, valor: string): void {
    const campo: HTMLInputElement = fixture.nativeElement.querySelector(selector);
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  function enviarFormulario(): void {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
  }

  const mensajeError = (): string | undefined => fixture.nativeElement.querySelector('.text-red-700')?.textContent?.trim();

  it('muestra los campos de correo y contraseña y el botón para entrar', () => {
    const pantalla: HTMLElement = fixture.nativeElement;
    expect(pantalla.querySelector('#correo')).toBeTruthy();
    expect(pantalla.querySelector('#contrasena')).toBeTruthy();
    expect(pantalla.querySelector('button[type="submit"]')?.textContent).toContain('Iniciar Sesión');
  });

  it('avisa cuando se intenta entrar con los campos vacíos', async () => {
    enviarFormulario();
    await fixture.whenStable();

    expect(mensajeError()).toBe('Ingresa tu correo y contraseña.');
  });

  it.each(['usuario.prueba', 'usuario@prueba'])('avisa cuando el correo %s no tiene @ o punto', async (correo) => {
    escribir('#correo', correo);
    escribir('#contrasena', 'clave123');

    enviarFormulario();
    await fixture.whenStable();

    expect(mensajeError()).toBe('El correo electrónico no es válido.');
  });

  it('entra al dashboard cuando los datos están bien', async () => {
    escribir('#correo', 'usuario.prueba@correo.cl');
    escribir('#contrasena', 'clave123');

    enviarFormulario();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/dashboard');
    expect(mensajeError()).toBeUndefined();
  });

  it('avisa cuando falla la navegación al dashboard', async () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockRejectedValue(new Error('Error de navegación'));
    escribir('#correo', 'usuario.prueba@correo.cl');
    escribir('#contrasena', 'clave123');

    enviarFormulario();
    await fixture.whenStable();

    expect(mensajeError()).toBe('No se pudo abrir el dashboard. Inténtalo nuevamente.');
  });

  it('muestra la contraseña con el ojito y la vuelve a ocultar', async () => {
    const campo: HTMLInputElement = fixture.nativeElement.querySelector('#contrasena');
    const ojito: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="button"]');

    ojito.click();
    await fixture.whenStable();
    expect(campo.type).toBe('text');

    ojito.click();
    await fixture.whenStable();
    expect(campo.type).toBe('password');
  });
});
