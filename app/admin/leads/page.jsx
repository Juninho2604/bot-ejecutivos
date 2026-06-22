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
import { LeadAcciones } from '@/components/admin/lead-acciones';
import { fmtFecha } from '@/lib/format';

export const dynamic = 'force-dynamic';

const ESTADO_VARIANT = {
  nuevo: 'default',
  contactado: 'secondary',
  convertido: 'success',
  descartado: 'outline',
};

async function getLeads() {
  const { rows } = await query(`
    SELECT id, nombre, email, telefono, plan, origen, estado, creado_en
      FROM leads
     ORDER BY creado_en DESC
     LIMIT 200
  `);
  return rows;
}

export default async function LeadsPage() {
  let leads = [];
  let error = null;
  try {
    leads = await getLeads();
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Prospectos captados desde la web pública. {leads.length} lead(s).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prospectos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Error: {error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Sin leads todavía.
                    </TableCell>
                  </TableRow>
                )}
                {leads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.nombre || '—'}</TableCell>
                    <TableCell>{l.email || '—'}</TableCell>
                    <TableCell>{l.telefono || '—'}</TableCell>
                    <TableCell>{l.plan || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{l.origen}</TableCell>
                    <TableCell>
                      <Badge variant={ESTADO_VARIANT[l.estado] || 'outline'}>
                        {l.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {fmtFecha(l.creado_en)}
                    </TableCell>
                    <TableCell>
                      <LeadAcciones id={l.id} estado={l.estado} />
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
