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
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });
});
