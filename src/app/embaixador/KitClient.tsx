"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { buildCaptions } from "@/lib/ambassadors/captions";
import { drawPromoCard, PROMO_HEADLINES, type PromoFormat } from "./promo-card";

export default function KitClient({ link, qrSvg }: { link: string; qrSvg: string | null }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [format, setFormat] = useState<PromoFormat>("story");
    const [headlineIdx, setHeadlineIdx] = useState(0);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    // Só o primeiro desenho importa para liberar o botão: antes dele o canvas
    // está vazio. Os redesenhos seguintes usam as imagens já em cache e levam
    // milissegundos, então não vale bloquear a interface a cada troca.
    const [pronto, setPronto] = useState(false);

    const captions = buildCaptions(link);

    useEffect(() => {
        let cancelado = false;
        (async () => {
            if (!canvasRef.current) return;
            await drawPromoCard(canvasRef.current, {
                format,
                headline: PROMO_HEADLINES[headlineIdx],
                link,
                qrSvg,
            });
            if (!cancelado) setPronto(true);
        })();
        return () => { cancelado = true; };
    }, [format, headlineIdx, link, qrSvg]);

    async function baixarOuCompartilhar() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], `humanah-${format}.png`, { type: "image/png" });

            // No celular, compartilhar direto para o Instagram ou WhatsApp.
            if (navigator.share && navigator.canShare?.({ files: [file] })) {
                try {
                    await navigator.share({ files: [file] });
                    return;
                } catch { /* usuário cancelou, cai para o download */ }
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `humanah-${format}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, "image/png");
    }

    async function copiarLegenda(text: string, i: number) {
        await navigator.clipboard.writeText(text);
        setCopiedIdx(i);
        setTimeout(() => setCopiedIdx(null), 2200);
    }

    return (
        <section className="mt-10">
            <p className="eyebrow mb-3" style={{ color: "var(--gold)" }}>
                <span className="gold-rule" /> kit de divulgação
            </p>
            <h2 className="font-display text-2xl mb-1.5" style={{ color: "var(--cream)", fontWeight: 500 }}>
                Pronto para postar
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                A imagem já sai com o seu QR code, e as legendas já vêm com o seu link. É só baixar e colar.
            </p>

            {/* Card */}
            <div className="surface-wood rounded-[24px] p-6 mb-5">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                    {([["story", "Story"], ["feed", "Feed"]] as const).map(([f, rotulo]) => (
                        <button
                            key={f}
                            onClick={() => setFormat(f)}
                            className="text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                            style={{
                                background: format === f ? "var(--gradient-gold)" : "transparent",
                                color: format === f ? "#2A1E08" : "var(--text-secondary)",
                                border: format === f ? "none" : "1px solid var(--glass-border)",
                            }}
                        >
                            {rotulo}
                        </button>
                    ))}
                    <button
                        onClick={() => setHeadlineIdx((i) => (i + 1) % PROMO_HEADLINES.length)}
                        className="text-xs px-4 py-2 rounded-full ml-auto"
                        style={{ color: "var(--gold)", border: "1px solid rgba(247,201,122,0.3)" }}
                    >
                        Trocar frase
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="mx-auto sm:mx-0 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--glass-border)", width: format === "story" ? 200 : 240 }}>
                        <canvas ref={canvasRef} className="w-full h-auto block" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                            {format === "story"
                                ? "Formato de story, 1080 por 1920. Publique e deixe o QR à vista: quem assiste aponta a câmera e cai direto no seu link."
                                : "Formato quadrado, 1080 por 1080, para o feed. Combine com uma das legendas abaixo."}
                        </p>
                        <button onClick={baixarOuCompartilhar} disabled={!pronto} className="btn-primary" style={{ width: "auto", height: 48, paddingInline: 24, fontSize: "0.9rem" }}>
                            <Icon name="share" size={17} /> {pronto ? "Baixar imagem" : "Preparando..."}
                        </button>
                    </div>
                </div>
            </div>

            {/* Legendas */}
            <div className="space-y-3">
                {captions.map((c, i) => (
                    <div key={c.label} className="card-base p-5">
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                            <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--gold)" }}>{c.label}</p>
                            <button onClick={() => copiarLegenda(c.text, i)} className="btn-ghost text-xs" style={{ width: "auto", height: 34, paddingInline: 14 }}>
                                <Icon name={copiedIdx === i ? "check" : "share"} size={13} />
                                {copiedIdx === i ? "Copiada" : "Copiar"}
                            </button>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                            {c.text}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
