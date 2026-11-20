const path = require('path');
const PDFDocument = require('pdfkit');

const LOGO = path.join(__dirname, '..', 'assets', 'logo_zg.jpeg');

const EMPRESA = {
  nombre: 'Zona Gaucha',
  razonSocial: 'Comercializadora Zona Gaucha Chile SpA',
  rut: '77.950.292',
  telefono: '+56 9 3181 3251',
  correo: 'zonagauchachile@gmail.com',
};

const COLOR = {
  verdeOscuro: '#1e3f20',
  verdeBoton: '#2d6a4f',
  verdeClaro: '#d8f3dc',
  filaPar: '#f4f6f4',
  texto: '#1e293b',
  gris: '#64748b',
  borde: '#e2e8f0',
};

const MARGEN = 45;
const ALTO_FILA = 20;

const pesos = (valor) => '$' + Math.round(Number(valor) || 0).toLocaleString('es-CL');

// las fechas llegan como aaaa-mm-dd y en el documento se muestran como dd-mm-aaaa
const fecha = (valor) => String(valor ?? '').slice(0, 10).split('-').reverse().join('-');

const unidades = (compra) =>
  compra.productos.reduce((suma, linea) => suma + Number(linea.cantidad || 0), 0);

const COLUMNAS = [
  { titulo: 'N° factura', ancho: 72, valor: (c) => c.numeroFactura },
  { titulo: 'Fecha', ancho: 68, valor: (c) => fecha(c.fechaCompra) },
  { titulo: 'Proveedor', ancho: 118, valor: (c) => c.proveedor },
  { titulo: 'Tipo de pago', ancho: 82, valor: (c) => c.tipoPago },
  { titulo: 'Unid.', ancho: 40, valor: (c) => String(unidades(c)), alinear: 'center' },
  { titulo: 'Compra bruta', ancho: 70, valor: (c) => pesos(c.compraBruta), alinear: 'right' },
  { titulo: 'Total', ancho: 72, valor: (c) => pesos(c.compraNeta), alinear: 'right' },
];

const textoFiltros = (filtros) =>
  [
    `Factura: ${filtros.numeroFactura || 'todas'}`,
    `Fecha: ${filtros.fechaCompra ? fecha(filtros.fechaCompra) : 'todas'}`,
    `Proveedor: ${filtros.proveedor || 'todos'}`,
    `Tipo de pago: ${filtros.tipoPago || 'todos'}`,
  ].join('     ');

const dibujarEncabezado = (doc, ancho, { usuario, emitido }) => {
  const [dia, hora] = emitido.split('T');
  const xTexto = MARGEN + 70;

  doc.image(LOGO, MARGEN, 40, { width: 58, height: 58 });
  doc.fillColor(COLOR.verdeOscuro).font('Helvetica-Bold').fontSize(18).text(EMPRESA.nombre, xTexto, 50);
  doc.fillColor(COLOR.texto).font('Helvetica').fontSize(9).text(EMPRESA.razonSocial, xTexto, 72);
  doc
    .fillColor(COLOR.gris)
    .text(`RUT ${EMPRESA.rut}  ·  ${EMPRESA.telefono}`, xTexto, 84)
    .text(EMPRESA.correo, xTexto, 96);

  doc
    .fillColor(COLOR.verdeOscuro)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('Historial de compras', MARGEN, 50, { width: ancho, align: 'right' });
  doc
    .fillColor(COLOR.gris)
    .font('Helvetica')
    .fontSize(9)
    .text(`Emitido el ${fecha(dia)} a las ${hora}`, MARGEN, 70, { width: ancho, align: 'right' })
    .text(`Generado por ${usuario || 'usuario del sistema'}`, MARGEN, 82, { width: ancho, align: 'right' });

  doc.rect(MARGEN, 112, ancho, 2.5).fill(COLOR.verdeBoton);
};

const dibujarFiltros = (doc, ancho, filtros, y) => {
  doc.roundedRect(MARGEN, y, ancho, 24, 4).fill(COLOR.verdeClaro);
  doc
    .fillColor(COLOR.verdeOscuro)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('Filtros aplicados:', MARGEN + 10, y + 8, { continued: true })
    .font('Helvetica')
    .text('   ' + textoFiltros(filtros));
};

const dibujarResumen = (doc, ancho, totales, y) => {
  const tarjetas = [
    ['Compras', String(totales.cantidad)],
    ['Compra bruta', pesos(totales.compraBruta)],
    ['Impuestos', pesos(totales.impuesto)],
    ['Compra neta', pesos(totales.compraNeta)],
  ];
  const anchoTarjeta = (ancho - 30) / 4;

  tarjetas.forEach(([titulo, valor], i) => {
    const x = MARGEN + i * (anchoTarjeta + 10);
    doc.roundedRect(x, y, anchoTarjeta, 42, 4).lineWidth(0.8).stroke(COLOR.borde);
    doc.fillColor(COLOR.gris).font('Helvetica').fontSize(8.5).text(titulo, x + 9, y + 8);
    doc
      .fillColor(i === 3 ? COLOR.verdeBoton : COLOR.texto)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(valor, x + 9, y + 22);
  });
};

