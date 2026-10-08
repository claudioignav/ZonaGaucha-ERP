import { NombrePropioPipe } from './nombre-propio.pipe';

describe('NombrePropioPipe', () => {
  it('crea una instancia', () => {
    const pipe = new NombrePropioPipe();
    expect(pipe).toBeTruthy();
  });
});
