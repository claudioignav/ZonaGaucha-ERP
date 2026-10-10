import { TelefonoPipe } from './telefono.pipe';

describe('TelefonoPipe', () => {
  const pipe = new TelefonoPipe();

  it('separa el número chileno en bloques', () => {
    expect(pipe.transform('+56911112222')).toBe('+56 9 1111 2222');
    expect(pipe.transform('221234567')).toBe('+56 2 2123 4567');
  });

  it('deja igual un número que no es chileno', () => {
    expect(pipe.transform('12345')).toBe('12345');
    expect(pipe.transform(null)).toBe('');
  });
});
