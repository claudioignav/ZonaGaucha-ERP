class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

const buscarOFallar = async (modelo, id, opciones = {}) => {
  const registro = await modelo.findByPk(id, opciones);
  if (!registro) throw new ErrorHttp(404, 'Registro no encontrado');

  return registro;
};

const exigirCampos = (datos, campos) => {
  const faltantes = campos.filter(
    (campo) => datos[campo] === undefined || datos[campo] === null || datos[campo] === '',
  );
  if (faltantes.length > 0) {
    throw new ErrorHttp(400, `Faltan campos obligatorios: ${faltantes.join(', ')}`);
  }
};

module.exports = { ErrorHttp, buscarOFallar, exigirCampos };
