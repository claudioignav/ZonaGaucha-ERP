const { Lote, DetalleLote, CategoriaProducto } = require('../models');
const inventario = require('../controllers/inventarioController');
const { ejecutar } = require('./helpers');

test('lista lote con existencias proveedor y factura', async () => {
  jest.spyOn(Lote, 'findAll').mockResolvedValue([
    {
      numeroLote: 12,
      compra: {
        numeroFactura: 'F1',
        fechaCompra: '2026-10-07',
        proveedor: { razonSocial: 'Proveedor' },
      },
      tipoContenido: { nombre: 'Ropa' },
      detalles: [{ cantidadIngresada: 10, cantidadDisponible: 4 }],
    },
  ]);

  expect((await ejecutar(inventario.listarLotes)).json.mock.calls[0][0][0]).toMatchObject({
    numero: 12,
    unidadesTotales: 10,
    unidadesDisponibles: 4,
  });
});

test('incluye los productos del lote con sus unidades y conserva los totales', async () => {
  const buscar = jest.spyOn(Lote, 'findAll').mockResolvedValue([
    {
      numeroLote: 15,
      compra: { numeroFactura: 'F2', fechaCompra: '2026-10-08', proveedor: { razonSocial: 'Proveedor' } },
      tipoContenido: { nombre: 'Mixto' },
      detalles: [
        {
          idProducto: 3,
          cantidadIngresada: '10',
          cantidadDisponible: '4',
          precioCompraUnitario: '1500.10',
          producto: { idProducto: 3, nombre: 'Poncho', categoria: { nombre: 'Ropa' } },
        },
        {
          idProducto: 7,
          cantidadIngresada: 5,
          cantidadDisponible: 5,
          precioCompraUnitario: '0.00',
          producto: { idProducto: 7, nombre: 'Boina', categoria: { nombre: 'Accesorios' } },
        },
      ],
    },
  ]);

  const lote = (await ejecutar(inventario.listarLotes)).json.mock.calls[0][0][0];

  expect(lote).toEqual({
    numero: 15,
    proveedor: 'Proveedor',
    tipoContenido: 'Mixto',
    facturaAsociada: 'F2',
    unidadesDisponibles: 9,
    unidadesTotales: 15,
    fechaCreacion: '2026-10-08',
    productos: [
      {
        id: 3,
        nombre: 'Poncho',
        categoria: 'Ropa',
        unidadesDisponibles: 4,
        unidadesIngresadas: 10,
        precioTotal: 15001,
      },
      {
        id: 7,
        nombre: 'Boina',
        categoria: 'Accesorios',
        unidadesDisponibles: 5,
        unidadesIngresadas: 5,
        precioTotal: 0,
      },
    ],
  });

  const detalles = buscar.mock.calls[0][0].include.find((incluido) => incluido.as === 'detalles');

  expect(detalles.include).toEqual([expect.objectContaining({ as: 'producto' })]);
  expect(detalles.include[0].include).toEqual([
    expect.objectContaining({ model: CategoriaProducto, as: 'categoria' }),
  ]);
});

test('el precio total usa centavos para evitar errores de punto flotante', async () => {
  jest.spyOn(Lote, 'findAll').mockResolvedValue([
    {
      numeroLote: 18,
      compra: {},
      detalles: [{ idProducto: 2, cantidadIngresada: 3, cantidadDisponible: 3, precioCompraUnitario: 0.1 }],
    },
  ]);

  expect((await ejecutar(inventario.listarLotes)).json.mock.calls[0][0][0].productos[0].precioTotal).toBe(0.3);
});

test('sin categoria ni precio historico entrega null', async () => {
  jest.spyOn(Lote, 'findAll').mockResolvedValue([
    {
      numeroLote: 19,
      compra: {},
      detalles: [
        {
          idProducto: 4,
          cantidadIngresada: 2,
          cantidadDisponible: 2,
          precioCompraUnitario: null,
          producto: { idProducto: 4, nombre: 'Faja', categoria: null },
        },
      ],
    },
  ]);

  expect((await ejecutar(inventario.listarLotes)).json.mock.calls[0][0][0].productos[0]).toMatchObject({
    categoria: null,
    precioTotal: null,
  });
});

test('un lote sin detalles entrega productos vacios', async () => {
  jest.spyOn(Lote, 'findAll').mockResolvedValue([{ numeroLote: 16, compra: {} }]);

  expect((await ejecutar(inventario.listarLotes)).json.mock.calls[0][0][0]).toMatchObject({
    productos: [],
    unidadesDisponibles: 0,
    unidadesTotales: 0,
  });
});

test('usa el id del detalle si el producto no viene incluido', async () => {
  jest.spyOn(Lote, 'findAll').mockResolvedValue([
    { numeroLote: 17, compra: {}, detalles: [{ idProducto: 9, cantidadIngresada: 2, cantidadDisponible: 1 }] },
  ]);

  expect((await ejecutar(inventario.listarLotes)).json.mock.calls[0][0][0].productos).toEqual([
    {
      id: 9,
      nombre: undefined,
      categoria: null,
      unidadesDisponibles: 1,
      unidadesIngresadas: 2,
      precioTotal: null,
    },
  ]);
});

test('calcula porcentaje vendido y maneja inventario vacio', async () => {
  const sumar = jest.spyOn(DetalleLote, 'sum').mockResolvedValueOnce(10).mockResolvedValueOnce(4);

  expect((await ejecutar(inventario.resumen)).json.mock.calls[0][0].promedioVenta).toBe(60);

  sumar.mockResolvedValue(0);

  expect((await ejecutar(inventario.resumen)).json.mock.calls[0][0].promedioVenta).toBe(0);
});

test('entrega solo la fecha aunque sql devuelva un objeto Date', async () => {
  jest
    .spyOn(Lote, 'findAll')
    .mockResolvedValue([
      { numeroLote: 12, compra: { fechaCompra: new Date('2026-10-07T12:00:00Z') }, detalles: [] },
    ]);

  expect((await ejecutar(inventario.listarLotes)).json.mock.calls[0][0][0].fechaCreacion).toBe(
    '2026-10-07',
  );
});
