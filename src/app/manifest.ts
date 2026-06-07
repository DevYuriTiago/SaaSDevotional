import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "O Que Você Está Sentindo Hoje?",
    short_name: "Sentindo Hoje",
    description:
      "Devocional personalizado por IA baseado no que você está sentindo agora.",
    start_url: "/",
    display: "standalone",
    background_color: "#060816",
    theme_color: "#A855F7",
    orientation: "portrait",
    categories: ["lifestyle", "health"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
