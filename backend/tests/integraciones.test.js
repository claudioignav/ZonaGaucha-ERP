const {
  Venta,
  DetalleVenta,
  DetalleLote,
  Plataforma,
  TipoPago,
  PlataformaTipoPago,
  Producto,
  Integracion,
} = require('../models');
const shopify = require('../utils/integraciones/shopify');
const mercadoLibre = require('../utils/integraciones/mercadoLibre');
const { sincronizarVentas, guardarVenta, elegirLote, clave } = require('../utils/integraciones/sincronizarVentas');
const ventas = require('../controllers/ventaController');
const { crearRegistro, simularTransaccion, ejecutar } = require('./helpers');

const env = {
  SHOPIFY_TIENDA: 'https://tienda-prueba.myshopify.com/',
  SHOPIFY_CLIENT_ID: 'id-shopify',
  SHOPIFY_CLIENT_SECRET: 'clave-shopify',
  MERCADOLIBRE_CLIENT_ID: 'id-ml',
  MERCADOLIBRE_CLIENT_SECRET: 'clave-ml',
  MERCADOLIBRE_SELLER_REFRESH: 'refresco-inicial',
};

const respuesta = (datos, { ok = true, enlace = null } = {}) => ({
  ok,
  status: ok ? 200 : 500,
  json: async () => datos,
  headers: { get: () => enlace },
});

const pedidoShopify = {
  id: 501,
  order_number: 1001,
  created_at: '2026-11-19T10:00:00-03:00',
  customer: { first_name: 'Ana', last_name: 'Rojas' },
  payment_gateway_names: ['manual'],
  line_items: [{ title: 'Mate Imperial', quantity: 2, price: '40000.00' }],
  shipping_lines: [{ price: '3990.00' }],
};

const pagoMercadoLibre = {
  date_approved: '2026-11-19T10:26:13.000-04:00',
  payment_type_id: 'credit_card',
  order: { type: 'mercadolibre', id: '2000019658541216' },
  additional_info: { items: [{ title: 'Bombillon Pico Loro', quantity: '1', unit_price: '25000' }] },
  shipping_amount: 0,
};

let consola;

beforeEach(() => {
  consola = ['log', 'warn', 'error', 'info'].map((m) => jest.spyOn(console, m));
  jest.spyOn(Integracion, 'findByPk').mockResolvedValue(null);
  jest.spyOn(Integracion, 'upsert').mockResolvedValue([{}, true]);
});

// ningun caso debe escribir en la consola
afterEach(() => {
  for (const espia of consola) expect(espia).not.toHaveBeenCalled();
});

describe('transformacion de pedidos', () => {
  test('shopify llena todas las columnas de la venta', () => {
    expect(shopify.aVenta(pedidoShopify)).toEqual({
      idExterno: '501',
      numeroDocumento: '1001',
      nombreCliente: 'Ana Rojas',
      fechaVenta: '2026-11-19T10:00:00-03:00',
      tipoPago: 'Transferencia',
      productos: [{ nombre: 'Mate Imperial', cantidad: 2, precioUnitario: 40000 }],
      valorAdicional: 3990,
    });
  });

  test('shopify usa valores por defecto cuando faltan datos', () => {
    const venta = shopify.aVenta({ id: 7, created_at: 'f' });
    expect(venta).toMatchObject({
      numeroDocumento: '7',
      nombreCliente: 'Cliente Shopify',
      tipoPago: 'Tarjeta de Crédito',
      productos: [],
      valorAdicional: 0,
    });
  });

  test('mercado libre usa la orden como documento y un cliente generico', () => {
    expect(mercadoLibre.aVenta(pagoMercadoLibre)).toEqual({
      idExterno: '2000019658541216',
      numeroDocumento: '2000019658541216',
      nombreCliente: 'Cliente Mercado Libre',
      fechaVenta: '2026-11-19T10:26:13.000-04:00',
      tipoPago: 'Tarjeta de Crédito',
      productos: [{ nombre: 'Bombillon Pico Loro', cantidad: 1, precioUnitario: 25000 }],
      valorAdicional: 0,
    });
  });

  test('mercado libre tolera pagos sin items ni tipo conocido', () => {
    const venta = mercadoLibre.aVenta({ order: { id: 9 }, date_created: 'f', payment_type_id: 'otro' });
    expect(venta).toMatchObject({ productos: [], tipoPago: 'Tarjeta de Crédito', fechaVenta: 'f' });
  });
});

