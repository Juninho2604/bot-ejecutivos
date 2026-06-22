# ===========================================================================
# Fabbio Bot - Imagen de producción (Next.js standalone)
# Base: node:20-slim (Debian/glibc). Evita los problemas de npm/SWC en
# Alpine/musl (npm no instalaba bien next ni los binarios SWC).
# ===========================================================================

# 1) Build
FROM node:20-slim AS builder
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

# 2) Runtime (imagen mínima con el build standalone)
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
