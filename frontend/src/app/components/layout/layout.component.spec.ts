import { TestBed } from '@angular/core/testing';
import { AppModule } from '../../app-module';
import { LayoutComponent } from './layout.component';

it('incluye menu y espacio para las paginas', async () => {
  TestBed.configureTestingModule({ imports: [AppModule] });

  const fixture = TestBed.createComponent(LayoutComponent);

  fixture.detectChanges();
  await fixture.whenStable();

  expect(fixture.nativeElement.querySelector('app-sidebar')).not.toBeNull();
  expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
});
