/**
 * Catálogo de planes del producto. Precios en USD (VenePagos soporta USD/VES).
 * Ajusta precios, features y duración según tu oferta comercial.
 */
export const PLANES = [
  {
    slug: 'basico',
    nombre: 'Básico',
    precio: 5,
    moneda: 'USD',
    periodo: 'mes',
    dias: 30,
    destacado: false,
    descripcion: 'Para empezar a no olvidar nada.',
    features: [
      'Recordatorios ilimitados por texto',
      'Notas de voz transcritas',
      'Listas (compras, tareas)',
      'Soporte por WhatsApp',
    ],
  },
  {
    slug: 'pro',
    nombre: 'Pro',
    precio: 12,
    moneda: 'USD',
    periodo: 'mes',
    dias: 30,
    destacado: true,
    descripcion: 'El favorito de los ejecutivos ocupados.',
    features: [
      'Todo lo del plan Básico',
      'Recordatorios recurrentes',
      'Recordatorios proactivos por plantilla',
      'Prioridad en el procesamiento',
      'Soporte prioritario',
    ],
  },
  {
    slug: 'empresarial',
    nombre: 'Empresarial',
    precio: 29,
    moneda: 'USD',
    periodo: 'mes',
    dias: 30,
    destacado: false,
    descripcion: 'Para equipos y asistentes ejecutivos.',
    features: [
      'Todo lo del plan Pro',
      'Hasta 5 números',
      'Reportes de actividad',
      'Onboarding asistido',
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
