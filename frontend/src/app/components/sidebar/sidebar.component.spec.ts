import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [SidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  function boton(texto: string): HTMLButtonElement {
    const botones: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    return botones.find((b) => b.textContent?.trim() === texto) as HTMLButtonElement;
  }

  const menu = (): HTMLElement => fixture.nativeElement.querySelector('aside');

  it('muestra los enlaces del menú apuntando a su página', () => {
    const enlaces: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('nav a'));

    const rutas = enlaces.map((enlace) => enlace.getAttribute('href'));
    expect(rutas).toContain('/dashboard');
    expect(rutas).toContain('/ventas');
    expect(rutas).toContain('/catalogos/productos');
  });

  it('muestra el usuario conectado al final del menú', () => {
    expect(fixture.nativeElement.textContent).toContain('Usuario Prueba');
  });

  it('esconde y vuelve a mostrar los módulos al tocar su título', async () => {
    boton('MÓDULOS').click();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).not.toContain('Inventario');

    boton('MÓDULOS').click();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Inventario');
  });

  it('esconde los catálogos al tocar su título', async () => {
    boton('CATÁLOGOS').click();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).not.toContain('Proveedores');
  });

  it('abre el menú en el celular y lo cierra al tocar el fondo oscuro', async () => {
    const hamburguesa: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-label="Abrir menú"]');
    expect(menu().classList).toContain('-translate-x-full');

    hamburguesa.click();
    await fixture.whenStable();

    expect(menu().classList).not.toContain('-translate-x-full');

    fixture.nativeElement.querySelector('div.fixed.inset-0').click();
    await fixture.whenStable();

    expect(menu().classList).toContain('-translate-x-full');
  });
});
