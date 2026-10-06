import { Component } from '@angular/core';
import { Plataforma, plataformasRegistradas } from '../../models/plataforma';

@Component({
  selector: 'app-plataformas',
  standalone: false,
  templateUrl: './plataformas.component.html',
  styleUrl: './plataformas.component.scss',
})
export class PlataformasComponent {
  plataformas: Plataforma[] = plataformasRegistradas;
}
