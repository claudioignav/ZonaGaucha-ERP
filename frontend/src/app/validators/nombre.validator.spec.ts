import { FormControl } from '@angular/forms';
import { esNombreValido, NombreValidatorDirective, nombreValidator } from './nombre.validator';

describe('nombreValidator', () => {
  it.each(['Ana', 'José Muñoz', 'María Inés Güell'])('acepta %s', (nombre) => {
    expect(esNombreValido(nombre)).toBe(true);
  });

  it.each(['Ana2', 'Luis_Soto', 'Pedro!'])('rechaza %s', (nombre) => {
    expect(esNombreValido(nombre)).toBe(false);
  });

  it('marca el error nombre y deja pasar el vacío', () => {
    expect(nombreValidator(new FormControl(''))).toBeNull();
    expect(new NombreValidatorDirective().validate(new FormControl('R2D2'))).toEqual({ nombre: true });
  });
});
