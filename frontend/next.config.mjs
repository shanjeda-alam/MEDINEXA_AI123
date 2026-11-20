import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: projectRoot,
  async redirects() {
    return [
      { source: '/auth/login', destination: '/login', permanent: false },
      { source: '/auth/register', destination: '/register', permanent: false },
      { source: '/hospitals', destination: '/care-radar', permanent: false },
      { source: '/telehealth', destination: '/chatbot', permanent: false },
      { source: '/dashboard/user', destination: '/dashboard', permanent: false },
      { source: '/dashboard/user/assessment', destination: '/injury-studio', permanent: false },
      { source: '/dashboard/user/telehealth', destination: '/chatbot', permanent: false },
      { source: '/dashboard/doctor/appointments', destination: '/dashboard/doctor', permanent: false },
      { source: '/dashboard/doctor/availability', destination: '/dashboard/doctor', permanent: false },
      { source: '/dashboard/doctor/profile', destination: '/dashboard/user/profile', permanent: false },
      { source: '/dashboard/admin', destination: '/admin', permanent: false },
      { source: '/dashboard/admin/:path*', destination: '/admin', permanent: false },
    ];
  },
};

export default nextConfig;
