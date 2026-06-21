import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span>© {new Date().getFullYear()} Bot Ejecutivos</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#precios" className="hover:text-foreground">Precios</a>
          <Link href="/login" className="hover:text-foreground">Acceso interno</Link>
          <span>Pagos por VenePagos</span>
        </div>
      </div>
    </footer>
  );
}
