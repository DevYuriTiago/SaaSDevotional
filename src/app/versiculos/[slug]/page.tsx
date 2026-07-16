import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VERSE_THEMES, getVerseTheme } from "@/lib/seo/verse-themes";
import { Icon, BrandMark } from "@/components/icons";

export function generateStaticParams() {
    return VERSE_THEMES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const theme = getVerseTheme(slug);
    if (!theme) return { title: "Versículos | Humanáh" };
    return {
        title: theme.title,
        description: theme.metaDescription,
        alternates: { canonical: `/versiculos/${theme.slug}` },
        openGraph: {
            title: theme.title,
            description: theme.metaDescription,
            type: "article",
        },
    };
}

export default async function VerseThemePage(
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const theme = getVerseTheme(slug);
    if (!theme) notFound();

    // Dados estruturados ajudam o Google a entender a lista de versículos.
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: theme.h1,
        description: theme.metaDescription,
        about: theme.keyword,
    };

    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <section className="relative z-10 max-w-2xl mx-auto px-6 pt-14 pb-8">
                <Link href="/versiculos" className="text-xs mb-6 inline-flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    <Icon name="arrow-left" size={14} /> Todos os temas
                </Link>
                <h1 className="font-display mb-4" style={{ color: "var(--cream)", fontSize: "clamp(1.9rem, 6vw, 2.6rem)", fontWeight: 400 }}>
                    {theme.h1}
                </h1>
                <p className="font-serif-devotional leading-relaxed" style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                    {theme.intro}
                </p>
            </section>

            <section className="relative z-10 max-w-2xl mx-auto px-6 pb-10">
                <div className="space-y-4">
                    {theme.verses.map((v) => (
                        <article key={v.reference} className="card-base p-5 relative overflow-hidden" style={{ borderColor: "rgba(247,201,122,0.2)" }}>
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full" style={{ background: "var(--gradient-gold)" }} />
                            <blockquote className="font-serif-devotional pl-3 mb-2 leading-relaxed" style={{ color: "var(--cream)", fontSize: "1.15rem" }}>
                                &ldquo;{v.text}&rdquo;
                            </blockquote>
                            <cite className="not-italic text-xs font-semibold pl-3" style={{ color: "var(--gold)" }}>— {v.reference}</cite>
                        </article>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 max-w-2xl mx-auto px-6 pb-16">
                <div className="surface-wood rounded-3xl p-8 text-center">
                    <BrandMark size={40} />
                    <h2 className="font-display text-2xl mt-4 mb-3" style={{ color: "var(--cream)" }}>
                        Uma palavra feita para a sua {theme.keyword}
                    </h2>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                        Em vez de procurar, deixe a IA criar um devocional completo a partir do que você está sentindo agora — com reflexão, oração e aplicação prática.
                    </p>
                    <Link href="/signup" className="btn-primary">Receber meu devocional gratuito</Link>
                    <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
                        Grátis para começar · sem cartão
                    </p>
                </div>
            </section>
        </main>
    );
}
