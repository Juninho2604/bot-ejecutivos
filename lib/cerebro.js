import { buildSystemPrompt } from '@/lib/prompt';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODELO = 'openai/gpt-4o-mini';

/**
 * Resultado por defecto (fallback) cuando algo falla o no se entiende.
 * @param {string} [pregunta]
 * @returns {object}
 */
function intentFallback(pregunta = 'Disculpa, no te entendí bien. ¿Me lo puedes repetir de otra forma?') {
  return {
    intent: 'no_entendido',
    confianza: 0,
    tarea: null,
    fecha_iso: null,
    fecha_legible: null,
    recurrencia: null,
    lista_nombre: null,
    lista_items: null,
    necesita_confirmacion: true,
    pregunta_bot: pregunta,
    texto_confirmacion: null,
  };
}

/**
 * Normaliza el objeto devuelto por el modelo asegurando todas las claves.
 * @param {object} raw
 * @returns {object}
 */
function normalizar(raw) {
  const base = intentFallback();
  if (!raw || typeof raw !== 'object') return base;

  const intentsValidos = [
    'crear_recordatorio',
    'ver_recordatorios',
    'crear_lista',
    'completar_recordatorio',
    'saludo',
    'no_entendido',
  ];

  return {
    intent: intentsValidos.includes(raw.intent) ? raw.intent : 'no_entendido',
    confianza: typeof raw.confianza === 'number' ? raw.confianza : 0,
    tarea: raw.tarea ?? null,
    fecha_iso: raw.fecha_iso ?? null,
    fecha_legible: raw.fecha_legible ?? null,
    recurrencia: raw.recurrencia ?? null,
    lista_nombre: raw.lista_nombre ?? null,
    lista_items: Array.isArray(raw.lista_items) ? raw.lista_items : raw.lista_items ?? null,
    necesita_confirmacion: Boolean(raw.necesita_confirmacion),
    pregunta_bot: raw.pregunta_bot ?? null,
    texto_confirmacion: raw.texto_confirmacion ?? null,
  };
}

/**
 * Intenta parsear JSON de forma segura, incluso si viene envuelto en texto/markdown.
 * @param {string} contenido
 * @returns {object|null}
 */
function parseSeguro(contenido) {
  if (!contenido || typeof contenido !== 'string') return null;
  try {
    return JSON.parse(contenido);
  } catch {
    // Intenta rescatar el primer bloque {...} si vino con texto alrededor.
    const inicio = contenido.indexOf('{');
    const fin = contenido.lastIndexOf('}');
    if (inicio !== -1 && fin !== -1 && fin > inicio) {
      try {
        return JSON.parse(contenido.slice(inicio, fin + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Extrae la intención del mensaje del usuario usando OpenRouter (gpt-4o-mini).
 * @param {string} mensaje - Texto del usuario.
 * @returns {Promise<object>} Objeto de intención normalizado.
 */
export async function extraerIntent(mensaje) {
  if (!mensaje || !mensaje.trim()) {
    return intentFallback('No recibí ningún mensaje. ¿Qué necesitas?');
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('[cerebro] Falta OPENROUTER_API_KEY');
    return intentFallback();
  }

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        // Headers opcionales recomendados por OpenRouter para atribución.
        'HTTP-Referer': process.env.APP_URL || 'https://localhost',
        'X-Title': 'Bot Ejecutivos WhatsApp',
      },
      body: JSON.stringify({
        model: MODELO,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: mensaje },
        ],
      }),
    });

    if (!res.ok) {
      const detalle = await res.text().catch(() => '');
      console.error('[cerebro] OpenRouter respondió', res.status, detalle);
      return intentFallback();
    }

    const data = await res.json();
    const contenido = data?.choices?.[0]?.message?.content;
    const parsed = parseSeguro(contenido);

    if (!parsed) {
      console.error('[cerebro] No se pudo parsear la respuesta del modelo:', contenido);
      return intentFallback();
    }

    return normalizar(parsed);
  } catch (err) {
    console.error('[cerebro] Error llamando a OpenRouter:', err.message);
    return intentFallback();
  }
}

export default extraerIntent;
