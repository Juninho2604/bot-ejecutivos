/**
 * Control de acceso y capacidades por plan (entitlements) de Fabbio Bot.
 *
 * - Define qué features incluye cada plan.
 * - Calcula el estado de acceso de un cliente (pago activo, prueba gratis,
 *   expirado o nuevo) sin necesidad de columnas extra: la prueba se deriva de
 *   la fecha de creación del cliente.
 */
import { differenceInCalendarDays } from 'date-fns';

// Días de prueba gratuita para clientes nuevos.
export const TRIAL_DIAS = 7;

// Capacidades por plan (slug). numeros = cuántos teléfonos puede asociar.
const CAPS = {
  basico: {
    recurrentes: true,
    proactivos: false,
    calendar: false,
    resumen_diario: false,
    ia_avanzada: false,
    automatizaciones: false,
    memoria: false,
    reportes: false,
    numeros: 1,
  },
  pro: {
    recurrentes: true,
    proactivos: true,
    calendar: true,
    resumen_diario: true,
    ia_avanzada: true,
    automatizaciones: false,
    memoria: false,
    reportes: false,
    numeros: 1,
  },
  empresarial: {
    recurrentes: true,
    proactivos: true,
    calendar: true,
    resumen_diario: true,
    ia_avanzada: true,
    automatizaciones: true,
    memoria: true,
    reportes: true,
    numeros: 3,
  },
};

// Sin acceso: nada habilitado.
const SIN_ACCESO = {
  recurrentes: false,
  proactivos: false,
  calendar: false,
  resumen_diario: false,
  ia_avanzada: false,
  automatizaciones: false,
  memoria: false,
  reportes: false,
  numeros: 0,
};

/**
 * Capacidades de un plan por su slug.
 * @param {string} plan
 * @returns {object}
 */
export function getCaps(plan) {
  return CAPS[plan] || SIN_ACCESO;
}

/**
 * Calcula el estado de acceso de un cliente.
 * @param {object} cliente - Fila de clientes (plan, suscripcion_vence, creado_en).
 * @returns {{activo:boolean, tipo:'pago'|'trial'|'expirado'|'nuevo', plan:string|null, diasRestantes:number, caps:object}}
 */
export function estadoAcceso(cliente) {
  const hoy = new Date();

  // 1) Suscripción de pago vigente.
  if (cliente?.suscripcion_vence) {
    const vence = new Date(cliente.suscripcion_vence);
    const dias = differenceInCalendarDays(vence, hoy);
    if (dias >= 0) {
      const plan = cliente.plan || 'basico';
      return { activo: true, tipo: 'pago', plan, diasRestantes: dias, caps: getCaps(plan) };
    }
    // Tenía plan pero venció.
    return {
      activo: false,
      tipo: 'expirado',
      plan: cliente.plan || null,
      diasRestantes: 0,
      caps: SIN_ACCESO,
    };
  }

  // 2) Prueba gratuita (derivada de la fecha de creación).
  if (cliente?.creado_en) {
    const finTrial = new Date(cliente.creado_en);
    finTrial.setDate(finTrial.getDate() + TRIAL_DIAS);
    const dias = differenceInCalendarDays(finTrial, hoy);
    if (dias >= 0) {
      // Durante la prueba damos la experiencia del plan Profesional.
      return { activo: true, tipo: 'trial', plan: 'pro', diasRestantes: dias, caps: getCaps('pro') };
    }
    return { activo: false, tipo: 'expirado', plan: null, diasRestantes: 0, caps: SIN_ACCESO };
  }

  // 3) Cliente recién creado sin datos: tratar como inicio de prueba.
  return { activo: true, tipo: 'nuevo', plan: 'pro', diasRestantes: TRIAL_DIAS, caps: getCaps('pro') };
}

/**
 * Indica si el cliente tiene una feature concreta habilitada.
 * @param {object} cliente
 * @param {string} feature
 * @returns {boolean}
 */
export function tieneFeature(cliente, feature) {
  return Boolean(estadoAcceso(cliente).caps[feature]);
}

/**
 * Mensaje para invitar a suscribirse cuando el acceso no está activo.
 * @param {{tipo:string}} estado
 * @returns {string}
 */
export function mensajeSuscripcion(estado) {
  const url = `${process.env.APP_URL || ''}/#precios`;
  if (estado.tipo === 'expirado') {
    return (
      'Su acceso a Fabbio finalizó. Para seguir gestionando sus recordatorios, ' +
      `active un plan aquí: ${url}`
    );
  }
  return (
    'Para usar Fabbio necesita un plan activo. Conozca los planes y active el suyo aquí: ' +
    url
  );
}

export default { getCaps, estadoAcceso, tieneFeature, mensajeSuscripcion, TRIAL_DIAS };
