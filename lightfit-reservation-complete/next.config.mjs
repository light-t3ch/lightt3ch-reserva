
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false }
};
export default nextConfig;
