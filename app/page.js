import Link from 'next/link';
import {
  MessageSquare,
  Mic,
  CalendarClock,
  ListChecks,
  Repeat,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { SiteNav } from '@/components/public/site-nav';
import { SiteFooter } from '@/components/public/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PLANES } from '@/lib/planes';

const CARACTERISTICAS = [
  {
    icon: MessageSquare,
    titulo: 'Escríbele como a un asistente',
    texto: 'Habla natural por WhatsApp: "recuérdame llamar al contador mañana a las 10".',
  },
  {
    icon: Mic,
    titulo: 'Notas de voz',
    texto: 'Manda un audio y lo transcribimos y entendemos automáticamente.',
  },
  {
    icon: CalendarClock,
    titulo: 'Recordatorios puntuales',
    texto: 'Te avisamos justo a tiempo, en tu hora de Caracas.',
  },
  {
    icon: Repeat,
    titulo: 'Recurrentes',
    texto: 'Diarios, semanales o mensuales sin que tengas que repetirlo.',
  },
  {
    icon: ListChecks,
    titulo: 'Listas',
    texto: 'Compras, pendientes o lo que necesites, siempre a mano.',
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
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl px-4 py-24 text-center">
          <Badge variant="secondary" className="mb-4">Tu asistente en WhatsApp</Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Nunca más olvides algo importante
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Recordatorios, listas y pendientes para ejecutivos ocupados, directo
            en tu WhatsApp. Escribe o manda un audio y nosotros nos encargamos.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <a href="#precios">Ver planes</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#caracteristicas">Cómo funciona</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="caracteristicas" className="container mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Todo lo que necesitas</h2>
          <p className="mt-3 text-muted-foreground">
            Simple por fuera, potente por dentro.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARACTERISTICAS.map(({ icon: Icon, titulo, texto }) => (
            <Card key={titulo}>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="mt-2 text-lg">{titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{texto}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="border-y bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Planes simples</h2>
            <p className="mt-3 text-muted-foreground">
              Sin contratos. Cancela cuando quieras.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PLANES.map((plan) => (
              <Card
                key={plan.slug}
                className={
                  plan.destacado
                    ? 'relative border-primary shadow-md ring-1 ring-primary'
                    : 'relative'
                }
              >
                {plan.destacado && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Más popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.nombre}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.descripcion}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.precio}</span>
                    <span className="text-muted-foreground">/{plan.periodo}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full"
                    variant={plan.destacado ? 'default' : 'outline'}
                  >
                    <Link href={`/checkout/${plan.slug}`}>Elegir {plan.nombre}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto max-w-3xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight">Preguntas frecuentes</h2>
        <div className="mt-10 space-y-6">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="border-b pb-6 last:border-0">
              <h3 className="font-semibold">{q}</h3>
              <p className="mt-2 text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
