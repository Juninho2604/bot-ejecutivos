import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { PublicShell } from '@/components/public/public-shell';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Pago cancelado · Fabbio Bot' };

export default function PagoCanceladoPage() {
  return (
    <PublicShell>
      <div className="container mx-auto flex max-w-2xl items-center justify-center px-4 py-20">
        <div className="glass-strong w-full rounded-3xl p-10 text-center text-white">
          <XCircle className="mx-auto size-16 text-white/70" />
          <h1 className="mt-4 text-2xl font-bold">Pago no completado</h1>
          <p className="mt-3 text-white/75">
            No se concretó el pago. No te preocupes, no se realizó ningún cargo. Puedes
            intentarlo de nuevo cuando quieras.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              asChild
              className="rounded-full bg-yellow-400 font-semibold text-slate-900 hover:bg-yellow-300"
            >
              <Link href="/#precios">Ver planes</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="glass rounded-full border border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/">Inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
