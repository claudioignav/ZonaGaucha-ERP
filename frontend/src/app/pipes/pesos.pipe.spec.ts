import { PesosPipe } from './pesos.pipe';

describe('PesosPipe', () => {
  it('crea una instancia', () => {
    const pipe = new PesosPipe();
    expect(pipe).toBeTruthy();
  });
});
