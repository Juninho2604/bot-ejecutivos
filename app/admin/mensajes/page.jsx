import Link from 'next/link';
import { query } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fmtFecha } from '@/lib/format';

export const dynamic = 'force-dynamic';

async function getMensajes() {
  const { rows } = await query(`
    SELECT m.id, m.direccion, m.tipo, m.contenido, m.intent_json, m.creado_en,
           c.id AS cliente_id, c.nombre, c.telefono
      FROM mensajes m
      JOIN clientes c ON c.id = m.cliente_id
     ORDER BY m.creado_en DESC
     LIMIT 200
  `);
  return rows;
}

export default async function MensajesPage() {
  let data = [];
  let error = null;
  try {
    data = await getMensajes();
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mensajes</h1>
        <p className="text-muted-foreground">Últimos {data.length} mensajes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bitácora</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Error: {error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Dir.</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contenido</TableHead>
                  <TableHead>Intent</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Sin mensajes.
                    </TableCell>
                  </TableRow>
                )}
                {data.map((m) => {
                  const intent = m.intent_json?.intent;
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <Link
                          href={`/admin/clientes/${m.cliente_id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {m.nombre || m.telefono}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.direccion === 'entrante' ? 'secondary' : 'outline'}>
                          {m.direccion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {m.tipo === 'audio' ? '🎧 audio' : m.tipo}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {m.contenido || '—'}
                      </TableCell>
                      <TableCell>
                        {intent ? <Badge variant="outline">{intent}</Badge> : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtFecha(m.creado_en)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
