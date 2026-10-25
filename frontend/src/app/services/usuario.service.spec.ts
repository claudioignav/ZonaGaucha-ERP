import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';
import { RUTAS_API, API_URL } from './api';

let servicio: UsuarioService;
let http: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  servicio = TestBed.inject(UsuarioService);
  http = TestBed.inject(HttpTestingController);
});

afterEach(() => http.verify());

it('consulta lista y envia registro', () => {
  servicio.listar().subscribe((r) => expect(r.length).toBe(1));
  http.expectOne(RUTAS_API.usuarios).flush([{ id: 2, nombre: 'Luis' }]);

  const datos = {
    nombre: 'Luis',
    apellidos: 'Soto',
    correo: 'luis@correo.cl',
    contrasena: crypto.randomUUID(),
    telefono: '912345678',
    rol: 'Usuario' as const,
  };

  servicio.crear(datos).subscribe();

  const peticion = http.expectOne(RUTAS_API.usuarios);

  expect(peticion.request.method).toBe('POST');
  expect(peticion.request.body).toEqual(datos);

  peticion.flush({ id: 2 });
});

it('elimina y restaura en el backend', () => {
  servicio.eliminar(2).subscribe();

  const eliminar = http.expectOne(RUTAS_API.usuarios + '/2/eliminar');

  expect(eliminar.request.method).toBe('PATCH');

  eliminar.flush({ id: 2, estado: 'Eliminado' });
  servicio.restaurar(2).subscribe();
  http.expectOne(RUTAS_API.usuarios + '/2/restaurar').flush({ id: 2, estado: 'Activo' });
});

it('actualiza la cuenta con put y devuelve el usuario confirmado por el backend', () => {
  const datos = {
    nombre: 'Luis', apellidos: 'Soto', correo: 'luis@correo.cl',
    telefono: '912345678', rol: 'Usuario' as const,
  };
  const confirmado = { ...datos, id: 2, estado: 'Activo' as const };
  let recibido;
  servicio.actualizar(2, datos).subscribe((usuario) => (recibido = usuario));
  const actualizar = http.expectOne(RUTAS_API.usuarios + '/2');

  expect(actualizar.request.method).toBe('PUT');
  expect(actualizar.request.body).toEqual(datos);
  actualizar.flush(confirmado);

  expect(recibido).toEqual(confirmado);
});
