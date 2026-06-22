/**
 * Catálogo de planes de Fabbio Bot. Precios en USD (VenePagos soporta USD/VES).
 *
 * Las características están definidas en función de la competencia directa
 * (asistentes de recordatorios por WhatsApp como Memorae, y asistentes
 * personales con IA como Martin): se diferencia por capacidad de IA,
 * integraciones, recordatorios proactivos, número de líneas, automatizaciones
 * y nivel de soporte.
 */
export const PLANES = [
  {
    slug: 'basico',
    nombre: 'Esencial',
    precio: 7,
    moneda: 'USD',
    periodo: 'mes',
    dias: 30,
    destacado: false,
    descripcion: 'Para no olvidar nunca lo importante.',
    features: [
      'Recordatorios ilimitados por texto',
      'Notas de voz transcritas con IA',
      'Listas (compras, tareas, pendientes)',
      'Recordatorios recurrentes (diario, semanal, mensual)',
      'Hora local de Caracas',
      'Soporte por WhatsApp',
    ],
  },
  {
    slug: 'pro',
    nombre: 'Profesional',
    precio: 17,
    moneda: 'USD',
    periodo: 'mes',
    dias: 30,
    destacado: true,
    descripcion: 'El favorito de los ejecutivos ocupados.',
    features: [
      'Todo lo del plan Esencial',
      'Recordatorios proactivos por plantilla',
      'Integración con Google Calendar',
      'IA avanzada para lenguaje natural',
      'Resumen diario de tu agenda',
      'Prioridad en el procesamiento',
      'Soporte prioritario',
    ],
  },
  {
    slug: 'empresarial',
    nombre: 'Ejecutivo',
    precio: 27,
    moneda: 'USD',
    periodo: 'mes',
    dias: 30,
    destacado: false,
    descripcion: 'Para gerentes y sus asistentes.',
    features: [
      'Todo lo del plan Profesional',
      'Hasta 3 números (tú y tu asistente)',
      'Automatizaciones personalizadas (n8n)',
      'Memoria de largo plazo y preferencias',
      'Reportes de productividad',
      'Onboarding asistido 1 a 1',
      'Soporte dedicado',
    ],
  },
];

/**
 * Busca un plan por su slug.
 * @param {string} slug
 * @returns {object|undefined}
 */
export function getPlan(slug) {
  return PLANES.find((p) => p.slug === slug);
}
