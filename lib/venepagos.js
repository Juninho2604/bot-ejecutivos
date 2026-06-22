import crypto from 'crypto';

// Base de la API de VenePagos. Configurable por entorno para sandbox/producción.
const API_URL = process.env.VENEPAGOS_API_URL || 'https://api.venepagos.com.ve/api/v1';

function apiKey() {
  return process.env.VENEPAGOS_API_KEY; // vp_live_... | vp_test_...
}

function merchantId() {
  return process.env.VENEPAGOS_MERCHANT_ID; // mch_...
}

/**
 * Crea un link de pago en VenePagos.
 *
 * NOTA: el cuerpo exacto del endpoint de creación no está completamente
 * documentado públicamente. Centralizamos aquí el mapeo de campos; si la API
 * usa nombres distintos, ajústalos en `payload` y en el parseo de la respuesta.
 * Endpoint observado en la doc: POST {API}/merchants/{merchantId}/store/links
 *
 * @param {object} args
 * @param {number} args.monto - Monto a cobrar.
 * @param {string} args.titulo - Título del cobro.
 * @param {string} [args.descripcion] - Descripción.
 * @param {string} [args.moneda] - 'USD' | 'VES' (por defecto USD).
 * @param {string} args.referencia - Referencia única nuestra (para conciliar).
 * @param {object} [args.metadata] - Datos extra (se intentan eco en el webhook).
 * @param {string} [args.urlExito] - URL de redirección al pagar.
 * @param {string} [args.urlCancelar] - URL si el cliente cancela.
 * @returns {Promise<{ok: boolean, url?: string, id?: string, raw?: any, error?: string}>}
 */
export async function crearLinkPago({
  monto,
  titulo,
  descripcion,
  moneda = 'USD',
  referencia,
  metadata = {},
  urlExito,
  urlCancelar,
}) {
  if (!apiKey() || !merchantId()) {
    return { ok: false, error: 'Faltan VENEPAGOS_API_KEY o VENEPAGOS_MERCHANT_ID' };
  }
  if (!monto || !titulo) {
    return { ok: false, error: 'monto y titulo son obligatorios' };
  }

  // Mapeo de campos hacia la API. Ajustar nombres si la API real difiere.
  const payload = {
    amount: monto,
    currency: moneda,
    title: titulo,
    description: descripcion || titulo,
    reference: referencia,
    metadata: { referencia, ...metadata },
    successUrl: urlExito,
    cancelUrl: urlCancelar,
  };

  try {
    const res = await fetch(`${API_URL}/merchants/${merchantId()}/store/links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[venepagos] crearLinkPago error', res.status, data);
      return { ok: false, error: data?.message || `HTTP ${res.status}`, raw: data };
    }

    // La respuesta puede venir envuelta (data.*) y con distintos nombres.
    const obj = data?.data || data;
    const url =
      obj.url || obj.paymentUrl || obj.link || obj.shortUrl || obj.checkoutUrl;
    const id = obj.id || obj.linkId || obj.paymentLinkId;

    if (!url) {
      console.error('[venepagos] respuesta sin URL de pago:', data);
      return { ok: false, error: 'Respuesta sin URL de pago', raw: data };
    }

    return { ok: true, url, id, raw: data };
  } catch (err) {
    console.error('[venepagos] crearLinkPago excepción:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Verifica la firma de un webhook de VenePagos (si está configurada).
 *
 * La doc no detalla el algoritmo exacto, así que asumimos HMAC-SHA256 del
 * cuerpo crudo con un secreto compartido, comparado con un header de firma.
 * Si no hay secreto configurado, no se verifica (devuelve true) — útil en
 * sandbox, pero configura VENEPAGOS_WEBHOOK_SECRET en producción.
 *
 * @param {string} rawBody - Cuerpo crudo (string) tal cual se recibió.
 * @param {string|null} firma - Valor del header de firma.
 * @returns {boolean}
 */
export function verificarFirmaWebhook(rawBody, firma) {
  const secret = process.env.VENEPAGOS_WEBHOOK_SECRET;
  if (!secret) return true; // sin secreto: no verificamos

  if (!firma) return false;

  try {
    const esperado = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');

    // Acepta firmas con o sin prefijo tipo "sha256=".
    const recibida = firma.includes('=') ? firma.split('=').pop() : firma;

    const a = Buffer.from(esperado, 'hex');
    const b = Buffer.from(recibida, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (err) {
    console.error('[venepagos] verificarFirmaWebhook error:', err.message);
    return false;
  }
}

export default { crearLinkPago, verificarFirmaWebhook };
