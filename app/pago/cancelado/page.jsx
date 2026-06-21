import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { SiteNav } from '@/components/public/site-nav';
import { SiteFooter } from '@/components/public/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Pago cancelado · Bot Ejecutivos' };

export default function PagoCanceladoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="container mx-auto flex max-w-2xl flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full text-center">
          <CardContent className="space-y-4 p-10">
            <XCircle className="mx-auto size-16 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Pago no completado</h1>
            <p className="text-muted-foreground">
              No se concretó el pago. No te preocupes, no se realizó ningún cargo.
              Puedes intentarlo de nuevo cuando quieras.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button asChild>
                <Link href="/#precios">Ver planes</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Inicio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
