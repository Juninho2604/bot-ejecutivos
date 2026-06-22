import { Button } from '@/components/ui/button';
import {
  completarRecordatorio,
  cancelarRecordatorio,
  reabrirRecordatorio,
} from '@/app/admin/actions';

/**
 * Acciones contextuales para un recordatorio. Usa <form> con server actions
 * (funciona sin JS de cliente).
 */
export function RecordatorioAcciones({ id, estado }) {
  if (estado === 'pendiente') {
    return (
      <div className="flex gap-2">
        <form action={completarRecordatorio}>
          <input type="hidden" name="id" value={id} />
          <Button size="sm" variant="outline" type="submit">
            Completar
          </Button>
        </form>
        <form action={cancelarRecordatorio}>
          <input type="hidden" name="id" value={id} />
          <Button size="sm" variant="ghost" type="submit">
            Cancelar
          </Button>
        </form>
      </div>
    );
  }

  if (['completado', 'cancelado', 'error'].includes(estado)) {
    return (
      <form action={reabrirRecordatorio}>
        <input type="hidden" name="id" value={id} />
        <Button size="sm" variant="ghost" type="submit">
          Reabrir
        </Button>
      </form>
    );
  }

  return null;
}
