import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { SiteNav } from '@/components/public/site-nav';
import { SiteFooter } from '@/components/public/site-footer';
import { CheckoutForm } from '@/components/public/checkout-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlan } from '@/lib/planes';

export function generateMetadata({ params }) {
  const plan = getPlan(params.plan);
  return { title: plan ? `Contratar ${plan.nombre} · Bot Ejecutivos` : 'Checkout' };
}

export default function CheckoutPage({ params }) {
  const plan = getPlan(params.plan);
  if (!plan) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="container mx-auto max-w-5xl flex-1 px-4 py-12">
        <Link
          href="/#precios"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver a planes
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Resumen del plan */}
          <Card>
            <CardHeader>
              <CardTitle>Plan {plan.nombre}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.descripcion}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.precio}</span>
                <span className="text-muted-foreground">
                  {' '}
                  {plan.moneda} /{plan.periodo}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle>Tus datos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Completa para activar tu bot tras el pago.
              </p>
            </CardHeader>
            <CardContent>
              <CheckoutForm plan={plan.slug} />
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
