export { default } from 'next-auth/middleware';

// Protege todas las rutas del panel interno. NextAuth redirige a /login
// cuando no hay sesión válida (JWT). El propio /login queda fuera del matcher.
export const config = {
  matcher: ['/admin/:path*'],
};
