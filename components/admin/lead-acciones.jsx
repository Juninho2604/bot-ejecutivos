import { Button } from '@/components/ui/button';
import { cambiarEstadoLead } from '@/app/admin/actions';

const ESTADOS = ['nuevo', 'contactado', 'convertido', 'descartado'];

/** Selector de estado para un lead, con guardado vía server action. */
export function LeadAcciones({ id, estado }) {
  return (
    <form action={cambiarEstadoLead} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="estado"
        defaultValue={estado}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
      >
        {ESTADOS.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
      <Button size="sm" variant="outline" type="submit">
        Guardar
      </Button>
    </form>
  );
}