describe('consultas a las apis', () => {
  test('shopify pide token, recorre paginas y omite pedidos cancelados', async () => {
    const pedir = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(respuesta({ access_token: 'tk' }))
      .mockResolvedValueOnce(respuesta({ orders: [pedidoShopify] }, { enlace: '<https://s/siguiente>; rel="next"' }))
      .mockResolvedValueOnce(respuesta({ orders: [{ ...pedidoShopify, id: 2, cancelled_at: 'x' }] }));

    const pedidos = await shopify.traerPedidos(env, new Date('2026-11-01T00:00:00Z'));

    expect(pedidos.map((p) => p.idExterno)).toEqual(['501']);
    expect(pedir.mock.calls[0][0]).toBe('https://tienda-prueba.myshopify.com/admin/oauth/access_token');
    expect(pedir.mock.calls[1][0]).toContain('created_at_min=2026-11-01');
    expect(pedir.mock.calls[1][1].headers.Authorization).toBe('Bearer tk');
    expect(pedir.mock.calls[2][0]).toBe('https://s/siguiente');
  });

  test('mercado libre renueva el token, guarda el refresh nuevo y filtra pagos de mercado libre', async () => {
    jest.spyOn(Integracion, 'findByPk').mockResolvedValue({ refreshToken: 'refresco-guardado' });
    const pedir = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(respuesta({ access_token: 'tk', refresh_token: 'refresco-nuevo' }))
      .mockResolvedValueOnce(respuesta({ results: [pagoMercadoLibre, { order: {} }] }));

    const pedidos = await mercadoLibre.traerPedidos(env, new Date('2026-11-01T00:00:00Z'));

    expect(pedidos).toHaveLength(1);
    expect(pedir.mock.calls[0][1].body).toContain('refresh_token=refresco-guardado');
    expect(Integracion.upsert).toHaveBeenCalledWith({ plataforma: 'Mercado Libre', refreshToken: 'refresco-nuevo' });
    expect(pedir.mock.calls[1][0]).toContain('api.mercadopago.com/v1/payments/search');
  });

  test('una respuesta con error se rechaza para que la sincronizacion la omita', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(respuesta({}, { ok: false }));
    await expect(shopify.traerPedidos(env, new Date())).rejects.toThrow('500');
  });
});

test('compara nombres de catalogo sin tildes, mayusculas ni la palabra de', () => {
  expect(clave(' Tarjeta de Crédito ')).toBe(clave('TARJETA CREDITO'));
  expect(clave('Mercado Libre')).toBe(clave('mercado  libre'));
  expect(clave('Tarjeta de Débito')).not.toBe(clave('Tarjeta de Crédito'));
});

describe('guardar una venta importada', () => {
  const venta = shopify.aVenta(pedidoShopify);

  const prepararCatalogo = ({ existe = null, tipo = { idTipoPago: 3 }, acepta = {}, productos } = {}) => {
    jest.spyOn(Venta, 'findOne').mockResolvedValue(existe);
    jest.spyOn(TipoPago, 'findAll').mockResolvedValue(tipo ? [{ nombre: 'TRANSFERENCIA', ...tipo }] : []);
    jest.spyOn(PlataformaTipoPago, 'findOne').mockResolvedValue(acepta);
    jest
      .spyOn(Producto, 'findAll')
      .mockResolvedValue(productos ?? [{ idProducto: 5, nombre: ' mate imperial ' }]);
  };

  test('crea la venta en el lote mas antiguo con stock y descuenta las unidades', async () => {
    prepararCatalogo();
    jest.spyOn(DetalleLote, 'findAll').mockResolvedValue([
      { idLote: 1, idProducto: 5, cantidadDisponible: 1 },
      { idLote: 2, idProducto: 5, cantidadDisponible: 10 },
    ]);
    const detalle = crearRegistro({ cantidadDisponible: 10 });
    jest.spyOn(DetalleLote, 'findOne').mockResolvedValue(detalle);
    simularTransaccion();
    const crear = jest.spyOn(Venta, 'create').mockResolvedValue({ idVenta: 40 });
    const lineas = jest.spyOn(DetalleVenta, 'bulkCreate').mockResolvedValue([]);

    await guardarVenta(venta, 4, 1);

    expect(detalle.decrement).toHaveBeenCalledWith('cantidadDisponible', expect.objectContaining({ by: 2 }));
    expect(crear.mock.calls[0][0]).toMatchObject({
      idExterno: '501',
      idPlataforma: 4,
      idTipoPago: 3,
      idUsuario: 1,
      valorBruto: 80000,
      valorAdicional: 3990,
      valorNeto: 83990,
    });
    expect(lineas.mock.calls[0][0]).toEqual([
      { idVenta: 40, idLote: 2, idProducto: 5, cantidad: 2, precioVentaUnitario: 40000 },
    ]);
  });

  test.each([
    ['ya importada', { existe: { idVenta: 1 } }],
    ['tipo de pago desconocido', { tipo: null }],
    ['plataforma sin ese tipo de pago', { acepta: null }],
    ['producto que no existe en el erp', { productos: [] }],
  ])('omite la venta cuando esta %s', async (_caso, opciones) => {
    prepararCatalogo(opciones);
    const crear = jest.spyOn(Venta, 'create');

    await guardarVenta(venta, 4, 1);

    expect(crear).not.toHaveBeenCalled();
  });

  test('omite la venta sin lineas validas o sin lote con stock', async () => {
    prepararCatalogo();
    jest.spyOn(DetalleLote, 'findAll').mockResolvedValue([]);
    const crear = jest.spyOn(Venta, 'create');

    await guardarVenta({ ...venta, productos: [] }, 4, 1);
    await guardarVenta(venta, 4, 1);

    expect(crear).not.toHaveBeenCalled();
  });

  test('si el stock cambia durante la transaccion la venta no se crea', async () => {
    prepararCatalogo();
    jest.spyOn(DetalleLote, 'findAll').mockResolvedValue([{ idLote: 2, idProducto: 5, cantidadDisponible: 10 }]);
    jest.spyOn(DetalleLote, 'findOne').mockResolvedValue(crearRegistro({ cantidadDisponible: 0 }));
    simularTransaccion();
    const crear = jest.spyOn(Venta, 'create');

    await expect(guardarVenta(venta, 4, 1)).rejects.toThrow();
    expect(crear).not.toHaveBeenCalled();
  });

  test('elige null cuando ningun lote cubre todas las lineas', async () => {
    jest.spyOn(DetalleLote, 'findAll').mockResolvedValue([{ idLote: 1, idProducto: 5, cantidadDisponible: 1 }]);
    expect(await elegirLote([{ idProducto: 5, cantidad: 3 }, { idProducto: 6, cantidad: 1 }])).toBeNull();
  });
});

