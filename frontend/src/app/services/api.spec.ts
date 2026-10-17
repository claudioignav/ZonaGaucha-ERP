import { obtenerApiUrl } from './api';

afterEach(() => {
  delete window.ZONAGAUCHA_CONFIG;
});

it('usa proxy en local', () => {
  delete window.ZONAGAUCHA_CONFIG;

  expect(obtenerApiUrl()).toBe('/api');
});

it('usa configuracion publicada y quita la barra final', () => {
  window.ZONAGAUCHA_CONFIG = { apiUrl: 'https://zgerpbackstg.azurewebsites.net/' };

  expect(obtenerApiUrl()).toBe('https://zgerpbackstg.azurewebsites.net');
});
