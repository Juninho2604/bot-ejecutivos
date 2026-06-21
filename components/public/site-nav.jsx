import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">🤖</span>
          <span>Bot Ejecutivos</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="#caracteristicas" className="hover:text-foreground">Características</a>
          <a href="#precios" className="hover:text-foreground">Precios</a>
          <a href="#faq" className="hover:text-foreground">Preguntas</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Ingresar</Link>
          </Button>
          <Button asChild size="sm">
            <a href="#precios">Comenzar</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
