import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { PublicShell } from '@/components/public/public-shell';
import { CheckoutForm } from '@/components/public/checkout-form';
import { getPlan } from '@/lib/planes';

export function generateMetadata({ params }) {
  const plan = getPlan(params.plan);
  return { title: plan ? `Contratar ${plan.nombre} · Fabbio Bot` : 'Checkout · Fabbio Bot' };
}

export default function CheckoutPage({ params }) {
  const plan = getPlan(params.plan);
  if (!plan) notFound();

  return (
    <PublicShell>
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <Link
          href="/#precios"
          className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeft className="size-4" /> Volver a planes
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Resumen del plan */}
          <div className="glass rounded-3xl p-7 text-white">
            <h2 className="text-xl font-semibold">Plan {plan.nombre}</h2>
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
          </div>

          {/* Formulario */}
          <div className="glass-strong rounded-3xl p-7 text-white">
            <h2 className="text-xl font-semibold">Tus datos</h2>
            <p className="mt-1 text-sm text-white/70">
              Completa para activar tu bot tras el pago.
            </p>
            <div className="mt-6">
              <CheckoutForm plan={plan.slug} />
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
