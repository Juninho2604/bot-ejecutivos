#!/usr/bin/env bash
# ===========================================================================
# Fabbio Bot - Auditoría de salud y puertos del VPS (SOLO LECTURA)
# No modifica nada. Ejecútalo en tu servidor:
#   bash scripts/vps-check.sh
# Para ver el proceso dueño de cada puerto, ejecútalo con sudo:
#   sudo bash scripts/vps-check.sh
# ===========================================================================
set -u
sec() { printf '\n\033[1;33m=== %s ===\033[0m\n' "$1"; }

# Helper: lista de puertos TCP en escucha (ss o netstat)
listen_tcp() { ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null; }
listen_tcp_simple() { ss -tln 2>/dev/null || netstat -tln 2>/dev/null; }

sec "Sistema operativo"
( . /etc/os-release 2>/dev/null && echo "$PRETTY_NAME" ) || uname -a
uname -r
echo "Uptime: $(uptime -p 2>/dev/null || uptime)"

sec "CPU y carga"
echo "Núcleos: $(nproc 2>/dev/null || echo '?')"
echo "Load avg (1/5/15): $(cut -d' ' -f1-3 /proc/loadavg 2>/dev/null)"

sec "Memoria"
free -h 2>/dev/null || free

sec "Disco"
df -h 2>/dev/null | grep -vE 'tmpfs|udev|overlay' | head -12

sec "Top 8 procesos por memoria"
ps aux --sort=-%mem 2>/dev/null | awk 'NR==1 || NR<=9 {printf "%-10s %5s%% %6s  %s\n",$1,$4,$6,$11}'

sec "Puertos TCP en escucha"
listen_tcp | sort -u

sec "Disponibilidad de puertos candidatos"
for p in 3000 3001 3002 3003 4000 8080 8090; do
  if listen_tcp_simple | grep -qE "[:.]$p[[:space:]]"; then
    printf '  %-5s \033[31mOCUPADO\033[0m\n' "$p"
  else
    printf '  %-5s \033[32mlibre\033[0m\n' "$p"
  fi
done

sec "Docker"
if command -v docker >/dev/null 2>&1; then
  docker --version
  echo "-- Contenedores en ejecución --"
  docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}' 2>/dev/null \
    || echo "  (sin permisos para docker; prueba con sudo)"
else
  echo "Docker NO instalado"
fi

sec "Reverse proxy / web server"
found=0
for s in nginx caddy traefik apache2 httpd; do
  if command -v "$s" >/dev/null 2>&1 || pgrep -x "$s" >/dev/null 2>&1; then
    echo "Detectado: $s"; found=1
  fi
done
[ "$found" = 0 ] && echo "No se detectó reverse proxy"
nginx -v 2>&1 | head -1
if [ -d /etc/nginx/sites-enabled ]; then
  echo "-- vhosts nginx habilitados --"; ls /etc/nginx/sites-enabled/ 2>/dev/null
fi

sec "PostgreSQL"
command -v psql >/dev/null 2>&1 && psql --version
if listen_tcp_simple | grep -qE '[:.]5432[[:space:]]'; then
  echo "Postgres escuchando en 5432 (local)"
else
  echo "5432 no detectado en local (¿remoto, otro puerto o dentro de Docker?)"
fi

sec "Firewall (ufw)"
ufw status 2>/dev/null || echo "ufw no disponible o requiere sudo"

sec "Resumen"
echo "Comparte esta salida y te recomiendo: puerto interno libre para Fabbio,"
echo "ajuste del docker-compose y el vhost de Nginx para no chocar con tus proyectos."
