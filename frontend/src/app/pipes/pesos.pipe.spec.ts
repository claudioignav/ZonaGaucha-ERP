import { PesosPipe } from './pesos.pipe';

describe('PesosPipe', () => {
  const pipe = new PesosPipe();

  it('formatea con signo peso y punto de miles, sin decimales', () => {
    expect(pipe.transform(150000)).toBe('$150.000');
    expect(pipe.transform('119000.00')).toBe('$119.000');
  });

  it('muestra $0 cuando no hay monto', () => {
    expect(pipe.transform(null)).toBe('$0');
    expect(pipe.transform('abc')).toBe('$0');
  });
});
