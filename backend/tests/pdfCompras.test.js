const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const modelos = require('../models');
const { generarPdfCompras, textoFiltros } = require('../utils/pdfCompras');

const compra = (i) => ({
  numeroFactura: String(3311100 + i),
  fechaCompra: '2026-11-0' + ((i % 9) + 1),
  proveedor: 'Yerbatera Sur',
  tipoPago: 'Transferencia',
  productos: [{ producto: 'Yerba', cantidad: 10 }, { producto: 'Mate', cantidad: 5 }],
  compraBruta: 100000,
  impuesto: 19000,
  compraNeta: 119000,
});

// cuenta las páginas mirando los objetos /Type /Page del documento
const paginas = (pdf) => pdf.toString('latin1').match(/\/Type \/Page\b/g).length;

const registroBd = {
  idCompra: 1,
  numeroFactura: 'F-100',
  fechaCompra: '2026-10-01',
  compraBruta: '100000.00',
  impuesto: '19000.00',
  compraNeta: '119000.00',
  proveedor: { razonSocial: 'Yerbatera Sur' },
  tipoPago: { nombre: 'Efectivo' },
  lote: { numeroLote: 1426, detalles: [{ producto: { nombre: 'Yerba' }, cantidadIngresada: 30 }] },
};

const cabecera = (rol) => {
  jest.spyOn(modelos.Usuario, 'findByPk').mockResolvedValue({
    idUsuario: 1,
    activo: true,
    nombre: 'Ana',
    rol: { nombre: rol },
  });
  return 'Bearer ' + jwt.sign({ id: 1 }, process.env.JWT_SECRET);
};

const leerBinario = (res, callback) => {
  const partes = [];
  res.on('data', (parte) => partes.push(parte));
  res.on('end', () => callback(null, Buffer.concat(partes)));
};

describe('pdf del historial de compras', () => {
  test('genera un documento pdf de una página con pocas compras', async () => {
    const pdf = await generarPdfCompras({
      compras: [compra(1), compra(2)],
      filtros: { proveedor: 'Yerbatera Sur' },
      usuario: 'Ana',
      emitido: '2026-11-14T23:40',
    });

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(paginas(pdf)).toBe(1);
  });

  test('pasa a otra página cuando las compras no caben', async () => {
    const pdf = await generarPdfCompras({
      compras: Array.from({ length: 40 }, (_, i) => compra(i)),
      emitido: '2026-11-14T23:40',
    });

    expect(paginas(pdf)).toBe(2);
  });

  test('un proveedor con nombre largo no agrega páginas', async () => {
    const largo = { ...compra(1), proveedor: 'Importadora de Mates y Bombillas del Litoral Limitada' };
    const pdf = await generarPdfCompras({
      compras: Array.from({ length: 20 }, () => largo),
      emitido: '2026-11-14T23:40',
    });

    expect(paginas(pdf)).toBe(1);
  });

  test('genera el documento aunque no haya compras para los filtros', async () => {
    const pdf = await generarPdfCompras({ compras: [], emitido: '2026-11-14T23:40' });

    expect(paginas(pdf)).toBe(1);
  });

  test('describe los filtros vacíos como todos y la fecha en formato chileno', () => {
    expect(textoFiltros({ fechaCompra: '2026-11-02', tipoPago: 'Débito' })).toBe(
      'Factura: todas     Fecha: 02-11-2026     Proveedor: todos     Tipo de pago: Débito',
    );
  });

  test.each(['Usuario', 'Administrador'])('%s descarga el pdf con los filtros del listado', async (rol) => {
    const buscar = jest.spyOn(modelos.Compra, 'findAll').mockResolvedValue([registroBd]);

    const respuesta = await request(app)
      .get('/compras/pdf')
      .query({ proveedor: 'Yerbatera' })
      .set('Authorization', cabecera(rol))
      .buffer(true)
      .parse(leerBinario);

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toBe('application/pdf');
    expect(respuesta.headers['content-disposition']).toMatch(
      /^attachment; filename="historial-compras-\d{4}-\d{2}-\d{2}\.pdf"$/,
    );
    expect(respuesta.body.subarray(0, 5).toString()).toBe('%PDF-');
    expect(Object.keys(buscar.mock.calls[0][0].where)).toContain('$proveedor.razonSocial$');
  });

  test('rechaza una fecha de filtro no válida', async () => {
    const respuesta = await request(app)
      .get('/compras/pdf')
      .query({ fechaCompra: '14-11-2026' })
      .set('Authorization', cabecera('Administrador'));

    expect(respuesta.status).toBe(400);
  });
});
