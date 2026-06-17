import type { Metadata } from "next";
import Link from "next/link";
import { VERSE_THEMES } from "@/lib/seo/verse-themes";
import { Icon, BrandMark } from "@/components/icons";

export const metadata: Metadata = {
    title: "Versículos para cada momento — Ansiedade, Medo, Gratidão | Sentindo Hoje",
    description:
        "Versículos bíblicos selecionados por tema: ansiedade, medo, tristeza, gratidão, perdão e propósito. Encontre uma palavra de Deus para o que você sente hoje.",
    alternates: { canonical: "/versiculos" },
    openGraph: {
        title: "Versículos para cada momento | Sentindo Hoje",
        description: "Uma palavra de Deus para o que você está sentindo hoje.",
        type: "website",
    },
};

export default function VersiculosIndexPage() {
    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden">
            <section className="relative z-10 max-w-2xl mx-auto px-6 pt-16 pb-10 text-center">
                <Link href="/" className="inline-flex flex-col items-center gap-3 mb-8">
                    <BrandMark size={44} />
                </Link>
                <p className="eyebrow mb-3" style={{ color: "var(--text-muted)" }}>
                    <span className="gold-rule" /> a palavra certa para a hora certa
                </p>
                <h1 className="font-display mb-4" style={{ color: "var(--cream)", fontSize: "clamp(2rem, 7vw, 2.8rem)", fontWeight: 400 }}>
                    Versículos para cada momento
                </h1>
                <p className="text-base mb-2" style={{ color: "var(--text-secondary)" }}>
                    Escolha o que você está sentindo e encontre versículos que falam diretamente ao seu coração.
                </p>
            </section>

            <section className="relative z-10 max-w-2xl mx-auto px-6 pb-16">
                <div className="grid sm:grid-cols-2 gap-4">
                    {VERSE_THEMES.map((t) => (
                        <Link key={t.slug} href={`/versiculos/${t.slug}`} className="card-base card-hover p-5 block">
                            <h2 className="font-display text-lg mb-1" style={{ color: "var(--cream)" }}>{t.h1}</h2>
                            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>{t.intro.slice(0, 110)}…</p>
                            <span className="text-xs inline-flex items-center gap-1" style={{ color: "var(--gold)" }}>
                                Ver versículos <Icon name="arrow-right" size={13} />
                            </span>
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="surface-wood rounded-3xl p-8 text-center mt-10">
                    <h2 className="font-display text-2xl mb-3" style={{ color: "var(--cream)" }}>
                        E quando você não souber qual versículo buscar?
                    </h2>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                        Diga o que está sentindo e a nossa IA cria um devocional completo — versículo, reflexão e oração — só para o seu momento.
                    </p>
                    <Link href="/signup" className="btn-primary">Receber meu devocional gratuito</Link>
                </div>
            </section>
        </main>
    );
}
