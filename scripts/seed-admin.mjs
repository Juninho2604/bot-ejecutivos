/**
 * Crea (o actualiza) un administrador del panel interno.
 *
 * Uso:
 *   node scripts/seed-admin.mjs <email> <password> [nombre]
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/seed-admin.mjs
 *
 * Requiere DATABASE_URL en el entorno y la tabla `admins` ya creada
 * (ver db/schema.sql).
 */
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const email = (process.argv[2] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.argv[3] || process.env.ADMIN_PASSWORD || '';
const nombre = process.argv[4] || process.env.ADMIN_NOMBRE || 'Administrador';

if (!email || !password) {
  console.error('Uso: node scripts/seed-admin.mjs <email> <password> [nombre]');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en el entorno.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=disable')
    ? false
    : { rejectUnauthorized: false },
});

async function main() {
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO admins (email, nombre, password_hash, rol, activo)
     VALUES ($1, $2, $3, 'superadmin', TRUE)
     ON CONFLICT (email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash,
                   nombre = EXCLUDED.nombre,
                   activo = TRUE
     RETURNING id, email`,
    [email, nombre, hash]
  );
  console.log(`Admin listo: ${rows[0].email} (id ${rows[0].id})`);
  await pool.end();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
