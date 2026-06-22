import Link from 'next/link';
import { FabbioRobot } from '@/components/public/fabbio-robot';

export function SiteFooter() {
  return (
    <footer className="relative mt-10 border-t border-white/15">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-white/70 md:flex-row">
        <div className="flex items-center gap-2">
          <FabbioRobot size={26} animated={false} />
          <span>© {new Date().getFullYear()} Fabbio Bot</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#precios" className="hover:text-white">
            Precios
          </a>
          <Link href="/login" className="hover:text-white">
            Acceso interno
          </Link>
          <span>Pagos por VenePagos</span>
        </div>
      </div>
    </footer>
  );
}
