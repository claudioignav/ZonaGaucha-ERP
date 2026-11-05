const modelos = require('../models');
const inventario = require('../controllers/inventarioController');
const dashboard = require('../controllers/dashboardController');
const { ejecutar } = require('./helpers');

describe('inventario', () => {
  test('cada lote suma sus unidades y toma los datos de la compra', async () => {
    jest.spyOn(modelos.Lote, 'findAll').mockResolvedValue([
      {
        numeroLote: 1426,
        tipoContenido: { nombre: 'Mixto' },
        compra: {
          numeroFactura: 'F-100',
          fechaCompra: '2026-10-01',
          proveedor: { razonSocial: 'Textil SpA' },
        },
        detalles: [
          { cantidadIngresada: 60, cantidadDisponible: 20 },
          { cantidadIngresada: 40, cantidadDisponible: 25 },
        ],
      },
    ]);

    const res = await ejecutar(inventario.listarLotes);

    expect(res.json.mock.calls[0][0][0]).toMatchObject({
      numero: 1426,
      proveedor: 'Textil SpA',
      facturaAsociada: 'F-100',
      unidadesDisponibles: 45,
      unidadesTotales: 100,
    });
  });

  test('el resumen da el porcentaje vendido de lo que entro', async () => {
    jest.spyOn(modelos.DetalleLote, 'sum').mockResolvedValueOnce('100').mockResolvedValueOnce('45');

    const res = await ejecutar(inventario.resumen);

    expect(res.json.mock.calls[0][0]).toMatchObject({
      promedioVenta: 55,
      productosDisponibles: 45,
    });
  });

  test('sin lotes el resumen queda en cero', async () => {
    jest.spyOn(modelos.DetalleLote, 'sum').mockResolvedValue(null);

    const res = await ejecutar(inventario.resumen);

    expect(res.json.mock.calls[0][0]).toMatchObject({ promedioVenta: 0, productosDisponibles: 0 });
  });
});

describe('dashboard', () => {
  const prepararConteos = () => {
    ['Producto', 'Usuario', 'Proveedor', 'CategoriaProducto'].forEach((nombre) =>
      jest.spyOn(modelos[nombre], 'count').mockResolvedValue(3),
    );
  };

  test('calcula utilidades y rellena los meses sin ventas', async () => {
    prepararConteos();
    jest.spyOn(modelos.Venta, 'sum').mockResolvedValue('500000');
    jest.spyOn(modelos.Compra, 'sum').mockResolvedValue('320000');
    jest
      .spyOn(modelos.Venta, 'findAll')
      .mockResolvedValueOnce([{ mes: 3, cantidad: '4' }])
      .mockResolvedValueOnce([
        { cantidad: '3', 'plataforma.nombre': 'Shopify' },
        { cantidad: '1', 'plataforma.nombre': 'Presencial' },
      ])
      .mockResolvedValueOnce([{ mes: 3, monto: '500000' }]);
    jest.spyOn(modelos.Compra, 'findAll').mockResolvedValueOnce([{ mes: 3, monto: '320000' }]);

    const res = await ejecutar(dashboard.resumen);
    const datos = res.json.mock.calls[0][0];

    expect(datos.utilidades).toBe(180000);
    expect(datos.ventasPorMes).toHaveLength(12);
    expect(datos.ventasPorMes[2]).toEqual({ mes: 'Mar', cantidad: 4 });
    expect(datos.ventasPorPlataforma).toEqual([
      { plataforma: 'Shopify', porcentaje: 75 },
      { plataforma: 'Presencial', porcentaje: 25 },
    ]);
    expect(datos.tendencias.totalVendido).toHaveLength(12);
    expect(datos.tendencias.totalComprado[2]).toBe(320000);
    expect(datos.tendencias.utilidades[2]).toBe(180000);
    expect(datos.productosNuevosMes).toBe(3);
    expect(modelos.Venta.findAll.mock.calls[1][0].where).toHaveProperty('fechaVenta');
  });

  test('la variación compara el mes actual con el anterior', () => {
    expect(dashboard.calcularVariacion([0, 100, 150], 2)).toBe(50);
    expect(dashboard.calcularVariacion([0, 100, 150], 1)).toBeNull();
    expect(dashboard.calcularVariacion([-5, 10], 1)).toBeNull();
    expect(dashboard.calcularVariacion([10, 20], 0)).toBeNull();
  });

  test('la serie mensual rellena los meses sin movimientos', () => {
    const serie = dashboard.armarSerieMensual([{ mes: 2, monto: '10.25' }], 'monto');

    expect(serie).toHaveLength(12);
    expect(serie.slice(0, 3)).toEqual([0, 10.25, 0]);
  });

  test('sin ventas no hay porcentajes por plataforma', async () => {
    prepararConteos();
    jest.spyOn(modelos.Venta, 'sum').mockResolvedValue(null);
    jest.spyOn(modelos.Compra, 'sum').mockResolvedValue(null);
    jest.spyOn(modelos.Venta, 'findAll').mockResolvedValue([]);
    jest.spyOn(modelos.Compra, 'findAll').mockResolvedValue([]);

    const res = await ejecutar(dashboard.resumen);

    expect(res.json.mock.calls[0][0]).toMatchObject({
      totalVendido: 0,
      tendencias: { totalVendido: expect.any(Array), utilidades: expect.any(Array) },
      ventasPorPlataforma: [],
      cuentas: 3,
    });
  });
});
