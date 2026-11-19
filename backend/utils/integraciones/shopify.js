const { pedirJson } = require('./http');

const VERSION_API = '2026-10';
const MAX_PAGINAS = 4;

const dominio = (env) =>
  String(env.SHOPIFY_TIENDA || '')
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');

const obtenerToken = async (env) => {
  const { datos } = await pedirJson(`https://${dominio(env)}/admin/oauth/access_token`, {
    metodo: 'POST',
    formulario: {
      grant_type: 'client_credentials',
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
    },
  });
  return datos.access_token;
};

// el enlace a la pagina siguiente viene en la cabecera link
const siguientePagina = (enlace) => /<([^>]+)>;\s*rel="next"/.exec(enlace || '')?.[1];

const traerPedidos = async (env, desde) => {
  const token = await obtenerToken(env);
  const consulta = new URLSearchParams({
    status: 'any',
    financial_status: 'paid',
    created_at_min: desde.toISOString(),
    limit: '250',
  });
  let url = `https://${dominio(env)}/admin/api/${VERSION_API}/orders.json?${consulta}`;
  const pedidos = [];
  for (let pagina = 0; url && pagina < MAX_PAGINAS; pagina++) {
    const { datos, cabeceras } = await pedirJson(url, { token });
    pedidos.push(...(datos.orders || []));
    url = siguientePagina(cabeceras.get('link'));
  }
  return pedidos.filter((p) => !p.cancelled_at).map(aVenta);
};

const TIPOS_PAGO = { manual: 'Transferencia', cash_on_delivery: 'Efectivo' };

const aVenta = (pedido) => {
  const cliente = [pedido.customer?.first_name, pedido.customer?.last_name].filter(Boolean).join(' ');
  return {
    idExterno: String(pedido.id),
    numeroDocumento: String(pedido.order_number ?? pedido.id),
    nombreCliente: cliente || 'Cliente Shopify',
    fechaVenta: pedido.processed_at || pedido.created_at,
    tipoPago: TIPOS_PAGO[pedido.payment_gateway_names?.[0]] || 'Tarjeta de Crédito',
    productos: (pedido.line_items || []).map((linea) => ({
      nombre: linea.title,
      cantidad: Number(linea.quantity),
      precioUnitario: Number(linea.price),
    })),
    valorAdicional: (pedido.shipping_lines || []).reduce((suma, envio) => suma + Number(envio.price || 0), 0),
  };
};

module.exports = { traerPedidos, aVenta };
