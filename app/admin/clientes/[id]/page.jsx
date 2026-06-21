import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { query } from '@/lib/db';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fmtFecha, fmtSoloFecha } from '@/lib/format';

export const dynamic = 'force-dynamic';

const ESTADO_VARIANT = {
  pendiente: 'secondary',
  enviado: 'default',
  completado: 'success',
  error: 'destructive',
};

async function getCliente(id) {
  const { rows } = await query(`SELECT * FROM clientes WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function getDatos(id) {
  const [recordatorios, listas, mensajes] = await Promise.all([
    query(
      `SELECT id, tarea, fecha_objetivo, recurrencia, estado
         FROM recordatorios WHERE cliente_id = $1
        ORDER BY fecha_objetivo DESC LIMIT 100`,
      [id]
    ),
    query(
      `SELECT id, nombre, items, creado_en FROM listas
        WHERE cliente_id = $1 ORDER BY creado_en DESC LIMIT 50`,
      [id]
    ),
    query(
      `SELECT id, direccion, tipo, contenido, creado_en FROM mensajes
        WHERE cliente_id = $1 ORDER BY creado_en DESC LIMIT 50`,
      [id]
    ),
  ]);
  return {
    recordatorios: recordatorios.rows,
    listas: listas.rows,
    mensajes: mensajes.rows,
  };
}

export default async function ClienteDetallePage({ params }) {
  const cliente = await getCliente(params.id).catch(() => null);
  if (!cliente) notFound();

  const { recordatorios, listas, mensajes } = await getDatos(params.id);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/clientes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Volver a clientes
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {cliente.nombre || cliente.telefono}
          </h1>
          <p className="text-muted-foreground">{cliente.telefono}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{cliente.plan || 'free'}</Badge>
          {cliente.suscripcion_vence && (
            <Badge variant="secondary">
              Vence {fmtSoloFecha(cliente.suscripcion_vence)}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recordatorios ({recordatorios.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recordatorios.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin recordatorios.</p>
          )}
          {recordatorios.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-4 border-b py-2 last:border-0"
            >
              <div>
                <p className="text-sm font-medium">{r.tarea}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtFecha(r.fecha_objetivo)}
                  {r.recurrencia ? ` · 🔁 ${r.recurrencia}` : ''}
                </p>
              </div>
              <Badge variant={ESTADO_VARIANT[r.estado] || 'outline'}>
                {r.estado}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listas ({listas.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {listas.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin listas.</p>
          )}
          {listas.map((l) => {
            const items = Array.isArray(l.items) ? l.items : [];
            return (
              <div key={l.id} className="border-b pb-3 last:border-0">
                <p className="text-sm font-medium">{l.nombre}</p>
                <ul className="ml-4 list-disc text-sm text-muted-foreground">
                  {items.map((it, i) => (
                    <li key={i}>{String(it)}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensajes ({mensajes.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mensajes.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin mensajes.</p>
          )}
          {mensajes.map((m) => (
            <div
              key={m.id}
              className="flex items-start justify-between gap-4 border-b py-2 last:border-0"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={m.direccion === 'entrante' ? 'secondary' : 'outline'}>
                    {m.direccion}
                  </Badge>
                  {m.tipo === 'audio' && <Badge variant="warning">🎧</Badge>}
                </div>
                <p className="mt-1 text-sm">{m.contenido || '—'}</p>
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
