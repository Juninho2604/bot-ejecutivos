import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verificarFirmaWebhook } from '@/lib/venepagos';
import { enviarMensaje } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Posibles nombres del header de firma (la doc no lo fija; probamos varios).
const HEADERS_FIRMA = [
  'x-venepagos-signature',
  'x-signature',
  'venepagos-signature',
];

function obtenerFirma(headers) {
  for (const h of HEADERS_FIRMA) {
    const v = headers.get(h);
    if (v) return v;
  }
  return null;
}

export async function POST(request) {
  // Necesitamos el cuerpo crudo para verificar la firma.
  const raw = await request.text();
  const firma = obtenerFirma(request.headers);

  if (!verificarFirmaWebhook(raw, firma)) {
    console.error('[webhook venepagos] firma inválida');
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let evento;
  try {
    evento = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const tipo = evento?.event;
  const data = evento?.data || {};

  // Solo nos interesan los pagos completados.
  if (tipo !== 'transaction.completed' || String(data.status).toUpperCase() !== 'COMPLETED') {
    // Respondemos 200 para que VenePagos no reintente eventos que ignoramos.
    return NextResponse.json({ ok: true, ignored: tipo });
  }

  try {
    await procesarPagoCompletado(data);
  } catch (err) {
    console.error('[webhook venepagos] error procesando pago:', err.message);
    // 500 para que VenePagos reintente.
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * Marca la compra como pagada, activa al cliente y registra la conversión.
 * @param {object} data - Objeto `data` del webhook.
 */
async function procesarPagoCompletado(data) {
  const referencia =
    data.reference || data.metadata?.referencia || data.metadata?.reference || null;
  const txnId = data.id || null;

  // Buscamos la compra por referencia; si no, por id de link/transacción.
  let compra;
  if (referencia) {
    ({
      rows: [compra],
    } = await query(`SELECT * FROM compras WHERE referencia = $1`, [referencia]));
  }
  if (!compra && txnId) {
    ({
      rows: [compra],
    } = await query(
      `SELECT * FROM compras WHERE venepagos_link_id = $1 OR venepagos_txn_id = $1`,
      [txnId]
    ));
  }

  if (!compra) {
    console.error('[webhook venepagos] no se encontró compra para', { referencia, txnId });
    return;
  }

  // Idempotencia: si ya está pagada, no hacemos nada.
  if (compra.estado === 'pagado') return;

  // 1) Marcar la compra como pagada.
  await query(
    `UPDATE compras
        SET estado = 'pagado', venepagos_txn_id = $2, pagado_en = NOW()
      WHERE id = $1`,
    [compra.id, txnId]
  );

  // 2) Activar/crear el cliente y extender su suscripción.
  await query(
    `INSERT INTO clientes (telefono, nombre, plan, suscripcion_vence, ultimo_contacto)
     VALUES ($1, $2, $3, CURRENT_DATE + ($4 || ' days')::interval, NOW())
     ON CONFLICT (telefono) DO UPDATE SET
       nombre = COALESCE(clientes.nombre, EXCLUDED.nombre),
       plan = EXCLUDED.plan,
       suscripcion_vence =
         GREATEST(COALESCE(clientes.suscripcion_vence, CURRENT_DATE), CURRENT_DATE)
         + ($4 || ' days')::interval`,
    [compra.telefono, compra.nombre, compra.plan, String(compra.dias)]
  );

  // 3) Marcar el lead como convertido.
  await query(
    `UPDATE leads SET estado = 'convertido'
      WHERE telefono = $1 AND estado <> 'convertido'`,
    [compra.telefono]
  ).catch((e) => console.error('[webhook venepagos] lead update:', e.message));

  // 4) Mensaje de bienvenida por WhatsApp (no bloqueante).
  enviarMensaje(
    compra.telefono,
    `Pago confirmado. Su plan *${compra.plan}* está activo. ` +
      'Ya puede solicitar recordatorios por este medio. Por ejemplo: ' +
      '"Recuérdame llamar al banco mañana a las 9".'
  ).catch((e) => console.error('[webhook venepagos] bienvenida:', e.message));
}
