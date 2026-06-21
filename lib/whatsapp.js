import fetch from 'node-fetch';

const GRAPH_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function phoneId() {
  return process.env.WHATSAPP_PHONE_NUMBER_ID;
}

function token() {
  return process.env.WHATSAPP_TOKEN;
}

/**
 * Envía un mensaje de texto libre por WhatsApp.
 * Nota: solo permitido dentro de la ventana de 24h de servicio al cliente.
 * @param {string} tel - Número del destinatario (formato E.164 sin '+').
 * @param {string} texto - Cuerpo del mensaje.
 * @returns {Promise<object|null>}
 */
export async function enviarMensaje(tel, texto) {
  if (!tel || !texto) {
    console.error('[whatsapp] enviarMensaje: faltan parámetros');
    return null;
  }

  try {
    const res = await fetch(`${GRAPH_BASE}/${phoneId()}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: tel,
        type: 'text',
        text: { preview_url: false, body: texto },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[whatsapp] enviarMensaje error', res.status, data);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[whatsapp] enviarMensaje excepción:', err.message);
    return null;
  }
}

/**
 * Envía una plantilla (template) aprobada por WhatsApp.
 * Útil fuera de la ventana de 24h (p.ej. recordatorios proactivos).
 * @param {string} tel - Número del destinatario (E.164 sin '+').
 * @param {string} nombre - Nombre de la plantilla aprobada.
 * @param {Array<string>} [vars] - Variables del body ({{1}}, {{2}}, ...).
 * @param {string} [idioma] - Código de idioma (por defecto es_LA).
 * @returns {Promise<object|null>}
 */
export async function enviarPlantilla(tel, nombre, vars = [], idioma = 'es') {
  if (!tel || !nombre) {
    console.error('[whatsapp] enviarPlantilla: faltan parámetros');
    return null;
  }

  const components =
    vars && vars.length
      ? [
          {
            type: 'body',
            parameters: vars.map((v) => ({ type: 'text', text: String(v) })),
          },
        ]
      : [];

  try {
    const res = await fetch(`${GRAPH_BASE}/${phoneId()}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: tel,
        type: 'template',
        template: {
          name: nombre,
          language: { code: idioma },
          components,
        },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[whatsapp] enviarPlantilla error', res.status, data);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[whatsapp] enviarPlantilla excepción:', err.message);
    return null;
  }
}

/**
 * Descarga el binario de un audio recibido por WhatsApp.
 * Realiza los 2 pasos del Graph API:
 *   1) GET /{mediaId} -> obtiene una URL temporal del archivo.
 *   2) GET {url} -> descarga el binario (requiere token Bearer).
 * @param {string} mediaId - ID del media recibido en el webhook.
 * @returns {Promise<Buffer|null>} Buffer del audio (OGG) o null si falla.
 */
export async function descargarAudio(mediaId) {
  if (!mediaId) {
    console.error('[whatsapp] descargarAudio: falta mediaId');
    return null;
  }

  try {
    // Paso 1: obtener la URL temporal del media.
    const metaRes = await fetch(`${GRAPH_BASE}/${mediaId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token()}` },
    });

    const meta = await metaRes.json().catch(() => ({}));
    if (!metaRes.ok || !meta?.url) {
      console.error('[whatsapp] descargarAudio paso 1 error', metaRes.status, meta);
      return null;
    }

    // Paso 2: descargar el binario desde la URL temporal (también con Bearer).
    const binRes = await fetch(meta.url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token()}` },
    });

    if (!binRes.ok) {
      console.error('[whatsapp] descargarAudio paso 2 error', binRes.status);
      return null;
    }

    const arrayBuffer = await binRes.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error('[whatsapp] descargarAudio excepción:', err.message);
    return null;
  }
}

export default { enviarMensaje, enviarPlantilla, descargarAudio };
