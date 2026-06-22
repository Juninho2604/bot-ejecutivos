/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Genera un build autónomo (.next/standalone) ideal para Docker / VPS.
  output: 'standalone',
  experimental: {
    // pg debe tratarse como paquete externo en los server components.
    serverComponentsExternalPackages: ['pg', 'bcryptjs'],
  },
};

export default nextConfig;
