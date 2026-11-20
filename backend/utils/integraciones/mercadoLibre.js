const { pedirJson } = require('./http');
const { Integracion } = require('../../models');

const PLATAFORMA = 'Mercado Libre';

// el refresh token sirve una sola vez, por eso se guarda el nuevo apenas llega
const obtenerToken = async (env) => {
  const registro = await Integracion.findByPk(PLATAFORMA);
  const refresco = registro?.refreshToken || env.MERCADOLIBRE_SELLER_REFRESH;
  const { datos } = await pedirJson('https://api.mercadolibre.com/oauth/token', {
    metodo: 'POST',
    formulario: {
      grant_type: 'refresh_token',
      client_id: env.MERCADOLIBRE_CLIENT_ID,
      client_secret: env.MERCADOLIBRE_CLIENT_SECRET,
      refresh_token: refresco,
    },
  });
  await Integracion.upsert({ plataforma: PLATAFORMA, refreshToken: datos.refresh_token });
  return datos.access_token;
};

// pagos aprobados de mercado libre consultados en mercado pago
const traerPedidos = async (env, desde) => {
  const token = await obtenerToken(env);
  const consulta = new URLSearchParams({
    sort: 'date_created',
    criteria: 'desc',
    operation_type: 'regular_payment',
    status: 'approved',
    range: 'date_created',
    begin_date: desde.toISOString(),
    end_date: new Date().toISOString(),
    limit: '100',
  });
  const { datos } = await pedirJson(`https://api.mercadopago.com/v1/payments/search?${consulta}`, {
    token,
  });
  return (datos.results || []).filter((p) => p.order?.type === 'mercadolibre').map(aVenta);
};

const TIPOS_PAGO = {
  credit_card: 'Tarjeta de Crédito',
  debit_card: 'Tarjeta de Débito',
  account_money: 'Transferencia',
  bank_transfer: 'Transferencia',
  ticket: 'Efectivo',
};

// convierte un pago al formato de venta del erp
const aVenta = (pago) => ({
  idExterno: String(pago.order.id),
  numeroDocumento: String(pago.order.id),
  nombreCliente: 'Cliente Mercado Libre',
  fechaVenta: pago.date_approved || pago.date_created,
  tipoPago: TIPOS_PAGO[pago.payment_type_id] || 'Tarjeta de Crédito',
  productos: (pago.additional_info?.items || []).map((item) => ({
    nombre: item.title,
    cantidad: Number(item.quantity),
    precioUnitario: Number(item.unit_price),
  })),
  valorAdicional: Number(pago.shipping_amount || 0),
});

module.exports = { traerPedidos, aVenta, PLATAFORMA };
