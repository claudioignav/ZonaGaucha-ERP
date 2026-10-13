import { InicialesPipe } from '../../pipes/iniciales.pipe';
import { NombrePropioPipe } from '../../pipes/nombre-propio.pipe';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [InicialesPipe, NombrePropioPipe, LayoutComponent, SidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el menú lateral y el espacio donde se cargan las páginas', () => {
    const pantalla: HTMLElement = fixture.nativeElement;
    expect(pantalla.querySelector('app-sidebar')).toBeTruthy();
    expect(pantalla.querySelector('main router-outlet')).toBeTruthy();
  });
});
