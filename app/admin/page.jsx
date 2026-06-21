import {
  Users,
  BellRing,
  CheckCircle2,
  UserPlus,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { query } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fmtFecha } from '@/lib/format';

export const dynamic = 'force-dynamic';

async function getStats() {
  // Una sola ida a la BD con subconsultas agregadas.
  const { rows } = await query(`
    SELECT
      (SELECT COUNT(*) FROM clientes)                                              AS clientes,
      (SELECT COUNT(*) FROM recordatorios WHERE estado = 'pendiente')             AS pendientes,
      (SELECT COUNT(*) FROM recordatorios WHERE estado = 'enviado'
         AND enviado_en::date = CURRENT_DATE)                                      AS enviados_hoy,
      (SELECT COUNT(*) FROM leads WHERE estado = 'nuevo')                          AS leads_nuevos,
      (SELECT COUNT(*) FROM mensajes WHERE creado_en::date = CURRENT_DATE)         AS mensajes_hoy,
      (SELECT COUNT(*) FROM v_suscripciones_por_vencer)                            AS por_vencer
  `);
  return rows[0];
}

async function getUltimosMensajes() {
  const { rows } = await query(`
    SELECT m.id, m.tipo, m.contenido, m.direccion, m.creado_en, c.telefono, c.nombre
      FROM mensajes m
      JOIN clientes c ON c.id = m.cliente_id
     ORDER BY m.creado_en DESC
     LIMIT 8
  `);
  return rows;
}

const TARJETAS = [
  { key: 'clientes', label: 'Clientes', icon: Users },
  { key: 'pendientes', label: 'Recordatorios pendientes', icon: BellRing },
  { key: 'enviados_hoy', label: 'Enviados hoy', icon: CheckCircle2 },
  { key: 'leads_nuevos', label: 'Leads nuevos', icon: UserPlus },
  { key: 'mensajes_hoy', label: 'Mensajes hoy', icon: MessageSquare },
  { key: 'por_vencer', label: 'Suscripciones por vencer', icon: AlertTriangle },
];

export default async function DashboardPage() {
  let stats = {};
  let mensajes = [];
  let error = null;

  try {
    [stats, mensajes] = await Promise.all([getStats(), getUltimosMensajes()]);
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del bot.</p>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            No se pudieron cargar las estadísticas: {error}. ¿Está creada la base
            de datos con <code>db/schema.sql</code>?
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TARJETAS.map(({ key, label, icon: Icon }) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats[key] ?? 0}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mensajes.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin mensajes todavía.</p>
          )}
          {mensajes.map((m) => (
            <div
              key={m.id}
              className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {m.nombre || m.telefono}
                  </span>
                  <Badge variant={m.direccion === 'entrante' ? 'secondary' : 'outline'}>
                    {m.direccion}
                  </Badge>
                  {m.tipo === 'audio' && <Badge variant="warning">🎧 audio</Badge>}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {m.contenido || '—'}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {fmtFecha(m.creado_en)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
