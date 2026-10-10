import { FormControl } from '@angular/forms';
import { esTelefonoValido, TelefonoValidatorDirective, telefonoValidator } from './telefono.validator';

describe('telefonoValidator', () => {
  it.each(['+56 9 1111 2222', '+56911112222', '911112222', '56 2 2123 4567'])('acepta %s', (telefono) => {
    expect(esTelefonoValido(telefono)).toBe(true);
  });

  it.each(['12345', '+54 9 1111 2222', 'sin numero'])('rechaza %s', (telefono) => {
    expect(esTelefonoValido(telefono)).toBe(false);
  });

  it('el teléfono es opcional, solo reclama si está mal escrito', () => {
    expect(telefonoValidator(new FormControl(null))).toBeNull();
    expect(new TelefonoValidatorDirective().validate(new FormControl('123'))).toEqual({ telefono: true });
  });
});
