import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { SiteNav } from '@/components/public/site-nav';
import { SiteFooter } from '@/components/public/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Pago confirmado · Bot Ejecutivos' };

export default function PagoExitoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="container mx-auto flex max-w-2xl flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full text-center">
          <CardContent className="space-y-4 p-10">
            <CheckCircle2 className="mx-auto size-16 text-primary" />
            <h1 className="text-2xl font-bold">¡Gracias por tu compra!</h1>
            <p className="text-muted-foreground">
              Estamos confirmando tu pago. En cuanto se acredite, recibirás un
              mensaje de bienvenida en tu WhatsApp y tu bot quedará activo.
            </p>
            <p className="text-sm text-muted-foreground">
              Si ya tenías el bot, tu suscripción se extenderá automáticamente.
            </p>
            <Button asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
