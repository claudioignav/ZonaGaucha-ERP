declare global {
  interface Window {
    ZONAGAUCHA_CONFIG?: { apiUrl: string };
  }
}

// la url de la api viene de public/config.js para cambiarla sin recompilar
export function obtenerApiUrl(): string {
  return (window.ZONAGAUCHA_CONFIG?.apiUrl || '/api').replace(/\/$/, '');
}

export const API_URL = obtenerApiUrl();
export const RUTAS_API = {
  login: API_URL + '/auth/login',
  usuarios: API_URL + '/usuarios',
  catalogos: API_URL + '/catalogos',
  compras: API_URL + '/compras',
  ventas: API_URL + '/ventas',
  inventario: API_URL + '/inventario',
  dashboard: API_URL + '/dashboard',
} as const;
