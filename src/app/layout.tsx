import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#A855F7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://oquevoceestasentindohoje.com.br"),
  title: {
    default: "O Que Você Está Sentindo Hoje?",
    template: "%s · O Que Você Está Sentindo Hoje?",
  },
  description:
    "Uma experiência espiritual guiada por IA. Receba um devocional profundamente personalizado baseado no que você está sentindo agora.",
  keywords: ["devocional", "espiritual", "IA", "fé", "oração", "bíblia", "espiritualidade", "cristão"],
  authors: [{ name: "O Que Você Está Sentindo Hoje?" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "O Que Você Está Sentindo Hoje?",
    description: "Receba um devocional personalizado por IA baseado no que você está sentindo agora.",
    type: "website",
    locale: "pt_BR",
    siteName: "O Que Você Está Sentindo Hoje?",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "O Que Você Está Sentindo Hoje? — Devocional com IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "O Que Você Está Sentindo Hoje?",
    description: "Receba um devocional personalizado por IA baseado no que você está sentindo agora.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sentindo Hoje",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${inter.variable} ${cormorant.variable} ${jakarta.variable} h-full`}>
      <body className="aurora-bg antialiased"><ClientLayout>{children}</ClientLayout></body>
    </html>
  );
}
