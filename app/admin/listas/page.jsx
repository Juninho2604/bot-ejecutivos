import Link from 'next/link';
import { query } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fmtFecha } from '@/lib/format';

export const dynamic = 'force-dynamic';

async function getListas() {
  const { rows } = await query(`
    SELECT l.id, l.nombre, l.items, l.creado_en,
           c.id AS cliente_id, c.nombre AS cliente_nombre, c.telefono
      FROM listas l
      JOIN clientes c ON c.id = l.cliente_id
     ORDER BY l.creado_en DESC
     LIMIT 200
  `);
  return rows;
}

export default async function ListasPage() {
  let listas = [];
  let error = null;
  try {
    listas = await getListas();
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Listas</h1>
        <p className="text-muted-foreground">{listas.length} lista(s).</p>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">Error: {error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {listas.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">Sin listas todavía.</p>
        )}
        {listas.map((l) => {
          const items = Array.isArray(l.items) ? l.items : [];
          return (
            <Card key={l.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{l.nombre}</CardTitle>
                <Badge variant="outline">{items.length} ítems</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="ml-4 list-disc text-sm text-muted-foreground">
                  {items.slice(0, 8).map((it, i) => (
                    <li key={i}>{String(it)}</li>
                  ))}
                  {items.length > 8 && <li>… y {items.length - 8} más</li>}
                </ul>
                <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                  <Link
                    href={`/admin/clientes/${l.cliente_id}`}
                    className="text-primary hover:underline"
                  >
                    {l.cliente_nombre || l.telefono}
                  </Link>
                  <span>{fmtFecha(l.creado_en)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
