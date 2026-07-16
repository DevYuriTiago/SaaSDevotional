import Link from "next/link";
import Image from "next/image";

export type LegalSection = { title: string; body: (string | string[])[] };

export default function LegalShell({
    title,
    updated,
    intro,
    sections,
    otherHref,
    otherLabel,
}: {
    title: string;
    updated: string;
    intro?: string;
    sections: LegalSection[];
    otherHref: string;
    otherLabel: string;
}) {
    return (
        <main className="aurora-bg min-h-dvh">
            {/* Header */}
            <header className="max-w-3xl mx-auto px-5 sm:px-6 py-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <Image src="/new-icon.png" alt="Humanáh" width={36} height={36} className="rounded-lg" />
                    <Image src="/new-wordmark.png" alt="Humanáh" width={1536} height={1024} className="h-auto w-[104px]" style={{ marginTop: -10, marginBottom: -8 }} />
                </Link>
                <Link href="/" className="text-sm hover:text-[var(--cream)] transition-colors" style={{ color: "var(--text-secondary)" }}>
                    Início
                </Link>
            </header>

            {/* Conteúdo */}
            <article className="max-w-3xl mx-auto px-5 sm:px-6 pb-20">
                <div className="h-px mb-10" style={{ background: "linear-gradient(90deg, transparent, var(--glass-border), transparent)" }} />
                <h1 className="font-display leading-tight mb-2" style={{ color: "var(--cream)", fontSize: "clamp(2rem, 6vw, 3rem)", fontWeight: 400 }}>
                    {title}
                </h1>
                <p className="text-xs mb-8" style={{ color: "var(--text-muted)" }}>Última atualização: {updated}</p>

                {intro && (
                    <p className="text-base leading-relaxed mb-10" style={{ color: "var(--text-secondary)" }}>{intro}</p>
                )}

                {sections.map((s, i) => (
                    <section key={s.title} className="mb-9">
                        <h2 className="font-display mb-3 flex items-baseline gap-3" style={{ color: "var(--cream)", fontSize: "1.35rem", fontWeight: 400 }}>
                            <span className="text-sm" style={{ color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</span>
                            {s.title}
                        </h2>
                        <div className="space-y-3">
                            {s.body.map((b, j) =>
                                Array.isArray(b) ? (
                                    <ul key={j} className="space-y-2 pl-1">
                                        {b.map((li, k) => (
                                            <li key={k} className="flex gap-3 text-[0.95rem] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                                <span aria-hidden style={{ color: "var(--gold)", marginTop: 2 }}>•</span>
                                                <span>{li}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p key={j} className="text-[0.95rem] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{b}</p>
                                )
                            )}
                        </div>
                    </section>
                ))}
            </article>

            {/* Footer */}
            <footer className="border-t" style={{ borderColor: "var(--glass-border)" }}>
                <div className="max-w-3xl mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>© 2026 Humanáh · humanah.app</p>
                    <div className="flex items-center gap-5 text-sm">
                        <Link href={otherHref} className="hover:text-[var(--cream)] transition-colors" style={{ color: "var(--text-secondary)" }}>{otherLabel}</Link>
                        <a href="mailto:contato@humanah.app" className="hover:text-[var(--cream)] transition-colors" style={{ color: "var(--text-secondary)" }}>Contato</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
