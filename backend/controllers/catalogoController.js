const { buscarOFallar, exigirCampos } = require('../utils/errores');

const crearControladorCatalogo = (config) => {
  const { modelo, campoId, campos, include = [] } = config;
  const requeridos = config.requeridos || campos;

  const formatear = (registro) => {
    const salida = { id: registro[campoId] };

    campos.forEach((campo) => {
      salida[campo] = registro[campo];
    });

    return config.formatear ? config.formatear(registro, salida) : salida;
  };
  const tomarDatos = (body) => {
    const datos = {};

    campos.forEach((campo) => {
      if (body[campo] !== undefined) datos[campo] = body[campo];
    });

    return config.antesDeGuardar ? config.antesDeGuardar(datos) : datos;
  };

  const guardarYResponder = async (registro, req, res, status) => {
    if (config.despuesDeGuardar) await config.despuesDeGuardar(registro, req.body);

    await registro.reload({ include });
    res.status(status).json(formatear(registro));
  };

  return {
    listar: async (req, res) => {
      const registros = await modelo.findAll({ include, order: [[campoId, 'ASC']] });

      res.json(registros.map(formatear));
    },

    crear: async (req, res) => {
      exigirCampos(req.body, requeridos);

      const registro = await modelo.create(tomarDatos(req.body));

      await guardarYResponder(registro, req, res, 201);
    },

    actualizar: async (req, res) => {
      const registro = await buscarOFallar(modelo, req.params.id);

      await registro.update(tomarDatos(req.body));
      await guardarYResponder(registro, req, res, 200);
    },
    eliminar: async (req, res) => {
      const registro = await buscarOFallar(modelo, req.params.id);

      await registro.destroy();
      res.status(204).end();
    },
  };
};

module.exports = crearControladorCatalogo;
