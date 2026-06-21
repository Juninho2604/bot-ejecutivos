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
import { RecordatorioAcciones } from '@/components/admin/recordatorio-acciones';
import { fmtFecha } from '@/lib/format';

export const dynamic = 'force-dynamic';

const ESTADO_VARIANT = {
  pendiente: 'secondary',
  enviado: 'default',
  completado: 'success',
  error: 'destructive',
};

async function getRecordatorios() {
  const { rows } = await query(`
    SELECT r.id, r.tarea, r.fecha_objetivo, r.recurrencia, r.estado,
           c.id AS cliente_id, c.nombre, c.telefono
      FROM recordatorios r
      JOIN clientes c ON c.id = r.cliente_id
     ORDER BY
       CASE WHEN r.estado = 'pendiente' THEN 0 ELSE 1 END,
       r.fecha_objetivo ASC
     LIMIT 300
  `);
  return rows;
}

export default async function RecordatoriosPage() {
  let data = [];
  let error = null;
  try {
    data = await getRecordatorios();
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recordatorios</h1>
        <p className="text-muted-foreground">{data.length} recordatorio(s).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los recordatorios</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Error: {error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha objetivo</TableHead>
                  <TableHead>Recurrencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Sin recordatorios.
                    </TableCell>
                  </TableRow>
                )}
                {data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.tarea}</TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/clientes/${r.cliente_id}`}
                        className="text-primary hover:underline"
                      >
                        {r.nombre || r.telefono}
                      </Link>
                    </TableCell>
                    <TableCell>{fmtFecha(r.fecha_objetivo)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.recurrencia || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ESTADO_VARIANT[r.estado] || 'outline'}>
                        {r.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <RecordatorioAcciones id={r.id} estado={r.estado} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
