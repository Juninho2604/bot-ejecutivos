import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { query } from '@/lib/db';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fmtFecha, fmtSoloFecha } from '@/lib/format';

export const dynamic = 'force-dynamic';

async function getClientes() {
  const { rows } = await query(`
    SELECT
      c.id, c.telefono, c.nombre, c.plan, c.suscripcion_vence, c.ultimo_contacto,
      (SELECT COUNT(*) FROM recordatorios r
        WHERE r.cliente_id = c.id AND r.estado = 'pendiente') AS pendientes
    FROM clientes c
    ORDER BY c.ultimo_contacto DESC NULLS LAST
    LIMIT 200
  `);
  return rows;
}

export default async function ClientesPage() {
  let clientes = [];
  let error = null;
  try {
    clientes = await getClientes();
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          {clientes.length} cliente(s) registrados.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Error: {error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Pendientes</TableHead>
                  <TableHead>Suscripción</TableHead>
                  <TableHead>Último contacto</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Sin clientes todavía.
                    </TableCell>
                  </TableRow>
                )}
                {clientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nombre || '—'}</TableCell>
                    <TableCell>{c.telefono}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.plan || 'free'}</Badge>
                    </TableCell>
                    <TableCell>
                      {Number(c.pendientes) > 0 ? (
                        <Badge>{c.pendientes}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>{fmtSoloFecha(c.suscripcion_vence)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {fmtFecha(c.ultimo_contacto)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/clientes/${c.id}`}
                        className="inline-flex items-center text-sm text-primary hover:underline"
                      >
                        Ver <ChevronRight className="size-4" />
                      </Link>
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
