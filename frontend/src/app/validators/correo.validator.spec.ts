import { FormControl } from '@angular/forms';
import { CorreoValidatorDirective, correoValidator, esCorreoValido } from './correo.validator';

describe('correoValidator', () => {
  it('pide que tenga @ y punto', () => {
    expect(esCorreoValido('ana@correo.cl')).toBe(true);
    expect(esCorreoValido('ana@correo')).toBe(false);
    expect(esCorreoValido('ana.correo.cl')).toBe(false);
  });

  it('el campo vacío lo deja para required', () => {
    expect(correoValidator(new FormControl(''))).toBeNull();
    expect(new CorreoValidatorDirective().validate(new FormControl('sin-arroba'))).toEqual({ correo: true });
  });
});
