import type { MetadataRoute } from "next";
import { VERSE_THEMES } from "@/lib/seo/verse-themes";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://humanah.app";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const fixed: MetadataRoute.Sitemap = [
        { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
        { url: `${BASE}/embaixadores`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: `${BASE}/versiculos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        { url: `${BASE}/privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
        { url: `${BASE}/termos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ];

    const themes: MetadataRoute.Sitemap = VERSE_THEMES.map((t) => ({
        url: `${BASE}/versiculos/${t.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
    }));

    return [...fixed, ...themes];
}
