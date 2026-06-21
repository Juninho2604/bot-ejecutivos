/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // pg debe tratarse como paquete externo en los server components.
    serverComponentsExternalPackages: ['pg', 'bcryptjs'],
  },
};

export default nextConfig;
