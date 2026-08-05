import type { NextConfig } from "next";

// Content-Security-Policy pragmática para Next.js App Router.
// - script/style com 'unsafe-inline' porque o Next injeta scripts de hidratação
//   e o Tailwind/framer-motion usam estilos inline (uma CSP estrita com nonce
//   fica para uma fase posterior). 'unsafe-eval' evita quebras de libs em prod.
// - As demais diretivas fecham vetores: frame-ancestors (anti-clickjacking),
//   object-src, base-uri, e limitam de onde imagens/conexões podem vir.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-src 'self' https://*.stripe.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.stripe.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Força HTTPS por 1 ano (Vercel já serve HTTPS). 'preload' pode ser
  // adicionado depois — é um compromisso mais difícil de reverter.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Anti-clickjacking (reforça o frame-ancestors da CSP).
  { key: "X-Frame-Options", value: "DENY" },
  // Impede o navegador de "adivinhar" o content-type (evita alguns XSS).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Não vaza a URL completa como referer para outros sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desliga APIs sensíveis do navegador que o app não usa.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  images: {
    // Fotos de perfil vivem no Supabase Storage (bucket público "avatars").
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
