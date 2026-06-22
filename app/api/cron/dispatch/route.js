import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { enviarPlantilla } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Nombres de plantillas aprobadas en WhatsApp Business.
const PLANTILLA_RECORDATORIO = 'recordatorio_ejecutivo';
const PLANTILLA_SUSCRIPCION = 'suscripcion_por_vencer';

/**
 * Verifica el secreto del cron tanto por header Authorization: Bearer
 * como por header personalizado x-cron-secret.
 * @param {Request} request
 * @returns {boolean}
 */
function autorizado(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const custom = request.headers.get('x-cron-secret') || '';

  return bearer === secret || custom === secret;
}

/**
 * POST: ejecutado periódicamente (cron) para despachar:
 *  - recordatorios vencidos (estado pendiente, fecha <= ahora)
 *  - suscripciones por vencer (vista v_suscripciones_por_vencer)
 */
export async function POST(request) {
  if (!autorizado(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const resumen = {
    recordatorios_enviados: 0,
    recordatorios_fallidos: 0,
    suscripciones_enviadas: 0,
    suscripciones_fallidas: 0,
  };

  await despacharRecordatorios(resumen);
  await despacharSuscripciones(resumen);

  return NextResponse.json({ ok: true, ...resumen });
}

/**
 * Consulta y despacha los recordatorios vencidos.
 */
async function despacharRecordatorios(resumen) {
  let vencidos;
  try {
    const { rows } = await query(
      `SELECT r.id, r.tarea, r.fecha_objetivo, r.recurrencia, c.telefono, c.nombre
         FROM recordatorios r
         JOIN clientes c ON c.id = r.cliente_id
        WHERE r.estado = 'pendiente'
          AND r.fecha_objetivo <= NOW()
        ORDER BY r.fecha_objetivo ASC
        LIMIT 200`
    );
    vencidos = rows;
  } catch (err) {
    console.error('[cron] error consultando recordatorios:', err.message);
    return;
  }

  for (const r of vencidos) {
    try {
      const nombre = r.nombre || 'ejecutivo';
      const enviado = await enviarPlantilla(r.telefono, PLANTILLA_RECORDATORIO, [
        nombre,
        r.tarea,
      ]);

      if (enviado) {
        resumen.recordatorios_enviados += 1;
        await marcarRecordatorio(r);
      } else {
        resumen.recordatorios_fallidos += 1;
        await query(
          `UPDATE recordatorios SET estado = 'error', actualizado_en = NOW() WHERE id = $1`,
          [r.id]
        );
      }
    } catch (err) {
      resumen.recordatorios_fallidos += 1;
      console.error('[cron] error despachando recordatorio', r.id, err.message);
    }
  }
}

/**
 * Marca el recordatorio como enviado; si es recurrente, reprograma la próxima fecha.
 */
async function marcarRecordatorio(r) {
  if (!r.recurrencia) {
    await query(
      `UPDATE recordatorios SET estado = 'enviado', enviado_en = NOW() WHERE id = $1`,
      [r.id]
    );
    return;
  }

  const intervalo = mapaRecurrencia(r.recurrencia);
  if (!intervalo) {
    // Recurrencia no reconocida: la cerramos como enviada.
    await query(
      `UPDATE recordatorios SET estado = 'enviado', enviado_en = NOW() WHERE id = $1`,
      [r.id]
    );
    return;
  }

  // Reprograma la siguiente ocurrencia y deja el recordatorio pendiente.
  await query(
    `UPDATE recordatorios
        SET fecha_objetivo = fecha_objetivo + $2::interval,
            estado = 'pendiente',
            enviado_en = NOW()
      WHERE id = $1`,
    [r.id, intervalo]
  );
}

/**
 * Traduce una recurrencia a un intervalo de PostgreSQL.
 * @param {string} rec
 * @returns {string|null}
 */
function mapaRecurrencia(rec) {
  switch (String(rec).toLowerCase()) {
    case 'diaria':
      return '1 day';
    case 'semanal':
      return '7 days';
    case 'mensual':
      return '1 month';
    case 'anual':
      return '1 year';
    default:
      return null;
  }
}

/**
 * Consulta la vista v_suscripciones_por_vencer y despacha avisos.
 */
async function despacharSuscripciones(resumen) {
  let suscripciones;
  try {
    const { rows } = await query(
      `SELECT telefono, nombre, plan, fecha_vencimiento, dias_restantes
         FROM v_suscripciones_por_vencer
        LIMIT 200`
    );
    suscripciones = rows;
  } catch (err) {
    console.error('[cron] error consultando v_suscripciones_por_vencer:', err.message);
    return;
  }

  for (const s of suscripciones) {
    try {
      const enviado = await enviarPlantilla(s.telefono, PLANTILLA_SUSCRIPCION, [
        s.nombre || 'ejecutivo',
        s.plan || 'tu plan',
        String(s.dias_restantes ?? ''),
      ]);

      if (enviado) {
        resumen.suscripciones_enviadas += 1;
      } else {
        resumen.suscripciones_fallidas += 1;
      }
    } catch (err) {
      resumen.suscripciones_fallidas += 1;
      console.error('[cron] error despachando suscripción a', s.telefono, err.message);
    }
  }
}
