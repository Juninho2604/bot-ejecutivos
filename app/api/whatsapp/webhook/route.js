import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { extraerIntent } from '@/lib/cerebro';
import { transcribirAudio } from '@/lib/transcribir';
import { enviarMensaje, descargarAudio } from '@/lib/whatsapp';
import { procesarIntent } from '@/lib/recordatorios';

// El webhook necesita el runtime de Node (pg, node-fetch, Buffer).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET: verificación del webhook por parte de Meta.
 * Meta envía hub.mode, hub.verify_token y hub.challenge.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    // Debe devolver el challenge como texto plano.
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

/**
 * POST: recepción de mensajes entrantes.
 * Responde 200 de inmediato y procesa en segundo plano para evitar
 * reintentos de Meta por timeouts.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Procesamos sin bloquear la respuesta 200.
  procesarWebhook(body).catch((err) =>
    console.error('[webhook] error en procesamiento async:', err)
  );

  return NextResponse.json({ ok: true });
}

/**
 * Lógica principal del webhook (corre en background).
 * @param {object} body - Payload del webhook de WhatsApp.
 */
async function procesarWebhook(body) {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const mensaje = value?.messages?.[0];

  // Si no hay mensaje entrante (p.ej. statuses), no hacemos nada.
  if (!mensaje) return;

  const tel = mensaje.from;
  const perfil = value?.contacts?.[0]?.profile;
  const nombrePerfil = perfil?.name || null;

  if (!tel) return;

  // 1) Upsert del cliente por teléfono.
  const clienteId = await upsertCliente(tel, nombrePerfil);
  if (!clienteId) {
    console.error('[webhook] no se pudo obtener clienteId');
    return;
  }

  // 2) Extraer el texto (directo o vía transcripción de audio).
  let texto = '';
  let tipo = mensaje.type;

  try {
    if (mensaje.type === 'text') {
      texto = mensaje.text?.body || '';
    } else if (mensaje.type === 'audio') {
      const mediaId = mensaje.audio?.id;
      const buffer = await descargarAudio(mediaId);
      if (buffer) {
        texto = await transcribirAudio(buffer);
      }
      if (!texto) {
        await enviarMensaje(
          tel,
          'No pude procesar la nota de voz. ¿Podría escribirlo o enviarlo nuevamente?'
        );
        await guardarMensaje(clienteId, 'audio', '', null);
        return;
      }
    } else {
      // Otros tipos (imagen, ubicación, etc.) no soportados aún.
      await enviarMensaje(
        tel,
        'Por ahora solo proceso texto y notas de voz. ¿Podría escribirlo?'
      );
      return;
    }
  } catch (err) {
    console.error('[webhook] error obteniendo texto:', err.message);
    await enviarMensaje(tel, 'Tuve un inconveniente procesando su mensaje. Inténtelo de nuevo.');
    return;
  }

  // 3) Llamar al cerebro para extraer la intención.
  const resultado = await extraerIntent(texto);

  // 4) Guardar el mensaje entrante + intención detectada.
  await guardarMensaje(clienteId, tipo, texto, resultado);

  // 5) Procesar la intención y obtener la respuesta.
  let respuesta;
  try {
    respuesta = await procesarIntent(clienteId, resultado);
  } catch (err) {
    console.error('[webhook] error procesando intent:', err.message);
    respuesta = 'Ocurrió un inconveniente de mi parte. ¿Lo intentamos nuevamente?';
  }

  // 6) Responder por WhatsApp.
  if (respuesta) {
    await enviarMensaje(tel, respuesta);
  }
}

/**
 * Inserta el cliente si no existe (por teléfono) y devuelve su id.
 * @param {string} tel
 * @param {string|null} nombre
 * @returns {Promise<number|null>}
 */
async function upsertCliente(tel, nombre) {
  try {
    const { rows } = await query(
      `INSERT INTO clientes (telefono, nombre, ultimo_contacto)
       VALUES ($1, $2, NOW())
       ON CONFLICT (telefono)
       DO UPDATE SET
         ultimo_contacto = NOW(),
         nombre = COALESCE(clientes.nombre, EXCLUDED.nombre)
       RETURNING id`,
      [tel, nombre]
    );
    return rows[0]?.id ?? null;
  } catch (err) {
    console.error('[webhook] upsertCliente error:', err.message);
    return null;
  }
}

/**
 * Guarda el mensaje entrante y la intención detectada.
 * @param {number} clienteId
 * @param {string} tipo - 'text' | 'audio' | ...
 * @param {string} contenido - Texto (transcrito si era audio).
 * @param {object|null} intent - Resultado del cerebro.
 */
async function guardarMensaje(clienteId, tipo, contenido, intent) {
  try {
    await query(
      `INSERT INTO mensajes (cliente_id, direccion, tipo, contenido, intent_json)
       VALUES ($1, 'entrante', $2, $3, $4)`,
      [clienteId, tipo, contenido, intent ? JSON.stringify(intent) : null]
    );
  } catch (err) {
    console.error('[webhook] guardarMensaje error:', err.message);
  }
}
