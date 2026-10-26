// los importes se operan en centavos enteros para evitar errores de punto flotante.
const aCentavos = (valor) => Math.round(Number(valor) * 100);

const deCentavos = (centavos) => Math.round(centavos) / 100;

const subtotalCentavos = (cantidad, precioUnitario) => aCentavos(precioUnitario) * Number(cantidad);

const sumarCentavos = (valores) => valores.reduce((suma, valor) => suma + valor, 0);

// acepta números o texto con hasta dos decimales y sin negativos.
const esImporteValido = (valor) =>
  (typeof valor === 'number' || typeof valor === 'string') &&
  /^\d+(\.\d{1,2})?$/.test(String(valor).trim());

module.exports = {
  aCentavos,
  deCentavos,
  subtotalCentavos,
  sumarCentavos,
  esImporteValido,
};
