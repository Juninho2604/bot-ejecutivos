/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pg y form-data deben tratarse como paquetes externos en el server.
  serverExternalPackages: ['pg'],
};

export default nextConfig;
