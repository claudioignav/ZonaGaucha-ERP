const ESPERA_MAXIMA = 15000;

// pide json y falla si la respuesta no es 2xx, quien llama decide que hacer con el fallo
const pedirJson = async (url, { metodo = 'GET', token, formulario } = {}) => {
  const cabeceras = { Accept: 'application/json' };
  if (token) cabeceras.Authorization = `Bearer ${token}`;
  let body;
  if (formulario) {
    cabeceras['Content-Type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(formulario).toString();
  }

  const respuesta = await fetch(url, {
    method: metodo,
    headers: cabeceras,
    body,
    signal: AbortSignal.timeout(ESPERA_MAXIMA),
  });
  if (!respuesta.ok) throw new Error(`respuesta ${respuesta.status}`);
  return { datos: await respuesta.json(), cabeceras: respuesta.headers };
};

module.exports = { pedirJson };
