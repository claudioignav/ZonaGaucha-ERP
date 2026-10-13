import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api';

@Injectable({ providedIn: 'root' })
export class EstadoService {
  private readonly http = inject(HttpClient);

  consultar() {
    return this.http.get<{ mensaje: string }>(API_URL + '/');
  }
}
