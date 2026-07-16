import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Humanáh — Seu alimento espiritual diário",
    short_name: "Humanáh",
    description:
      "Diga o que está sentindo e receba o seu alimento espiritual diário: um devocional feito para o seu momento, fundamentado na Palavra.",
    start_url: "/",
    id: "/",
    display: "standalone",
    background_color: "#0B0B12",
    theme_color: "#0B0B12",
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
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
