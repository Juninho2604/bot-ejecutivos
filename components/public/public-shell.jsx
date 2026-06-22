import { SiteNav } from '@/components/public/site-nav';
import { SiteFooter } from '@/components/public/site-footer';

/**
 * Envoltura de las páginas públicas: fondo fotográfico (campo de golf) que
 * cubre toda la altura, con un velo en degradado para legibilidad, más nav y
 * footer de vidrio. Base oscura como respaldo si la imagen no carga.
 */
export function PublicShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Fondo: foto de campo de golf (cubre toda la altura del contenido) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/img/golf.jpg')" }}
        aria-hidden
      />
      {/* Velo en degradado para contraste del texto */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-sky-950/50 via-slate-900/70 to-slate-950/90"
        aria-hidden
      />

      <div className="relative z-10">
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
