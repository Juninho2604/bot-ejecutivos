import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { TZ_CARACAS } from '@/lib/prompt';

/**
 * Formatea una fecha/hora a texto legible en zona horaria de Caracas.
 * @param {Date|string|null} fecha
 * @param {string} [patron]
 * @returns {string}
 */
export function fmtFecha(fecha, patron = "d MMM yyyy, h:mm a") {
  if (!fecha) return '—';
  try {
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    return formatInTimeZone(d, TZ_CARACAS, patron, { locale: es });
  } catch {
    return String(fecha);
  }
}

/**
 * Formatea solo la fecha (sin hora).
 * @param {Date|string|null} fecha
 * @returns {string}
 */
export function fmtSoloFecha(fecha) {
  return fmtFecha(fecha, 'd MMM yyyy');
}
