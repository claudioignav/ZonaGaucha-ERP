import { FormControl } from '@angular/forms';
import { ContrasenaValidatorDirective, contrasenaValidator } from './contrasena.validator';

describe('contrasenaValidator', () => {
  const validar = (valor: string | null) => contrasenaValidator(new FormControl(valor));

  it('acepta desde 6 caracteres', () => {
    expect(validar('abc123')).toBeNull();
  });

  it('rechaza vacía, solo espacios o corta', () => {
    expect(validar(null)).toEqual({ contrasena: { minimo: 6 } });
    expect(validar('      ')).not.toBeNull();
    expect(new ContrasenaValidatorDirective().validate(new FormControl('abc'))).not.toBeNull();
  });
});
