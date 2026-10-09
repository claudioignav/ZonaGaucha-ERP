import { FechaPipe } from './fecha.pipe';

describe('FechaPipe', () => {
  const pipe = new FechaPipe();

  it('la fecha actual queda como en el mockup', () => {
    expect(pipe.transform('2026-08-16T14:30')).toBe('Ago 16, 2026 14:30');
    expect(pipe.transform('2026-09-01')).toBe('Sep 1, 2026');
  });

  it('en las tablas usa día-mes-año con la hora', () => {
    expect(pipe.transform('2026-08-16T09:15:00', 'tabla')).toBe('16-08-2026 09:15');
  });

  it('deja igual lo que no está en formato estándar y vacío lo nulo', () => {
    expect(pipe.transform('16-08-2026 09:15', 'tabla')).toBe('16-08-2026 09:15');
    expect(pipe.transform(null)).toBe('');
  });
});