// recorta el texto con puntos suspensivos para que cada fila quede en una sola linea
const ajustar = (doc, texto, ancho) => {
  if (doc.widthOfString(texto) <= ancho) return texto;

  let recortado = texto;
  while (recortado.length > 1 && doc.widthOfString(recortado + '…') > ancho) recortado = recortado.slice(0, -1);

  return recortado.trimEnd() + '…';
};

const dibujarFila = (doc, valores, y, { fondo, colorTexto, fuente }) => {
  const ancho = COLUMNAS.reduce((suma, c) => suma + c.ancho, 0);
  if (fondo) doc.rect(MARGEN, y, ancho, ALTO_FILA).fill(fondo);

  let x = MARGEN;
  COLUMNAS.forEach((columna, i) => {
    doc.fillColor(colorTexto).font(fuente).fontSize(8.5);
    doc.text(ajustar(doc, String(valores[i]), columna.ancho - 12), x + 6, y + 6, {
      width: columna.ancho - 12,
      align: columna.alinear || 'left',
      lineBreak: false,
    });
    x += columna.ancho;
  });
};

const dibujarCabeceraTabla = (doc, y) =>
  dibujarFila(
    doc,
    COLUMNAS.map((c) => c.titulo),
    y,
    { fondo: COLOR.verdeOscuro, colorTexto: '#ffffff', fuente: 'Helvetica-Bold' },
  );

const dibujarPies = (doc, ancho) => {
  const rango = doc.bufferedPageRange();

  for (let i = 0; i < rango.count; i++) {
    doc.switchToPage(i);
    // el pie va dentro del margen inferior, sin esto pdfkit agrega una pagina en blanco
    doc.page.margins.bottom = 0;
    const y = doc.page.height - 38;
    doc.moveTo(MARGEN, y - 6).lineTo(MARGEN + ancho, y - 6).lineWidth(0.6).stroke(COLOR.borde);
    doc
      .fillColor(COLOR.gris)
      .font('Helvetica')
      .fontSize(8)
      .text(`${EMPRESA.nombre} · ERP`, MARGEN, y, { lineBreak: false })
      .text(`Página ${i + 1} de ${rango.count}`, MARGEN, y, {
        width: ancho,
        align: 'right',
        lineBreak: false,
      });
  }
};

// arma el pdf del historial con el encabezado de la empresa y los filtros aplicados
const generarPdfCompras = ({ compras, filtros = {}, usuario, emitido }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 40, bottom: 50, left: MARGEN, right: MARGEN },
      bufferPages: true,
      info: { Title: 'Historial de compras', Author: EMPRESA.razonSocial },
    });
    const partes = [];
    doc.on('data', (parte) => partes.push(parte));
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.on('error', reject);

    const ancho = doc.page.width - MARGEN * 2;
    const totales = {
      cantidad: compras.length,
      compraBruta: compras.reduce((s, c) => s + Number(c.compraBruta), 0),
      impuesto: compras.reduce((s, c) => s + Number(c.impuesto), 0),
      compraNeta: compras.reduce((s, c) => s + Number(c.compraNeta), 0),
    };

    dibujarEncabezado(doc, ancho, { usuario, emitido });
    dibujarFiltros(doc, ancho, filtros, 126);
    dibujarResumen(doc, ancho, totales, 162);

    let y = 220;
    dibujarCabeceraTabla(doc, y);
    y += ALTO_FILA;

    if (compras.length === 0) {
      doc
        .fillColor(COLOR.gris)
        .font('Helvetica')
        .fontSize(9)
        .text('No hay compras para los filtros aplicados.', MARGEN, y + 10, { width: ancho, align: 'center' });
      y += ALTO_FILA + 10;
    }

    compras.forEach((compra, i) => {
      if (y + ALTO_FILA > doc.page.height - 70) {
        doc.addPage();
        y = MARGEN;
        dibujarCabeceraTabla(doc, y);
        y += ALTO_FILA;
      }
      dibujarFila(
        doc,
        COLUMNAS.map((c) => c.valor(compra) ?? ''),
        y,
        { fondo: i % 2 === 1 ? COLOR.filaPar : null, colorTexto: COLOR.texto, fuente: 'Helvetica' },
      );
      y += ALTO_FILA;
    });

    const anchoTotal = COLUMNAS.at(-1).ancho;
    doc.rect(MARGEN, y, ancho, 1.5).fill(COLOR.verdeBoton);
    doc
      .fillColor(COLOR.texto)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('Total', MARGEN, y + 7, { width: ancho - anchoTotal - 6, align: 'right' });
    doc
      .fillColor(COLOR.verdeBoton)
      .text(pesos(totales.compraNeta), MARGEN + ancho - anchoTotal + 6, y + 7, {
        width: anchoTotal - 12,
        align: 'right',
      });

    dibujarPies(doc, ancho);
    doc.end();
  });

module.exports = { generarPdfCompras, textoFiltros };
