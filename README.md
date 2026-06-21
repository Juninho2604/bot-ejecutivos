# Bot de recordatorios por WhatsApp para ejecutivos

Bot construido con **Next.js (App Router)** que recibe mensajes de WhatsApp
(texto o notas de voz), entiende la intención con IA y gestiona recordatorios,
listas y avisos de suscripción.

## Arquitectura

```
lib/
  db.js            Conexión a PostgreSQL (pool de pg) + query(sql, params)
  prompt.js        buildSystemPrompt() con fecha/hora de Caracas (UTC-4)
  cerebro.js       extraerIntent(mensaje) -> OpenRouter (gpt-4o-mini, JSON)
  transcribir.js   transcribirAudio(buffer) -> Groq (whisper-large-v3, es)
  whatsapp.js      enviarMensaje, enviarPlantilla, descargarAudio (Graph v21.0)
  recordatorios.js procesarIntent(clienteId, resultado) -> acción + respuesta

app/api/
  whatsapp/webhook/route.js  GET (verificación Meta) + POST (mensajes entrantes)
  cron/dispatch/route.js     POST protegido con CRON_SECRET (despacho)

db/schema.sql      Tablas (clientes, recordatorios, listas, mensajes) y vista
                   v_suscripciones_por_vencer
```

## Puesta en marcha

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia las variables de entorno y complétalas:

   ```bash
   cp .env.example .env.local
   ```

3. Crea el esquema en tu PostgreSQL:

   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   ```

4. Arranca en desarrollo:

   ```bash
   npm run dev
   ```

## Endpoints

### `GET /api/whatsapp/webhook`
Verificación del webhook de Meta. Responde `hub.challenge` cuando
`hub.verify_token` coincide con `WHATSAPP_VERIFY_TOKEN`.

### `POST /api/whatsapp/webhook`
Recibe mensajes entrantes. Responde `200` de inmediato y procesa en background:
upsert del cliente, transcripción de audio si aplica, extracción de intención,
guardado en `mensajes` y respuesta por WhatsApp.

### `POST /api/cron/dispatch`
Protegido con `CRON_SECRET` (header `Authorization: Bearer <secret>` o
`x-cron-secret`). Despacha recordatorios vencidos y avisos de la vista
`v_suscripciones_por_vencer` mediante plantillas aprobadas.

Ejemplo:

```bash
curl -X POST https://tu-dominio.com/api/cron/dispatch \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Plantillas de WhatsApp requeridas

- `recordatorio_ejecutivo` — body con 2 variables: `{{1}}` nombre, `{{2}}` tarea.
- `suscripcion_por_vencer` — body con 3 variables: nombre, plan, días restantes.

## Variables de entorno

Ver `.env.example`.
