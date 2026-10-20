import { TestBed } from '@angular/core/testing';
import { AppModule } from '../../app-module';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

const claveDePrueba = crypto.getRandomValues(new Uint32Array(4)).join('-');

it('valida correo antes de enviar credenciales y navega al responder el backend', async () => {
  const auth = { iniciarSesion: vi.fn(() => of({ id: 7, nombre: 'Ana', rol: 'Usuario' })) };

  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [{ provide: AuthService, useValue: auth }],
  });

  const fixture = TestBed.createComponent(LoginComponent);
  const componente = fixture.componentInstance;
  const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

  componente.iniciarSesion();

  expect(auth.iniciarSesion).not.toHaveBeenCalled();

  componente.credenciales = { correo: 'incorrecto', contrasena: claveDePrueba };
  componente.iniciarSesion();

  expect(auth.iniciarSesion).not.toHaveBeenCalled();

  componente.credenciales = { correo: 'ana@correo.cl', contrasena: claveDePrueba };
  componente.iniciarSesion();

  expect(auth.iniciarSesion).toHaveBeenCalledWith(componente.credenciales);
  expect(navegar).toHaveBeenCalledWith(['/inventario']);

  fixture.detectChanges();
  await fixture.whenStable();

  expect(fixture.nativeElement.querySelector('input[type="password"]')).not.toBeNull();

  componente.mostrarContrasena = true;
  componente.refrescar();
  await fixture.whenStable();

  expect(fixture.nativeElement.querySelector('input[type="password"]')).toBeNull();
});

it('muestra error de credenciales sin navegar', async () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [
      {
        provide: AuthService,
        useValue: { iniciarSesion: () => throwError(() => new Error('Credenciales incorrectas')) },
      },
    ],
  });

  const fixture = TestBed.createComponent(LoginComponent);
  const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

  fixture.componentInstance.credenciales = { correo: 'ana@correo.cl', contrasena: claveDePrueba + '-incorrecta' };
  fixture.componentInstance.iniciarSesion();
  fixture.detectChanges();
  await fixture.whenStable();

  expect(fixture.nativeElement.textContent).toContain('Credenciales incorrectas');
  expect(navegar).not.toHaveBeenCalled();
});

it('el administrador entra a las metricas financieras', () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [{ provide: AuthService, useValue: { iniciarSesion: () => of({ rol: 'Administrador' }) } }],
  });
  const fixture = TestBed.createComponent(LoginComponent);
  const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  fixture.componentInstance.credenciales = { correo: 'admin@correo.cl', contrasena: claveDePrueba };
  fixture.componentInstance.iniciarSesion();
  expect(navegar).toHaveBeenCalledWith(['/dashboard']);
});

it('muestra un error si falla la navegacion despues del login', async () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [{ provide: AuthService, useValue: { iniciarSesion: () => of({ rol: 'Usuario' }) } }],
  });
  const fixture = TestBed.createComponent(LoginComponent);
  vi.spyOn(TestBed.inject(Router), 'navigate').mockRejectedValue(new Error('No se pudo navegar'));
  fixture.componentInstance.credenciales = { correo: 'ana@correo.cl', contrasena: claveDePrueba };
  fixture.componentInstance.iniciarSesion();
  await fixture.whenStable();
  expect(fixture.nativeElement.textContent).toContain('No se pudo abrir el sistema');
});
