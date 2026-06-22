import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { PublicShell } from '@/components/public/public-shell';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Pago confirmado · Fabbio Bot' };

export default function PagoExitoPage() {
  return (
    <PublicShell>
      <div className="container mx-auto flex max-w-2xl items-center justify-center px-4 py-20">
        <div className="glass-strong w-full rounded-3xl p-10 text-center text-white">
          <CheckCircle2 className="mx-auto size-16 text-yellow-300" />
          <h1 className="mt-4 text-2xl font-bold">Gracias por tu compra</h1>
          <p className="mt-3 text-white/75">
            Estamos confirmando tu pago. En cuanto se acredite, recibirás un mensaje de
            bienvenida en tu WhatsApp y Fabbio quedará activo.
          </p>
          <p className="mt-2 text-sm text-white/60">
            Si ya tenías el bot, tu suscripción se extenderá automáticamente.
          </p>
          <Button
            asChild
            className="mt-6 rounded-full bg-yellow-400 font-semibold text-slate-900 hover:bg-yellow-300"
          >
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </PublicShell>
  );
}
