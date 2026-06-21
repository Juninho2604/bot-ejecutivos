-- ===========================================================================
-- Esquema de base de datos - Bot de recordatorios por WhatsApp para ejecutivos
-- PostgreSQL
-- ===========================================================================

-- Clientes (identificados por su número de WhatsApp).
CREATE TABLE IF NOT EXISTS clientes (
  id              BIGSERIAL PRIMARY KEY,
  telefono        TEXT NOT NULL UNIQUE,      -- E.164 sin '+'
  nombre          TEXT,
  plan            TEXT DEFAULT 'free',
  suscripcion_vence DATE,                    -- vencimiento de la suscripción
  ultimo_contacto TIMESTAMPTZ DEFAULT NOW(),
  creado_en       TIMESTAMPTZ DEFAULT NOW()
);

-- Recordatorios.
CREATE TABLE IF NOT EXISTS recordatorios (
  id             BIGSERIAL PRIMARY KEY,
  cliente_id     BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tarea          TEXT NOT NULL,
  fecha_objetivo TIMESTAMPTZ NOT NULL,       -- cuándo debe dispararse
  recurrencia    TEXT,                       -- null | diaria | semanal | mensual | anual
  estado         TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | enviado | completado | error
  enviado_en     TIMESTAMPTZ,
  completado_en  TIMESTAMPTZ,
  actualizado_en TIMESTAMPTZ,
  creado_en      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recordatorios_dispatch
  ON recordatorios (estado, fecha_objetivo);
CREATE INDEX IF NOT EXISTS idx_recordatorios_cliente
  ON recordatorios (cliente_id, estado);

-- Listas (compras, tareas, etc.). Los ítems se guardan como JSONB.
CREATE TABLE IF NOT EXISTS listas (
  id         BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre     TEXT NOT NULL,
  items      JSONB NOT NULL DEFAULT '[]'::jsonb,
  creado_en  TIMESTAMPTZ DEFAULT NOW()
);

-- Bitácora de mensajes (entrantes y salientes).
CREATE TABLE IF NOT EXISTS mensajes (
  id          BIGSERIAL PRIMARY KEY,
  cliente_id  BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  direccion   TEXT NOT NULL DEFAULT 'entrante', -- entrante | saliente
  tipo        TEXT NOT NULL DEFAULT 'text',     -- text | audio | template | ...
  contenido   TEXT,
  intent_json JSONB,
  creado_en   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mensajes_cliente ON mensajes (cliente_id, creado_en DESC);

-- Administradores del panel interno (intraweb). Autenticación con NextAuth
-- usando contraseñas hasheadas con bcrypt.
CREATE TABLE IF NOT EXISTS admins (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  nombre        TEXT,
  password_hash TEXT NOT NULL,
  rol           TEXT NOT NULL DEFAULT 'admin',  -- admin | superadmin
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login  TIMESTAMPTZ,
  creado_en     TIMESTAMPTZ DEFAULT NOW()
);

-- Leads/prospectos captados desde la web pública (antes de convertirse en cliente).
CREATE TABLE IF NOT EXISTS leads (
  id         BIGSERIAL PRIMARY KEY,
  nombre     TEXT,
  email      TEXT,
  telefono   TEXT,
  plan       TEXT,
  origen     TEXT DEFAULT 'web',            -- web | checkout | referido | ...
  estado     TEXT NOT NULL DEFAULT 'nuevo', -- nuevo | contactado | convertido | descartado
  notas      TEXT,
  creado_en  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads (estado, creado_en DESC);

-- Vista: suscripciones próximas a vencer (en los próximos 7 días).
CREATE OR REPLACE VIEW v_suscripciones_por_vencer AS
SELECT
  c.id                                       AS cliente_id,
  c.telefono,
  c.nombre,
  c.plan,
  c.suscripcion_vence                        AS fecha_vencimiento,
  (c.suscripcion_vence - CURRENT_DATE)       AS dias_restantes
FROM clientes c
WHERE c.suscripcion_vence IS NOT NULL
  AND c.suscripcion_vence >= CURRENT_DATE
  AND c.suscripcion_vence <= CURRENT_DATE + INTERVAL '7 days';
