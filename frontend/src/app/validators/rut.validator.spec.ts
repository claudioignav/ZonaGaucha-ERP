import { FormControl } from '@angular/forms';
import { calcularDigitoVerificador, normalizarRut, RutValidatorDirective, rutValidator } from './rut.validator';

describe('rutValidator', () => {
  it.each([
    ['12.345.678-5', '12345678-5'],
    ['12345678-5', '12345678-5'],
    ['123456785', '12345678-5'],
    ['6.059.032-k', '6059032-K'],
    ['76543216', '7654321-6'],
  ])('%s queda guardado como %s', (escrito, guardado) => {
    expect(normalizarRut(escrito)).toBe(guardado);
  });

  it('si no viene el dígito verificador lo calcula', () => {
    expect(normalizarRut('12.345.678')).toBe('12345678-5');
    expect(normalizarRut('7654321')).toBe('7654321-6');
  });

  it.each(['12.345.678-9', '1234', 'abc-d'])('rechaza %s', (rut) => {
    expect(normalizarRut(rut)).toBeNull();
  });

  it('el dígito puede salir 0', () => {
    expect(calcularDigitoVerificador('1000013')).toBe('0');
  });

  it('deja pasar el campo vacío y marca el error rut cuando está malo', () => {
    expect(rutValidator(new FormControl(''))).toBeNull();
    expect(new RutValidatorDirective().validate(new FormControl('11.111.111-2'))).toEqual({ rut: true });
  });
});
