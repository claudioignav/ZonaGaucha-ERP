const limpiarRut = (rut) =>
  String(rut)
    .replace(/[.\-\s]/g, '')
    .toUpperCase();

const calcularDv = (cuerpo) => {
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';

  if (resto === 10) return 'K';

  return String(resto);
};

const normalizarRut = (rut) => {
  const texto = String(rut);
  const limpio = limpiarRut(texto);
  let cuerpo = limpio;
  let dv;
  const cuadraComoSieteMasDv = limpio.length === 8 && calcularDv(limpio.slice(0, 7)) === limpio[7];
  if (texto.includes('-') || limpio.endsWith('K') || limpio.length === 9 || cuadraComoSieteMasDv) {
    cuerpo = limpio.slice(0, -1);
    dv = limpio.slice(-1);
  }

  if (!/^\d{7,8}$/.test(cuerpo)) return null;

  const dvCorrecto = calcularDv(cuerpo);
  if (dv !== undefined && dv !== dvCorrecto) return null;

  return `${cuerpo}-${dvCorrecto}`;
};

module.exports = { normalizarRut, calcularDv };
