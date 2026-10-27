const { Compra, Lote, DetalleLote } = require('../models');
const compras = require('../controllers/compraController');
const { simularTransaccion, ejecutar } = require('./helpers');

const compraValida = (cambios = {}) => ({
  numeroFactura: 'F-100',
  numeroLote: 1426,
  idProveedor: 1,
  idTipoPago: 1,
  idTipoContenido: 1,
  fechaCompra: '2026-10-01',
  compraBruta: 100000,
  impuesto: 19000,
  productos: [{ idProducto: 5, cantidad: 25, precioUnitario: 4000 }],
  ...cambios,
});

describe('compras', () => {
  test('calcula el impuesto como monto o como porcentaje', () => {
    expect(compras.calcularImpuesto(100000, 19000, 'monto')).toBe(19000);
    expect(compras.calcularImpuesto(100000, 19, 'porcentaje')).toBe(19000);
    expect(compras.calcularImpuesto(100000, '')).toBe(0);
  });

  test('lista las compras con la forma del front', async () => {
    jest.spyOn(Compra, 'findAll').mockResolvedValue([
      {
        idCompra: 1,
        numeroFactura: 'F-100',
        compraBruta: '100000.00',
        impuesto: '19000.00',
        compraNeta: '119000.00',
        proveedor: { razonSocial: 'Textil SpA' },
        tipoPago: { nombre: 'Efectivo' },
        lote: {
          numeroLote: 1426,
          tipoContenido: { nombre: 'Mixto' },
          detalles: [{ producto: { nombre: 'Poncho' }, cantidadIngresada: 30 }],
        },
      },
    ]);

    const res = await ejecutar(compras.listar, { query: { desde: '2026-10-01' } });

    expect(res.json.mock.calls[0][0][0]).toMatchObject({
      numeroLote: '1426',
      proveedor: 'Textil SpA',
      compraNeta: 119000,
      productos: [{ producto: 'Poncho', cantidad: 30 }],
    });
  });

  test('el resumen suma bruto, neto e impuestos', async () => {
    jest
      .spyOn(Compra, 'sum')
      .mockResolvedValueOnce('100')
      .mockResolvedValueOnce('119')
      .mockResolvedValueOnce(null);

    const res = await ejecutar(compras.resumen);

    expect(res.json.mock.calls[0][0]).toMatchObject({
      compraBruta: 100,
      compraNeta: 119,
      impuestosTotales: 0,
    });
  });

  test('crear guarda compra, lote y detalle con todo el stock disponible', async () => {
    simularTransaccion();

    const crearCompra = jest.spyOn(Compra, 'create').mockResolvedValue({ idCompra: 9 });

    jest.spyOn(Lote, 'create').mockResolvedValue({ idLote: 3 });

    const crearDetalle = jest.spyOn(DetalleLote, 'bulkCreate').mockResolvedValue([]);

    const res = await ejecutar(compras.crear, {
      body: compraValida({ impuesto: 19, tipoImpuesto: 'porcentaje' }),
    });

    expect(crearCompra.mock.calls[0][0]).toMatchObject({
      impuesto: 19000,
      compraNeta: 119000,
      idUsuario: 1,
    });
    expect(crearDetalle.mock.calls[0][0]).toEqual([
      {
        idLote: 3,
        idProducto: 5,
        cantidadIngresada: 25,
        cantidadDisponible: 25,
        precioCompraUnitario: 4000,
      },
    ]);
    expect(res.status).toHaveBeenCalledWith(201);
  });

});
