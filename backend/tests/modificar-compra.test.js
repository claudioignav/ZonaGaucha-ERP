const { Compra } = require('../models');
const compras = require('../controllers/compraController');
const { crearRegistro, ejecutar } = require('./helpers');

const cambiosValidos = (cambios = {}) => ({
  numeroFactura: 'F-200',
  idProveedor: 2,
  idTipoPago: 3,
  fechaCompra: '2026-10-05',
  impuesto: 20000,
  tipoImpuesto: 'monto',
  ...cambios,
});

const compraGuardada = () =>
  crearRegistro({
    idCompra: 7,
    numeroFactura: 'F-100',
    compraBruta: '100000.00',
    impuesto: '19000.00',
    compraNeta: '119000.00',
  });

const modificar = (cambios) =>
  ejecutar(compras.modificar, { params: { id: '7' }, body: cambiosValidos(cambios) });

describe('modificar compra', () => {
  test('guarda los datos de la factura y recalcula el neto con el impuesto nuevo', async () => {
    const compra = compraGuardada();
    jest.spyOn(Compra, 'findByPk').mockResolvedValue(compra);

    const res = await modificar();

    expect(compra.update).toHaveBeenCalledWith({
      numeroFactura: 'F-200',
      idProveedor: 2,
      idTipoPago: 3,
      fechaCompra: '2026-10-05',
      impuesto: 20000,
      compraNeta: 120000,
    });
    expect(res.json).toHaveBeenCalledWith({
      id: 7,
      compraBruta: 100000,
      impuesto: 20000,
      compraNeta: 120000,
    });
  });

  test('el impuesto en porcentaje se calcula sobre la compra bruta', async () => {
    const compra = compraGuardada();
    jest.spyOn(Compra, 'findByPk').mockResolvedValue(compra);

    await modificar({ impuesto: 10, tipoImpuesto: 'porcentaje' });

    expect(compra.update).toHaveBeenCalledWith(
      expect.objectContaining({ impuesto: 10000, compraNeta: 110000 }),
    );
  });

  test('sin impuesto el neto queda igual a la compra bruta', async () => {
    const compra = compraGuardada();
    jest.spyOn(Compra, 'findByPk').mockResolvedValue(compra);

    await modificar({ impuesto: undefined, tipoImpuesto: undefined });

    expect(compra.update).toHaveBeenCalledWith(
      expect.objectContaining({ impuesto: 0, compraNeta: 100000 }),
    );
  });

  test('quita los espacios del numero de factura y toma solo el dia de la fecha', async () => {
    const compra = compraGuardada();
    jest.spyOn(Compra, 'findByPk').mockResolvedValue(compra);

    await modificar({ numeroFactura: '  F-300 ', fechaCompra: '2026-10-05T12:00' });

    expect(compra.update).toHaveBeenCalledWith(
      expect.objectContaining({ numeroFactura: 'F-300', fechaCompra: '2026-10-05' }),
    );
  });

  test.each([
    [{ numeroFactura: '   ' }, 'numero de factura'],
    [{ numeroFactura: 'F'.repeat(21) }, 'numero de factura'],
    [{ fechaCompra: '05-10-2026' }, 'fecha de compra no es valida'],
    [{ fechaCompra: '2026-13-45' }, 'fecha de compra no es valida'],
    [{ fechaCompra: '2999-01-01' }, 'posterior a hoy'],
    [{ tipoImpuesto: 'otro' }, 'tipo de impuesto'],
    [{ impuesto: 'abc' }, 'impuesto no es valido'],
    [{ impuesto: -5 }, 'impuesto no es valido'],
  ])('rechaza %o', async (cambios, mensaje) => {
    const buscar = jest.spyOn(Compra, 'findByPk');

    await expect(modificar(cambios)).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining(mensaje),
    });
    expect(buscar).not.toHaveBeenCalled();
  });

  test('exige los campos de la factura', async () => {
    await expect(modificar({ idProveedor: undefined })).rejects.toMatchObject({ status: 400 });
  });

  test('una compra que no existe responde 404', async () => {
    jest.spyOn(Compra, 'findByPk').mockResolvedValue(null);

    await expect(modificar()).rejects.toMatchObject({ status: 404 });
  });
});
