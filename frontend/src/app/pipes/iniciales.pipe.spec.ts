import { InicialesPipe } from './iniciales.pipe';

describe('InicialesPipe', () => {
  const pipe = new InicialesPipe();

  it('toma el primer nombre y el último apellido', () => {
    expect(pipe.transform('ana maría rojas')).toBe('AR');
  });

  it('con una sola palabra devuelve una letra', () => {
    expect(pipe.transform('  Admin ')).toBe('A');
    expect(pipe.transform('')).toBe('');
  });
});
