import { TelefonoPipe } from './telefono.pipe';

describe('TelefonoPipe', () => {
  it('crea una instancia', () => {
    const pipe = new TelefonoPipe();
    expect(pipe).toBeTruthy();
  });
});
