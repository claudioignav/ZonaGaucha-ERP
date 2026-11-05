const { Venta, DetalleVenta, DetalleLote, PlataformaTipoPago } = require('../models');
const ventas = require('../controllers/ventaController');
const { crearRegistro, simularTransaccion, ejecutar } = require('./helpers');

const ventaValida = (cambios = {}) => ({
  numeroDocumento: 'B-55',
  nombreCliente: 'Cliente de Prueba',
  fechaVenta: '2026-10-02',
  idPlataforma: 1,
  idTipoPago: 2,
  idLote: 3,
  valorBruto: 20000,
  valorAdicional: 3500,
  productos: [{ idProducto: 5, cantidad: 2, precioUnitario: 10000 }],
  ...cambios,
});

describe('ventas', () => {
  test('lista las ventas con el lote y los productos', async () => {
    jest.spyOn(Venta, 'findAll').mockResolvedValue([
      {
        idVenta: 1,
        numeroDocumento: 'B-55',
        nombreCliente: 'Cliente de Prueba',
        valorNeto: '23500.00',
        valorAdicional: '3500.00',
        plataforma: { nombre: 'Shopify' },
        tipoPago: { nombre: 'Débito' },
        detalles: [
          {
            cantidad: 2,
            precioVentaUnitario: '10000.00',
            producto: { nombre: 'Boina' },
            lote: { numeroLote: 1426 },
          },
        ],
      },
    ]);

    const res = await ejecutar(ventas.listar);

    expect(res.json.mock.calls[0][0][0]).toMatchObject({
      numeroFactura: 'B-55',
      lote: '1426',
      valorNeto: 23500,
      productos: [{ producto: 'Boina', cantidad: 2, precioUnitario: 10000, subtotal: 20000 }],
    });
  });

  test('el resumen suma neto y adicional', async () => {
    jest.spyOn(Venta, 'sum').mockResolvedValueOnce('23500.00').mockResolvedValueOnce('3500.00');

    const res = await ejecutar(ventas.resumen, { query: { hasta: '2026-10-31' } });

    expect(res.json.mock.calls[0][0]).toMatchObject({ ventaNeta: 23500, totalAdicional: 3500 });
  });

  test('crear descuenta el stock y calcula el neto', async () => {
    simularTransaccion();
    jest.spyOn(PlataformaTipoPago, 'findOne').mockResolvedValue({});

    const detalleLote = crearRegistro({ cantidadDisponible: 10 });

    jest.spyOn(DetalleLote, 'findOne').mockResolvedValue(detalleLote);

    const crearVenta = jest.spyOn(Venta, 'create').mockResolvedValue({ idVenta: 8 });

    jest.spyOn(DetalleVenta, 'bulkCreate').mockResolvedValue([]);

    const res = await ejecutar(ventas.crear, { body: ventaValida() });

    expect(detalleLote.decrement).toHaveBeenCalledWith(
      'cantidadDisponible',
      expect.objectContaining({ by: 2 }),
    );
    expect(crearVenta.mock.calls[0][0].valorNeto).toBe(23500);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('si no alcanza el stock la venta se rechaza', async () => {
    simularTransaccion();
    jest.spyOn(PlataformaTipoPago, 'findOne').mockResolvedValue({});
    jest.spyOn(DetalleLote, 'findOne').mockResolvedValue(crearRegistro({ cantidadDisponible: 1 }));

    const crearVenta = jest.spyOn(Venta, 'create');

    await expect(ejecutar(ventas.crear, { body: ventaValida() })).rejects.toMatchObject({
      status: 400,
    });

    expect(crearVenta).not.toHaveBeenCalled();
  });

  test('la plataforma tiene que aceptar el tipo de pago', async () => {
    jest.spyOn(PlataformaTipoPago, 'findOne').mockResolvedValue(null);

    await expect(ejecutar(ventas.crear, { body: ventaValida() })).rejects.toThrow('no acepta');
  });

  test('una venta sin productos es 400', async () => {
    await expect(
      ejecutar(ventas.crear, { body: ventaValida({ productos: [] }) }),
    ).rejects.toMatchObject({ status: 400 });
  });

  test('el bruto sale de cantidad por precio y se guarda el precio usado', async () => {
    simularTransaccion();
    jest.spyOn(PlataformaTipoPago, 'findOne').mockResolvedValue({});
    jest.spyOn(DetalleLote, 'findOne').mockResolvedValue(crearRegistro({ cantidadDisponible: 9 }));

    const crearVenta = jest.spyOn(Venta, 'create').mockResolvedValue({ idVenta: 8 });
    const crearDetalle = jest.spyOn(DetalleVenta, 'bulkCreate').mockResolvedValue([]);

    await ejecutar(ventas.crear, {
      body: ventaValida({
        valorBruto: undefined,
        valorAdicional: 0,
        productos: [{ idProducto: 5, cantidad: 3, precioUnitario: 1234.5 }],
      }),
    });

    expect(crearVenta.mock.calls[0][0]).toMatchObject({ valorBruto: 3703.5, valorNeto: 3703.5 });
    expect(crearDetalle.mock.calls[0][0][0].precioVentaUnitario).toBe(1234.5);
  });

  test.each([
    ['un bruto que no coincide con las lineas', { valorBruto: 15000 }, 'bruto no coincide'],
    ['un neto que no coincide', { valorNeto: 20000 }, 'neto no coincide'],
    [
      'una linea sin precio',
      { productos: [{ idProducto: 5, cantidad: 2 }] },
      'precio unitario',
    ],
    [
      'un precio con tres decimales',
      { productos: [{ idProducto: 5, cantidad: 2, precioUnitario: 10000.125 }] },
      'precio unitario',
    ],
    ['un adicional negativo', { valorAdicional: -1 }, 'adicional'],
  ])('rechaza %s', async (_caso, cambios, mensaje) => {
    simularTransaccion();
    jest.spyOn(PlataformaTipoPago, 'findOne').mockResolvedValue({});
    jest.spyOn(DetalleLote, 'findOne').mockResolvedValue(crearRegistro({ cantidadDisponible: 9 }));

    const crearVenta = jest.spyOn(Venta, 'create');

    await expect(ejecutar(ventas.crear, { body: ventaValida(cambios) })).rejects.toThrow(mensaje);
    expect(crearVenta).not.toHaveBeenCalled();
  });
});
