import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://humanah.app";

/**
 * Só o conteúdo público é rastreável. Telas do app (exigem login), rotas de
 * atribuição de embaixador (/e/<slug>, que gravam clique e redirecionam) e a
 * API ficam fora do índice.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/e/",
                "/admin",
                "/dashboard",
                "/devotional",
                "/emotion",
                "/journal",
                "/journey",
                "/profile",
                "/onboarding",
                "/subscription",
                "/login",
                "/signup",
                "/forgot-password",
                "/reset-password",
            ],
        },
        sitemap: `${BASE}/sitemap.xml`,
    };
}
