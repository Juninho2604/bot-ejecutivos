-- ===========================================================================
-- Fabbio Bot - base de datos y usuario dedicados (opción: Postgres del host)
-- Ejecuta como superusuario en tu Postgres del host (127.0.0.1:5432):
--   sudo -u postgres psql -f deploy/postgres-setup.sql
-- Luego carga el esquema:
--   psql "postgresql://fabbio:CAMBIA_ESTA_CLAVE@127.0.0.1:5432/fabbio?sslmode=disable" -f db/schema.sql
-- ===========================================================================
CREATE USER fabbio WITH PASSWORD 'CAMBIA_ESTA_CLAVE';
CREATE DATABASE fabbio OWNER fabbio;
