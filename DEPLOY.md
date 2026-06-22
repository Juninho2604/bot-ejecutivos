# Despliegue de Fabbio Bot en tu VPS

Guía para publicar la app en tu propio servidor con tu PostgreSQL.

---

## 0. Requisitos

- Un VPS con acceso SSH (Ubuntu/Debian recomendado).
- Un dominio apuntando al VPS (ej. `fabbio.tudominio.com`) — necesario para
  HTTPS y para los webhooks de WhatsApp/VenePagos.
- Tu PostgreSQL accesible y su cadena de conexión (`DATABASE_URL`).
- Docker + Docker Compose **o** Node.js 20+.

---

## 1. Traer el código

```bash
git clone <URL-de-tu-repo> fabbio-bot
cd fabbio-bot
git checkout claude/whatsapp-reminder-bot-nextjs-n8293h
```

## 2. Variables de entorno

```bash
cp .env.example .env
nano .env   # completa todos los valores
```

Claves importantes:

- `DATABASE_URL` — tu Postgres. Si **no** usa SSL (típico en local), añade
  `?sslmode=disable` al final.
- `NEXTAUTH_URL` y `APP_URL` — la URL pública real, ej. `https://fabbio.tudominio.com`.
- `NEXTAUTH_SECRET` — genera uno con `openssl rand -base64 32`.
- `WHATSAPP_*`, `OPENROUTER_API_KEY`, `GROQ_API_KEY`, `VENEPAGOS_*`, `CRON_SECRET`.

## 3. Cargar el esquema en tu PostgreSQL

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

---

## 4A. Despliegue con Docker (recomendado)

```bash
docker compose up -d --build
```

La app quedará escuchando en `http://127.0.0.1:3000`.

> Si tu Postgres corre en el mismo host (fuera de Docker), en `.env` usa
> `DATABASE_URL=postgresql://usuario:clave@host.docker.internal:5432/fabbio?sslmode=disable`

Crear el primer administrador (dentro del contenedor):

```bash
docker compose exec app node scripts/seed-admin.mjs admin@tudominio.com TuClave "Tu Nombre"
```

## 4B. Despliegue sin Docker (Node + systemd)

```bash
npm ci
npm run build
# Crear admin
node scripts/seed-admin.mjs admin@tudominio.com TuClave "Tu Nombre"
# Probar
node .next/standalone/server.js   # escucha en PORT (3000 por defecto)
```

Servicio systemd (`/etc/systemd/system/fabbio.service`):

```ini
[Unit]
Description=Fabbio Bot
After=network.target

[Service]
WorkingDirectory=/ruta/a/fabbio-bot
EnvironmentFile=/ruta/a/fabbio-bot/.env
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0
ExecStart=/usr/bin/node /ruta/a/fabbio-bot/.next/standalone/server.js
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now fabbio
```

---

## 5. HTTPS con Nginx (reverse proxy)

`/etc/nginx/sites-available/fabbio`:

```nginx
server {
  server_name fabbio.tudominio.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/fabbio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d fabbio.tudominio.com   # certificado HTTPS gratis
```

---

## 6. Configurar los webhooks (en producción)

- **WhatsApp Cloud API** → Webhook:
  - URL de callback: `https://fabbio.tudominio.com/api/whatsapp/webhook`
  - Verify token: el mismo de `WHATSAPP_VERIFY_TOKEN`
  - Suscríbete al campo `messages`.
- **VenePagos** → Webhook:
  - URL: `https://fabbio.tudominio.com/api/webhooks/venepagos`
  - Configura `VENEPAGOS_WEBHOOK_SECRET` si VenePagos firma los eventos.

## 7. Cron de recordatorios

Añade al crontab del servidor (cada minuto):

```bash
* * * * * curl -s -X POST https://fabbio.tudominio.com/api/cron/dispatch \
  -H "Authorization: Bearer TU_CRON_SECRET" > /dev/null 2>&1
```

---

## 8. Acceso

- Web pública: `https://fabbio.tudominio.com`
- Panel interno: `https://fabbio.tudominio.com/login`

## Actualizaciones

```bash
git pull
docker compose up -d --build       # (Docker)
# o, sin Docker:
npm ci && npm run build && sudo systemctl restart fabbio
```
