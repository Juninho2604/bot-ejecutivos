import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { crearAdmin, alternarAdmin } from '@/app/admin/actions';
import { fmtFecha } from '@/lib/format';

export const dynamic = 'force-dynamic';

async function getAdmins() {
  const { rows } = await query(`
    SELECT id, email, nombre, rol, activo, ultimo_login, creado_en
      FROM admins
     ORDER BY creado_en ASC
  `);
  return rows;
}

export default async function AdminsPage() {
  const session = await getServerSession(authOptions);
  const esSuperadmin = session?.user?.rol === 'superadmin';

  let admins = [];
  let error = null;
  try {
    admins = await getAdmins();
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administradores</h1>
        <p className="text-muted-foreground">
          Cuentas con acceso al panel interno.
        </p>
      </div>

      {esSuperadmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Crear / actualizar administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={crearAdmin}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" name="nombre" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <select
                  id="rol"
                  name="rol"
                  defaultValue="admin"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="admin">admin</option>
                  <option value="superadmin">superadmin</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <Button type="submit">Guardar administrador</Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Si el email ya existe, se actualizan nombre, rol y contraseña.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Solo un <strong>superadmin</strong> puede crear o desactivar
            administradores.
          </CardContent>
        </Card>
      )}

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
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último login</TableHead>
                  {esSuperadmin && <TableHead>Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.email}</TableCell>
                    <TableCell>{a.nombre || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={a.rol === 'superadmin' ? 'default' : 'outline'}>
                        {a.rol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.activo ? 'success' : 'secondary'}>
                        {a.activo ? 'activo' : 'inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {fmtFecha(a.ultimo_login)}
                    </TableCell>
                    {esSuperadmin && (
                      <TableCell>
                        <form action={alternarAdmin}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="activar" value={a.activo ? '0' : '1'} />
                          <Button
                            type="submit"
                            size="sm"
                            variant={a.activo ? 'ghost' : 'outline'}
                            disabled={String(session?.user?.id) === String(a.id) && a.activo}
                          >
                            {a.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                        </form>
                      </TableCell>
                    )}
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
