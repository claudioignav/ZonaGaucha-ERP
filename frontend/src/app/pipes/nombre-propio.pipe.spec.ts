import { NombrePropioPipe } from './nombre-propio.pipe';

describe('NombrePropioPipe', () => {
  const pipe = new NombrePropioPipe();

  it('deja la primera letra de cada palabra en mayúscula', () => {
    expect(pipe.transform('maría JOSÉ  rojas')).toBe('María José Rojas');
  });

  it('con valor vacío devuelve texto vacío', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
