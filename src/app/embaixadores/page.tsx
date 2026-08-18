import type { Metadata } from "next";
import EmbaixadoresClient from "./EmbaixadoresClient";
import { FAQS } from "./content";
import { appUrl } from "@/lib/app-url";

const TITLE = "Programa de Embaixadores · Humanáh";
const DESCRIPTION =
    "Indique o Humanáh e ganhe comissão recorrente de 5% a 30% por cada assinante que chegar pela sua voz. Sem custo para participar, com curadoria manual.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    keywords: [
        "programa de embaixadores",
        "programa de afiliados cristão",
        "afiliados app cristão",
        "renda para influenciador cristão",
        "divulgar aplicativo devocional",
        "comissão recorrente",
        "Humanáh embaixador",
    ],
    alternates: { canonical: "/embaixadores" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
        type: "website",
        locale: "pt_BR",
        siteName: "Humanáh",
        url: "/embaixadores",
        title: "Seja um Embaixador Humanáh · comissão recorrente de até 30%",
        description: DESCRIPTION,
        images: [{ url: "/Og-midia.png", width: 1536, height: 1024, alt: "Programa de Embaixadores Humanáh" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Seja um Embaixador Humanáh · comissão recorrente de até 30%",
        description: DESCRIPTION,
        images: ["/Og-midia.png"],
    },
};

const BASE = appUrl();

// Dados estruturados: ajudam o Google a entender a página como uma oferta de
// programa da marca e a mapear as perguntas frequentes.
const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebPage",
            "@id": `${BASE}/embaixadores`,
            url: `${BASE}/embaixadores`,
            name: TITLE,
            description: DESCRIPTION,
            inLanguage: "pt-BR",
            isPartOf: { "@type": "WebSite", "@id": `${BASE}/#website`, name: "Humanáh", url: BASE },
            publisher: { "@id": `${BASE}/#organization` },
        },
        {
            "@type": "Organization",
            "@id": `${BASE}/#organization`,
            name: "Humanáh",
            url: BASE,
            logo: `${BASE}/new-icon.png`,
            email: "contato@humanah.app",
            description:
                "Aplicativo cristão de devocionais diários: a Palavra encontra você no momento que está vivendo.",
        },
        {
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
        },
    ],
};

export default function EmbaixadoresPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <EmbaixadoresClient />
        </>
    );
}
