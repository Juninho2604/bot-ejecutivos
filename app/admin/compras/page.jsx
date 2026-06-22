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

const ESTADO_VARIANT = {
  pendiente: 'secondary',
  pagado: 'success',
  fallido: 'destructive',
};

async function getCompras() {
  const { rows } = await query(`
    SELECT id, referencia, nombre, email, telefono, plan, monto, moneda,
           estado, venepagos_txn_id, pagado_en, creado_en
      FROM compras
     ORDER BY creado_en DESC
     LIMIT 200
  `);
  return rows;
}

export default async function ComprasPage() {
  let compras = [];
  let error = null;
  try {
    compras = await getCompras();
  } catch (e) {
    error = e.message;
  }

  const ingresos = compras
    .filter((c) => c.estado === 'pagado')
    .reduce((sum, c) => sum + Number(c.monto || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
        <p className="text-muted-foreground">
          {compras.length} orden(es) · Ingresos confirmados: ${ingresos.toFixed(2)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Órdenes (VenePagos)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Error: {error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Creado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compras.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Sin compras todavía.
                    </TableCell>
                  </TableRow>
                )}
                {compras.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.referencia}</TableCell>
                    <TableCell>
                      <div className="font-medium">{c.nombre || c.telefono}</div>
                      <div className="text-xs text-muted-foreground">{c.telefono}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      ${Number(c.monto).toFixed(2)} {c.moneda}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ESTADO_VARIANT[c.estado] || 'outline'}>
                        {c.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {fmtFecha(c.pagado_en)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {fmtFecha(c.creado_en)}
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
