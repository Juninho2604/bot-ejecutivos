# ===========================================================================
# Fabbio Bot - Imagen de producción (Next.js standalone)
# ===========================================================================

# 1) Build: instala TODAS las dependencias y compila en la misma etapa
#    (evita problemas de copia de node_modules entre etapas y fuerza
#     las devDependencies aunque exista NODE_ENV=production en el entorno).
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
# Invoca Next directamente por su ruta (evita el fallo "next: not found" si
# npm no crea los enlaces en node_modules/.bin en algunos entornos Alpine).
RUN node node_modules/next/dist/bin/next build

# 2) Runtime: imagen mínima con el build standalone
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
