import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FabbioRobot } from '@/components/public/fabbio-robot';

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="container mx-auto max-w-6xl">
        <div className="glass-strong flex h-14 items-center justify-between rounded-full px-3 pl-5 text-white shadow-lg">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FabbioRobot size={30} animated={false} />
            <span className="text-lg">
              Fabbio <span className="text-yellow-300">Bot</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/80 md:flex">
            <a href="#caracteristicas" className="transition-colors hover:text-white">
              Características
            </a>
            <a href="#precios" className="transition-colors hover:text-white">
              Precios
            </a>
            <a href="#faq" className="transition-colors hover:text-white">
              Preguntas
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="rounded-full bg-yellow-400 font-semibold text-slate-900 hover:bg-yellow-300"
            >
              <a href="#precios">Comenzar</a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
