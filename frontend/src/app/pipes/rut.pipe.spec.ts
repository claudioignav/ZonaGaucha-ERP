import { RutPipe } from './rut.pipe';

describe('RutPipe', () => {
  const pipe = new RutPipe();

  it('muestra el rut guardado con puntos y guion', () => {
    expect(pipe.transform('12345678-5')).toBe('12.345.678-5');
    expect(pipe.transform('6059032k')).toBe('6.059.032-K');
  });

  it('deja igual un rut que no sirve y vacío lo nulo', () => {
    expect(pipe.transform('abc')).toBe('abc');
    expect(pipe.transform(undefined)).toBe('');
  });
});
