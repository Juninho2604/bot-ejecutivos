import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { query } from '@/lib/db';
import { TZ_CARACAS } from '@/lib/prompt';

/**
 * Formatea una fecha (Date o ISO string) a texto legible en Caracas.
 * @param {Date|string} fecha
 * @returns {string}
 */
function fechaLegible(fecha) {
  try {
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    return formatInTimeZone(d, TZ_CARACAS, "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es });
  } catch {
    return String(fecha);
  }
}

/**
 * Procesa la intención ya extraída y ejecuta la acción correspondiente.
 * @param {number|string} clienteId - ID del cliente en la BD.
 * @param {object} resultado - Objeto de intención normalizado (de extraerIntent).
 * @returns {Promise<string>} Texto de respuesta a enviar por WhatsApp.
 */
export async function procesarIntent(clienteId, resultado) {
  // Si el cerebro pide confirmación, devolvemos su pregunta sin tocar la BD.
  if (resultado?.necesita_confirmacion && resultado?.pregunta_bot) {
    return resultado.pregunta_bot;
  }

  switch (resultado?.intent) {
    case 'crear_recordatorio':
      return crearRecordatorio(clienteId, resultado);

    case 'ver_recordatorios':
      return verRecordatorios(clienteId);

    case 'crear_lista':
      return crearLista(clienteId, resultado);

    case 'completar_recordatorio':
      return completarRecordatorio(clienteId, resultado);

    case 'saludo':
      return (
        resultado.texto_confirmacion ||
        '¡Hola! 👋 Soy tu asistente de recordatorios. Dime qué necesitas recordar y yo me encargo. ' +
          'Por ejemplo: "Recuérdame llamar al contador mañana a las 10".'
      );

    case 'no_entendido':
    default:
      return (
        resultado?.pregunta_bot ||
        'Disculpa, no te entendí bien 🤔. ¿Me lo puedes decir de otra forma? ' +
          'Por ejemplo: "Recuérdame enviar la propuesta el viernes a las 3 PM".'
      );
  }
}

/**
 * Crea un recordatorio en la BD.
 */
async function crearRecordatorio(clienteId, r) {
  if (!r.tarea || !r.fecha_iso) {
    return '¿Qué quieres que te recuerde y para cuándo? Dame la tarea y la fecha/hora 🙂';
  }

  try {
    const { rows } = await query(
      `INSERT INTO recordatorios (cliente_id, tarea, fecha_objetivo, recurrencia, estado)
       VALUES ($1, $2, $3, $4, 'pendiente')
       RETURNING id, fecha_objetivo`,
      [clienteId, r.tarea, r.fecha_iso, r.recurrencia || null]
    );

    const cuando = fechaLegible(rows[0].fecha_objetivo);
    const rec = r.recurrencia ? ` (se repetirá ${r.recurrencia})` : '';
    return (
      r.texto_confirmacion ||
      `✅ Listo. Te recordaré: *${r.tarea}* el ${cuando}${rec}.`
    );
  } catch (err) {
    console.error('[recordatorios] crearRecordatorio error:', err.message);
    return 'Uy, tuve un problema guardando tu recordatorio 😓. ¿Lo intentamos de nuevo?';
  }
}

/**
 * Lista los recordatorios pendientes del cliente.
 */
async function verRecordatorios(clienteId) {
  try {
    const { rows } = await query(
      `SELECT id, tarea, fecha_objetivo, recurrencia
         FROM recordatorios
        WHERE cliente_id = $1 AND estado = 'pendiente'
        ORDER BY fecha_objetivo ASC
        LIMIT 20`,
      [clienteId]
    );

    if (!rows.length) {
      return 'No tienes recordatorios pendientes 🎉. ¿Quieres que cree alguno?';
    }

    const lineas = rows.map((row, i) => {
      const rec = row.recurrencia ? ` 🔁${row.recurrencia}` : '';
      return `${i + 1}. *${row.tarea}* — ${fechaLegible(row.fecha_objetivo)}${rec}`;
    });

    return `📋 Tus recordatorios pendientes:\n\n${lineas.join('\n')}`;
  } catch (err) {
    console.error('[recordatorios] verRecordatorios error:', err.message);
    return 'No pude consultar tus recordatorios ahora mismo 😓. Inténtalo en un momento.';
  }
}

/**
 * Crea una lista con sus ítems.
 */
async function crearLista(clienteId, r) {
  const nombre = r.lista_nombre || 'Mi lista';
  const items = Array.isArray(r.lista_items) ? r.lista_items.filter(Boolean) : [];

  if (!items.length) {
    return `¿Qué quieres agregar a la lista "${nombre}"? Dime los ítems separados por comas 📝`;
  }

  try {
    const { rows } = await query(
      `INSERT INTO listas (cliente_id, nombre, items)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [clienteId, nombre, JSON.stringify(items)]
    );

    const detalle = items.map((it) => `• ${it}`).join('\n');
    return (
      r.texto_confirmacion ||
      `📝 Creé la lista *${nombre}* (#${rows[0].id}) con:\n${detalle}`
    );
  } catch (err) {
    console.error('[recordatorios] crearLista error:', err.message);
    return 'No pude crear la lista en este momento 😓. ¿Lo intentamos otra vez?';
  }
}

/**
 * Marca como completado el recordatorio que mejor coincide con la tarea descrita,
 * o el más próximo si no se especifica.
 */
async function completarRecordatorio(clienteId, r) {
  try {
    let rows;

    if (r.tarea) {
      ({ rows } = await query(
        `SELECT id, tarea
           FROM recordatorios
          WHERE cliente_id = $1 AND estado = 'pendiente'
            AND tarea ILIKE $2
          ORDER BY fecha_objetivo ASC
          LIMIT 1`,
        [clienteId, `%${r.tarea}%`]
      ));
    } else {
      ({ rows } = await query(
        `SELECT id, tarea
           FROM recordatorios
          WHERE cliente_id = $1 AND estado = 'pendiente'
          ORDER BY fecha_objetivo ASC
          LIMIT 1`,
        [clienteId]
      ));
    }

    if (!rows.length) {
      return 'No encontré un recordatorio pendiente que coincida 🤔. ¿Puedes ser más específico?';
    }

    await query(
      `UPDATE recordatorios
          SET estado = 'completado', completado_en = NOW()
        WHERE id = $1`,
      [rows[0].id]
    );

    return r.texto_confirmacion || `✅ ¡Bien hecho! Marqué *${rows[0].tarea}* como completado.`;
  } catch (err) {
    console.error('[recordatorios] completarRecordatorio error:', err.message);
    return 'No pude actualizar el recordatorio ahora 😓. Inténtalo de nuevo, por favor.';
  }
}

export default procesarIntent;
