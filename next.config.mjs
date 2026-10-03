/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "three", "framer-motion"],
  },

  turbopack: {},

  serverExternalPackages: [
    "mongoose",
    "multer",
    "socket.io",
    "nodemailer",
    "bcryptjs",
    "jsonwebtoken",
    "winston",
    "swagger-jsdoc",
    "swagger-ui-dist",
  ],

  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },

  env: {
    NEXT_PUBLIC_APP_NAME: "LMS Pro",
    NEXT_PUBLIC_APP_VERSION: "3.0.0",
  },
};

export default nextConfig;
