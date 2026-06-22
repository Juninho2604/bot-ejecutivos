import pg from 'pg';

const { Pool } = pg;

// Reutilizamos un único pool entre invocaciones (importante en serverless,
// donde el módulo puede mantenerse caliente entre requests).
const globalForPg = globalThis;

const pool =
  globalForPg.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Muchos proveedores gestionados (Supabase, Neon, RDS) exigen SSL.
    ssl:
      process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=disable')
        ? false
        : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg.__pgPool = pool;
}

pool.on('error', (err) => {
  // Evita que un error en un cliente inactivo tumbe el proceso.
  console.error('[db] Error inesperado en cliente del pool:', err);
});

/**
 * Ejecuta una consulta SQL parametrizada.
 * @param {string} sql - Sentencia SQL con placeholders ($1, $2, ...).
 * @param {Array<any>} [params] - Valores para los placeholders.
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(sql, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(sql, params);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[db] query ok', {
        ms: Date.now() - start,
        rows: result.rowCount,
      });
    }
    return result;
  } catch (err) {
    console.error('[db] query error:', err.message, '\nSQL:', sql);
    throw err;
  }
}

export { pool };
export default { query, pool };
