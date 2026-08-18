"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { slugify } from "@/lib/ambassadors/slug";
import { formatShortDate } from "@/lib/utils";
import AdminNav from "../AdminNav";

export type Application = {
    id: string;
    name: string;
    email: string | null;
    whatsapp: string | null;
    social_platform: string | null;
    social_handle: string | null;
    followers_count: number | null;
    church: string | null;
    testimony: string | null;
    promotion_plan: string | null;
    created_at: string;
};

type Reviewed = { id: string; name: string; status: string; reviewed_at: string | null };

/** Link direto para o perfil, para o admin conferir o alcance sem procurar. */
function profileUrl(platform: string | null, handle: string | null): string | null {
    if (!handle) return null;
    const h = handle.replace(/^@/, "").trim();
    if (!h) return null;
    switch (platform) {
        case "instagram": return `https://instagram.com/${h}`;
        case "tiktok": return `https://tiktok.com/@${h}`;
        case "youtube": return `https://youtube.com/@${h}`;
        default: return h.startsWith("http") ? h : null;
    }
}

const PLATFORM_LABEL: Record<string, string> = {
    instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", outro: "Outro",
};

type Result = { kind: "approved"; link: string; emailSent: boolean; name: string }
    | { kind: "rejected"; emailSent: boolean; name: string }
    | { kind: "error"; message: string };

