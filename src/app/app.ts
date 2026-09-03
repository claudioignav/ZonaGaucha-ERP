import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  styles: [],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('erp-frontend');
}
