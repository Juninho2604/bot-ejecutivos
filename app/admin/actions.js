'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

/** Exige sesión de admin. Lanza si no hay sesión. */
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autorizado');
  return session;
}

/** Exige rol superadmin (para gestionar otros admins). */
async function requireSuperadmin() {
  const session = await requireAdmin();
  if (session.user.rol !== 'superadmin') {
    throw new Error('Requiere rol superadmin');
  }
  return session;
}

// ----------------------------- Recordatorios -----------------------------

export async function completarRecordatorio(formData) {
  await requireAdmin();
  const id = formData.get('id');
  if (!id) return;
  await query(
    `UPDATE recordatorios
        SET estado = 'completado', completado_en = NOW(), actualizado_en = NOW()
      WHERE id = $1`,
    [id]
  );
  revalidatePath('/admin/recordatorios');
  revalidatePath('/admin/clientes', 'layout');
  revalidatePath('/admin');
}

export async function cancelarRecordatorio(formData) {
  await requireAdmin();
  const id = formData.get('id');
  if (!id) return;
  await query(
    `UPDATE recordatorios
        SET estado = 'cancelado', actualizado_en = NOW()
      WHERE id = $1`,
    [id]
  );
  revalidatePath('/admin/recordatorios');
  revalidatePath('/admin/clientes', 'layout');
  revalidatePath('/admin');
}

export async function reabrirRecordatorio(formData) {
  await requireAdmin();
  const id = formData.get('id');
  if (!id) return;
  await query(
    `UPDATE recordatorios
        SET estado = 'pendiente', completado_en = NULL, actualizado_en = NOW()
      WHERE id = $1`,
    [id]
  );
  revalidatePath('/admin/recordatorios');
  revalidatePath('/admin/clientes', 'layout');
  revalidatePath('/admin');
}

// -------------------------------- Leads ----------------------------------

const ESTADOS_LEAD = ['nuevo', 'contactado', 'convertido', 'descartado'];

export async function cambiarEstadoLead(formData) {
  await requireAdmin();
  const id = formData.get('id');
  const estado = formData.get('estado');
  if (!id || !ESTADOS_LEAD.includes(estado)) return;
  await query(`UPDATE leads SET estado = $2 WHERE id = $1`, [id, estado]);
  revalidatePath('/admin/leads');
  revalidatePath('/admin');
}

// ------------------------------- Clientes --------------------------------

export async function extenderSuscripcion(formData) {
  await requireAdmin();
  const id = formData.get('id');
  const dias = parseInt(formData.get('dias'), 10);
  if (!id || !Number.isFinite(dias) || dias === 0) return;
  await query(
    `UPDATE clientes
        SET suscripcion_vence =
          GREATEST(COALESCE(suscripcion_vence, CURRENT_DATE), CURRENT_DATE)
          + ($2 || ' days')::interval
      WHERE id = $1`,
    [id, String(dias)]
  );
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath('/admin/clientes');
}

// -------------------------------- Admins ---------------------------------

export async function crearAdmin(formData) {
  await requireSuperadmin();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const nombre = String(formData.get('nombre') || '').trim();
  const password = String(formData.get('password') || '');
  const rol = formData.get('rol') === 'superadmin' ? 'superadmin' : 'admin';

  if (!email || password.length < 6) {
    throw new Error('Email válido y contraseña de al menos 6 caracteres requeridos');
  }

  const hash = await bcrypt.hash(password, 12);
  await query(
    `INSERT INTO admins (email, nombre, password_hash, rol, activo)
     VALUES ($1, $2, $3, $4, TRUE)
     ON CONFLICT (email) DO UPDATE SET
       nombre = EXCLUDED.nombre,
       password_hash = EXCLUDED.password_hash,
       rol = EXCLUDED.rol,
       activo = TRUE`,
    [email, nombre || null, hash, rol]
  );
  revalidatePath('/admin/admins');
}

export async function alternarAdmin(formData) {
  const session = await requireSuperadmin();
  const id = formData.get('id');
  const activar = formData.get('activar') === '1';
  if (!id) return;

  // Evita que el superadmin se desactive a sí mismo.
  if (!activar && String(session.user.id) === String(id)) {
    throw new Error('No puedes desactivar tu propia cuenta');
  }

  await query(`UPDATE admins SET activo = $2 WHERE id = $1`, [id, activar]);
  revalidatePath('/admin/admins');
}
