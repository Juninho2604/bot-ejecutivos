import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getPlan } from '@/lib/planes';
import { crearLinkPago } from '@/lib/venepagos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Normaliza un teléfono a solo dígitos (formato E.164 sin '+'). */
function normalizarTel(tel) {
  return String(tel || '').replace(/[^\d]/g, '');
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  }

  const plan = getPlan(body.plan);
  if (!plan) {
    return NextResponse.json({ error: 'Plan no válido' }, { status: 400 });
  }

  const nombre = (body.nombre || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const telefono = normalizarTel(body.telefono);

  if (!telefono || telefono.length < 10) {
    return NextResponse.json(
      { error: 'Ingresa un número de WhatsApp válido con código de país.' },
      { status: 400 }
    );
  }

  // Referencia única para conciliar el pago con el webhook.
  const referencia = `BOT-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  try {
    // 1) Registramos la compra como pendiente y guardamos un lead.
    await query(
      `INSERT INTO compras (referencia, nombre, email, telefono, plan, monto, moneda, dias, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendiente')`,
      [referencia, nombre, email, telefono, plan.slug, plan.precio, plan.moneda, plan.dias]
    );

    await query(
      `INSERT INTO leads (nombre, email, telefono, plan, origen, estado)
       VALUES ($1, $2, $3, $4, 'checkout', 'nuevo')`,
      [nombre, email, telefono, plan.slug]
    ).catch((e) => console.error('[checkout] no se pudo guardar lead:', e.message));

    // 2) Creamos el link de pago en VenePagos.
    const link = await crearLinkPago({
      monto: plan.precio,
      moneda: plan.moneda,
      titulo: `Bot Ejecutivos · Plan ${plan.nombre}`,
      descripcion: `Suscripción mensual al plan ${plan.nombre}`,
      referencia,
      metadata: { plan: plan.slug, telefono, email },
      urlExito: `${appUrl}/pago/exito?ref=${referencia}`,
      urlCancelar: `${appUrl}/pago/cancelado?ref=${referencia}`,
    });

    if (!link.ok || !link.url) {
      await query(`UPDATE compras SET estado = 'fallido' WHERE referencia = $1`, [
        referencia,
      ]).catch(() => {});
      return NextResponse.json(
        { error: link.error || 'No se pudo crear el pago' },
        { status: 502 }
      );
    }

    // 3) Guardamos el id del link y devolvemos la URL al cliente.
    await query(
      `UPDATE compras SET venepagos_link_id = $2 WHERE referencia = $1`,
      [referencia, link.id || null]
    );

    return NextResponse.json({ url: link.url, referencia });
  } catch (err) {
    console.error('[checkout] error:', err.message);
    return NextResponse.json({ error: 'Error procesando el checkout' }, { status: 500 });
  }
}