export default function FilaClient({ pending, recent }: { pending: Application[]; recent: Reviewed[] }) {
    const router = useRouter();
    const [slugs, setSlugs] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState<string | null>(null);
    const [result, setResult] = useState<Result | null>(null);
    const [copied, setCopied] = useState(false);

    async function review(app: Application, action: "approve" | "reject") {
        if (busy) return;
        if (action === "reject" && !confirm(`Recusar a inscrição de ${app.name}? A pessoa recebe um aviso por e-mail.`)) return;

        setBusy(app.id);
        setResult(null);
        setCopied(false);

        try {
            const res = await fetch("/api/admin/ambassadors/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: app.id, action, slug: slugs[app.id] }),
            });
            const json = await res.json();

            if (!res.ok || !json.ok) {
                setResult({ kind: "error", message: json.error ?? "Não foi possível concluir." });
            } else if (action === "approve") {
                setResult({ kind: "approved", link: json.link, emailSent: json.emailSent, name: app.name });
            } else {
                setResult({ kind: "rejected", emailSent: json.emailSent, name: app.name });
            }
            router.refresh();
        } catch {
            setResult({ kind: "error", message: "Falha de conexão." });
        } finally {
            setBusy(null);
        }
    }


    return (
        <main className="aurora-bg relative min-h-dvh px-5 sm:px-8 py-10">
            <div className="max-w-4xl mx-auto">

                <header className="mb-6">
                    <p className="eyebrow mb-1.5" style={{ color: "var(--gold)" }}>
                        <span className="gold-rule" /> curadoria
                    </p>
                    <h1 className="font-display text-3xl" style={{ color: "var(--cream)", fontWeight: 500 }}>
                        Embaixadores
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                        {pending.length === 0
                            ? "Nenhuma inscrição aguardando."
                            : `${pending.length} ${pending.length === 1 ? "inscrição aguardando" : "inscrições aguardando"} sua análise.`}
                    </p>
                </header>

                <AdminNav pendentes={pending.length} />

                {/* Resultado da última decisão */}
                {result && (
                    <div className="rounded-2xl p-5 mb-7" style={{
                        background: result.kind === "error" ? "rgba(224,151,90,0.08)" : "rgba(247,201,122,0.07)",
                        border: `1px solid ${result.kind === "error" ? "rgba(224,151,90,0.3)" : "rgba(247,201,122,0.3)"}`,
                    }}>
                        {result.kind === "approved" && (
                            <>
                                <p className="text-sm font-semibold mb-1" style={{ color: "var(--cream)" }}>
                                    {result.name} agora é embaixador.
                                </p>
                                <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                                    O link já está ativo e creditando: <strong style={{ color: "var(--gold)" }}>{result.link}</strong>
                                </p>
                                {result.emailSent ? (
                                    <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                                        <Icon name="check" size={13} /> E-mail de boas-vindas enviado.
                                    </p>
                                ) : (
                                    <div>
                                        <p className="text-xs mb-2" style={{ color: "var(--amber)" }}>
                                            O e-mail não pôde ser enviado. A aprovação está valendo, avise a pessoa por WhatsApp:
                                        </p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    `Boas notícias! Sua inscrição no Programa de Embaixadores Humanáh foi aprovada. Este é o seu link exclusivo: ${result.link} . Cada pessoa que assinar por ele fica ligada a você, e a sua comissão cai todo mês enquanto a assinatura permanecer ativa.`
                                                );
                                                setCopied(true);
                                            }}
                                            className="btn-ghost text-xs" style={{ width: "auto", height: 38, paddingInline: 16 }}
                                        >
                                            <Icon name="share" size={14} /> {copied ? "Mensagem copiada" : "Copiar mensagem"}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                        {result.kind === "rejected" && (
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                Inscrição de <strong style={{ color: "var(--cream)" }}>{result.name}</strong> recusada.
                                {result.emailSent ? " Aviso enviado por e-mail." : " O e-mail de aviso não pôde ser enviado."}
                            </p>
                        )}
                        {result.kind === "error" && (
                            <p className="text-sm" style={{ color: "var(--amber)" }}>{result.message}</p>
                        )}
                    </div>
                )}

                {/* Fila */}
                {pending.length === 0 ? (
                    <div className="card-base p-12 text-center">
                        <Icon name="dove" size={40} style={{ color: "var(--text-muted)" }} className="mx-auto mb-4" />
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            Tudo em dia. Quando alguém se inscrever em /embaixadores, aparece aqui.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {pending.map((app) => {
                            const url = profileUrl(app.social_platform, app.social_handle);
                            const suggested = slugs[app.id] ?? slugify(app.name);
                            const isBusy = busy === app.id;

                            return (
                                <article key={app.id} className="surface-wood rounded-[24px] p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                                        <div>
                                            <h2 className="font-display text-xl" style={{ color: "var(--cream)", fontWeight: 500 }}>
                                                <Link href={`/admin/embaixadores/${app.id}`} className="hover:underline">{app.name}</Link>
                                            </h2>
                                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                inscrito em {formatShortDate(app.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-display text-2xl" style={{ color: "var(--gold)", fontWeight: 500 }}>
                                                {(app.followers_count ?? 0).toLocaleString("pt-BR")}
                                            </p>
                                            <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>seguidores</p>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm mb-5">
                                        <Field label="Plataforma" value={PLATFORM_LABEL[app.social_platform ?? ""] ?? app.social_platform} />
                                        <Field label="Perfil" value={app.social_handle} href={url} />
                                        <Field label="E-mail" value={app.email} href={app.email ? `mailto:${app.email}` : null} />
                                        <Field label="WhatsApp" value={app.whatsapp} />
                                        {app.church && <Field label="Igreja" value={app.church} />}
                                    </div>

                                    {app.testimony && (
                                        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(11,11,18,0.4)", border: "1px solid var(--glass-border)" }}>
                                            <p className="text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--gold)" }}>caminhada com Cristo</p>
                                            <p className="font-serif-devotional text-base leading-relaxed whitespace-pre-line" style={{ color: "var(--reading, var(--text-secondary))" }}>
                                                {app.testimony}
                                            </p>
                                        </div>
                                    )}

                                    {app.promotion_plan && (
                                        <div className="mb-5">
                                            <p className="text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "var(--text-muted)" }}>como pretende divulgar</p>
                                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{app.promotion_plan}</p>
                                        </div>
                                    )}

                                    {/* Decisão */}
                                    <div className="pt-5 border-t" style={{ borderColor: "var(--glass-border)" }}>
                                        <label className="block text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--text-muted)" }}>
                                            link do embaixador
                                        </label>
                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                            <span className="text-sm" style={{ color: "var(--text-muted)" }}>humanah.app/e/</span>
                                            <input
                                                value={suggested}
                                                onChange={(e) => setSlugs((s) => ({ ...s, [app.id]: e.target.value }))}
                                                className="input-base"
                                                style={{ width: "auto", flex: "1 1 180px", padding: "10px 14px", fontSize: 14 }}
                                                maxLength={24}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button onClick={() => review(app, "approve")} disabled={isBusy}
                                                className="btn-primary" style={{ width: "auto", height: 48, paddingInline: 26, fontSize: "0.9rem" }}>
                                                {isBusy ? "Processando..." : <><Icon name="check" size={17} /> Aprovar e enviar link</>}
                                            </button>
                                            <button onClick={() => review(app, "reject")} disabled={isBusy}
                                                className="btn-ghost" style={{ width: "auto", height: 48, paddingInline: 22, fontSize: "0.9rem" }}>
                                                Recusar
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* Histórico curto */}
                {recent.length > 0 && (
                    <section className="mt-12">
                        <p className="text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: "var(--text-muted)" }}>decisões recentes</p>
                        <ul className="space-y-1.5">
                            {recent.map((r) => (
                                <li key={r.id} className="flex items-center justify-between gap-3 text-sm py-2 px-4 rounded-xl"
                                    style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}>
                                    <Link href={`/admin/embaixadores/${r.id}`} className="hover:underline" style={{ color: "var(--text-secondary)" }}>{r.name}</Link>
                                    <span className="flex items-center gap-3 text-xs" style={{ color: r.status === "active" ? "var(--gold)" : "var(--text-muted)" }}>
                                        {r.status === "active" ? "aprovado" : "recusado"}
                                        {r.reviewed_at ? ` · ${formatShortDate(r.reviewed_at)}` : ""}
                                        {r.status === "active" && (
                                            <Link href={`/admin/relatorio/${r.id}`} className="hover:underline" style={{ color: "var(--gold)" }}>
                                                relatório
                                            </Link>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </main>
    );
}

function Field({ label, value, href }: { label: string; value?: string | null; href?: string | null }) {
    if (!value) return null;
    return (
        <div>
            <span className="text-[10px] uppercase tracking-[0.16em] block" style={{ color: "var(--text-muted)" }}>{label}</span>
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--gold)" }}>
                    {value}
                </a>
            ) : (
                <span style={{ color: "var(--text-secondary)" }}>{value}</span>
            )}
        </div>
    );
}
