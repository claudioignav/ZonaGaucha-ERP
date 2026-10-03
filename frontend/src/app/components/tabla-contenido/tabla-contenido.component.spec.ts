import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablaContenidoComponent } from './tabla-contenido.component';

describe('TablaContenidoComponent', () => {
  let component: TablaContenidoComponent;
  let fixture: ComponentFixture<TablaContenidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TablaContenidoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TablaContenidoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });
});
