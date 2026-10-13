import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AppModule } from './app-module';
import { provideHttpClientTesting } from '@angular/common/http/testing';

it('mantiene el contenedor de navegacion del frontend', async () => {
  TestBed.configureTestingModule({ imports: [AppModule], providers: [provideHttpClientTesting()] });

  const fixture = TestBed.createComponent(App);

  fixture.detectChanges();
  await fixture.whenStable();

  expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
});
