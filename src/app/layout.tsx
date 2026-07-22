import type { Metadata, Viewport } from "next";
import { Fraunces, Cormorant_Garamond, Sora } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

// Voz SAGRADA — serifa de alto contraste para títulos e a pergunta ("Lumina Sacra")
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Voz da ESCRITURA — leitura do devocional, versículos (lê como uma página impressa)
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Voz da ESTRUTURA — toda a UI, botões, navegação, metadados
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0B0B12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://humanah.app"),
  title: {
    default: "Humanáh — Seu alimento espiritual diário",
    template: "%s · Humanáh",
  },
  description:
    "Diga o que está sentindo e receba o seu maná de hoje: um devocional feito para o seu momento — versículo, reflexão e oração, fundamentados na Palavra.",
  keywords: ["Humanáh", "maná", "devocional", "devocional diário", "espiritual", "fé", "oração", "bíblia", "palavra", "cristão"],
  authors: [{ name: "Humanáh" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "Humanáh — Seu alimento espiritual diário",
    description: "A Palavra encontra você no momento que está vivendo. Um devocional feito para hoje, fundamentado na Palavra.",
    type: "website",
    locale: "pt_BR",
    siteName: "Humanáh",
    images: [
      {
        url: "/Og-midia.png",
        width: 1536,
        height: 1024,
        alt: "Humanáh — Seu alimento espiritual diário",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Humanáh — Seu alimento espiritual diário",
    description: "A Palavra encontra você no momento que está vivendo. Seu devocional feito para hoje.",
    images: ["/Og-midia.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Humanáh",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${fraunces.variable} ${cormorant.variable} ${sora.variable} h-full`}>
      <body className="aurora-bg antialiased"><ClientLayout>{children}</ClientLayout></body>
    </html>
  );
}