describe('sincronizacion completa', () => {
  test('consulta ambas plataformas y guarda la fecha de la sincronizacion', async () => {
    jest.spyOn(Plataforma, 'findAll').mockResolvedValue([{ nombre: 'shopify', idPlataforma: 7 }, { nombre: 'Mercado libre', idPlataforma: 13 }]);
    jest.spyOn(Integracion, 'findByPk').mockResolvedValue({ ultimaSincronizacion: '2026-11-18T00:00:00Z' });
    const traerShopify = jest.spyOn(shopify, 'traerPedidos').mockResolvedValue([]);
    const traerMl = jest.spyOn(mercadoLibre, 'traerPedidos').mockResolvedValue([]);

    await sincronizarVentas(env, 1);

    expect(traerShopify.mock.calls[0][1]).toEqual(new Date('2026-11-18T00:00:00Z'));
    expect(traerMl).toHaveBeenCalled();
    expect(Integracion.upsert).toHaveBeenCalledWith(expect.objectContaining({ plataforma: 'Shopify' }));
  });

  test('si una api falla no lanza error, no escribe en consola y sigue con la otra', async () => {
    jest.spyOn(Plataforma, 'findAll').mockResolvedValue([{ nombre: 'Shopify', idPlataforma: 4 }, { nombre: 'Mercado Libre', idPlataforma: 5 }]);
    jest.spyOn(shopify, 'traerPedidos').mockRejectedValue(new Error('caida'));
    const traerMl = jest.spyOn(mercadoLibre, 'traerPedidos').mockResolvedValue([mercadoLibre.aVenta(pagoMercadoLibre)]);
    jest.spyOn(Venta, 'findOne').mockRejectedValue(new Error('base no disponible'));

    await expect(sincronizarVentas(env, 1)).resolves.toBeUndefined();
    expect(traerMl).toHaveBeenCalled();
  });

  test('omite plataformas sin credenciales o que no existen en el catalogo', async () => {
    const buscar = jest.spyOn(Plataforma, 'findAll').mockResolvedValue([]);
    const traer = jest.spyOn(shopify, 'traerPedidos');

    await sincronizarVentas({}, 1);
    await sincronizarVentas(env, 1);

    expect(traer).not.toHaveBeenCalled();
    expect(buscar).toHaveBeenCalledTimes(2);
  });

  test('el endpoint responde 204 sin contenido aunque todo falle', async () => {
    jest.spyOn(Plataforma, 'findAll').mockRejectedValue(new Error('caida'));

    const res = await ejecutar(ventas.sincronizar, { user: { id: 1, rol: 'Administrador' } });

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
