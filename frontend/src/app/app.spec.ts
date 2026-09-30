import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AppModule } from './app-module';

describe('Aplicación principal', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
    }).compileComponents();
  });

  it('debería crear la aplicación', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería mostrar la estructura principal', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const contenido = fixture.nativeElement as HTMLElement;

    expect(contenido.querySelector('app-sidebar')).toBeTruthy();
    expect(contenido.querySelector('router-outlet')).toBeTruthy();
  });
});