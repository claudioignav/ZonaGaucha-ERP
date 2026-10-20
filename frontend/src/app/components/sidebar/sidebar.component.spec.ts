import { TestBed } from '@angular/core/testing';
import { AppModule } from '../../app-module';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../services/auth.service';

it('muestra el nombre y rol del backend y permite cerrar sesion', async () => {
  const auth = { sesion: { id: 7, nombre: 'Ana', apellidos: 'Rojas', rol: 'Usuario' }, cerrarSesion: vi.fn() };

  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [{ provide: AuthService, useValue: auth }],
  });

  const fixture = TestBed.createComponent(SidebarComponent);

  fixture.detectChanges();
  await fixture.whenStable();

  expect(fixture.nativeElement.textContent).toContain('Ana Rojas');
  expect(fixture.nativeElement.textContent).toContain('AR');
  expect(fixture.nativeElement.textContent).toContain('Usuario');

  fixture.componentInstance.alternarMenuMovil();

  expect(fixture.componentInstance.menuMovilAbierto).toBe(true);

  fixture.componentInstance.cerrarMenuMovil();

  expect(fixture.componentInstance.menuMovilAbierto).toBe(false);

  fixture.nativeElement.querySelector('[title="Cerrar sesión"]').click();

  expect(auth.cerrarSesion).toHaveBeenCalled();
});

it.each(['Usuario', 'Administrador'])('el menu de %s muestra solo sus accesos', async rol => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [{ provide: AuthService, useValue: { sesion: { rol } } }],
  });
  const fixture = TestBed.createComponent(SidebarComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  const pantalla: HTMLElement = fixture.nativeElement;
  const esAdministrador = rol === 'Administrador';
  expect(pantalla.querySelector('nav a[href="/cuentas"]') !== null).toBe(esAdministrador);
  expect(pantalla.querySelectorAll('nav a[href="/dashboard"]').length > 0).toBe(esAdministrador);
  expect(pantalla.querySelector('nav a[href="/inventario"]')).not.toBeNull();
  expect(pantalla.querySelector('nav a[href="/compras"]')).not.toBeNull();
  expect(pantalla.querySelector('nav a[href="/ventas"]')).not.toBeNull();
  expect(pantalla.querySelector('nav a[href="/catalogos/productos"]')).not.toBeNull();
});

it('alterna modulos y catalogos de forma independiente', async () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [{ provide: AuthService, useValue: { sesion: { rol: 'Usuario' } } }],
  });
  const fixture = TestBed.createComponent(SidebarComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  const pantalla: HTMLElement = fixture.nativeElement;
  const boton = (titulo: string) => Array.from(pantalla.querySelectorAll('button'))
    .find(elemento => elemento.textContent?.trim() === titulo)!;
  boton('MÓDULOS').click();
  await fixture.whenStable();
  expect(pantalla.querySelector('nav a[href="/inventario"]')).toBeNull();
  expect(pantalla.querySelector('nav a[href="/catalogos/productos"]')).not.toBeNull();
  boton('CATÁLOGOS').click();
  await fixture.whenStable();
  expect(pantalla.querySelector('nav a[href="/catalogos/productos"]')).toBeNull();
  boton('MÓDULOS').click();
  await fixture.whenStable();
  expect(pantalla.querySelector('nav a[href="/inventario"]')).not.toBeNull();
  expect(pantalla.querySelector('nav a[href="/catalogos/productos"]')).toBeNull();
});

it('cierra el menu movil al tocar el fondo sin cambiar las secciones', async () => {
  TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [{ provide: AuthService, useValue: { sesion: { rol: 'Usuario' } } }],
  });
  const fixture = TestBed.createComponent(SidebarComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  const pantalla: HTMLElement = fixture.nativeElement;
  pantalla.querySelector<HTMLButtonElement>('[aria-label="Abrir menú"]')!.click();
  await fixture.whenStable();
  expect(fixture.componentInstance.menuMovilAbierto).toBe(true);
  pantalla.querySelector<HTMLButtonElement>('[aria-label="Cerrar menú"]')!.click();
  await fixture.whenStable();
  expect(fixture.componentInstance.menuMovilAbierto).toBe(false);
  expect(fixture.componentInstance.modulosAbierto).toBe(true);
  expect(fixture.componentInstance.catalogosAbierto).toBe(true);
});
