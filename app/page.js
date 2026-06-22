import Link from 'next/link';
import {
  MessageSquare,
  Mic,
  CalendarClock,
  Repeat,
  ListChecks,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { PublicShell } from '@/components/public/public-shell';
import { FabbioRobot } from '@/components/public/fabbio-robot';
import { Button } from '@/components/ui/button';
import { PLANES } from '@/lib/planes';

const CARACTERISTICAS = [
  {
    icon: MessageSquare,
    titulo: 'Háblale como a un asistente',
    texto: 'Escribe natural por WhatsApp: "recuérdame llamar al contador mañana a las 10".',
  },
  {
    icon: Mic,
    titulo: 'Notas de voz',
    texto: 'Envía un audio y Fabbio lo transcribe y entiende automáticamente.',
  },
  {
    icon: CalendarClock,
    titulo: 'Recordatorios puntuales',
    texto: 'Te avisa justo a tiempo, en tu hora de Caracas.',
  },
  {
    icon: Repeat,
    titulo: 'Recurrentes',
    texto: 'Diarios, semanales o mensuales sin que tengas que repetirlo.',
  },
  {
    icon: ListChecks,
    titulo: 'Listas',
    texto: 'Compras, pendientes o lo que necesites, siempre a la mano.',
  },
  {
    icon: ShieldCheck,
    titulo: 'Seguro y confiable',
    texto: 'Tus datos protegidos y pagos procesados por VenePagos.',
  },
];

const FAQ = [
  {
    q: '¿Necesito instalar una app?',
    a: 'No. Todo funciona dentro de WhatsApp, el chat que ya usas todos los días.',
  },
  {
    q: '¿Cómo pago?',
    a: 'Eliges tu plan y pagas de forma segura con VenePagos (transferencia, pago móvil o tarjeta).',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Tu suscripción es mensual y puedes no renovarla cuando desees.',
  },
];

export default function LandingPage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="px-4 pt-16 pb-24 sm:pt-20">
        <div className="container mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="text-white">
            <span className="glass inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white/90">
              Tu asistente ejecutivo en WhatsApp
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Nunca más olvides
              <br />
              algo importante
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              <span className="font-semibold text-yellow-300">Fabbio Bot</span> gestiona tus
              recordatorios, listas y pendientes directo en WhatsApp. Escríbele o envíale una
              nota de voz y él se encarga.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-yellow-400 font-semibold text-slate-900 hover:bg-yellow-300"
              >
                <a href="#precios">Ver planes</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="glass rounded-full border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                <a href="#caracteristicas">Cómo funciona</a>
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="glass-strong rounded-[2.5rem] p-8 shadow-2xl sm:p-12">
              <FabbioRobot size={240} />
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="caracteristicas" className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas
            </h2>
            <p className="mt-3 text-white/70">Simple por fuera, potente por dentro.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CARACTERISTICAS.map(({ icon: Icon, titulo, texto }) => (
              <div key={titulo} className="glass rounded-2xl p-6 text-white">
                <div className="flex size-11 items-center justify-center rounded-xl bg-yellow-400/20 text-yellow-300">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{titulo}</h3>
                <p className="mt-2 text-sm text-white/70">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Planes simples</h2>
            <p className="mt-3 text-white/70">Sin contratos. Cancela cuando quieras.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 items-start gap-6 md:grid-cols-3">
            {PLANES.map((plan) => (
              <div
                key={plan.slug}
                className={`relative rounded-3xl p-7 text-white ${
                  plan.destacado
                    ? 'glass-strong ring-2 ring-yellow-400 shadow-2xl md:-mt-4 md:pb-10'
                    : 'glass'
                }`}
              >
                {plan.destacado && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-slate-900">
                    Más popular
                  </span>
                )}
                <h3 className="text-xl font-semibold">{plan.nombre}</h3>
                <p className="mt-1 text-sm text-white/70">{plan.descripcion}</p>
                <div className="mt-5">
                  <span className="text-5xl font-bold">${plan.precio}</span>
                  <span className="text-white/70"> {plan.moneda}/{plan.periodo}</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-yellow-300" />
                      <span className="text-white/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`mt-7 w-full rounded-full font-semibold ${
                    plan.destacado
                      ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300'
                      : 'glass border border-white/30 text-white hover:bg-white/20 hover:text-white'
                  }`}
                  variant={plan.destacado ? 'default' : 'ghost'}
                >
                  <Link href={`/checkout/${plan.slug}`}>Elegir {plan.nombre}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-20">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <div className="glass mt-10 divide-y divide-white/15 rounded-3xl p-2">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="p-5 text-white">
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-2 text-sm text-white/70">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
