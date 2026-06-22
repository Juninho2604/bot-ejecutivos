import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

/**
 * Configuración de NextAuth (v4) con credenciales contra la tabla `admins`.
 * Sesiones por JWT para poder protegerlas desde el middleware (edge).
 * @type {import('next-auth').NextAuthOptions}
 */
export const authOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 }, // 8 horas
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password || '';
        if (!email || !password) return null;

        try {
          const { rows } = await query(
            `SELECT id, email, nombre, password_hash, rol, activo
               FROM admins
              WHERE email = $1
              LIMIT 1`,
            [email]
          );

          const admin = rows[0];
          if (!admin || !admin.activo) return null;

          const ok = await bcrypt.compare(password, admin.password_hash);
          if (!ok) return null;

          // Registramos el último login (no bloqueante si falla).
          query(`UPDATE admins SET ultimo_login = NOW() WHERE id = $1`, [
            admin.id,
          ]).catch((e) => console.error('[auth] no se pudo actualizar login:', e.message));

          return {
            id: String(admin.id),
            email: admin.email,
            name: admin.nombre || admin.email,
            rol: admin.rol,
          };
        } catch (err) {
          console.error('[auth] authorize error:', err.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol = user.rol;
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.rol = token.rol;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
