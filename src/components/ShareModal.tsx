"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ShareData {
    type: "devotional" | "journey";
    title: string;
    declaration: string;
    verse: string;
    verseRef: string;
    dayLabel?: string;
    journeyLabel?: string;
    journeyEmoji?: string;
    milestone?: string;
    date?: string;
}

function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxLines = 6,
): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth) {
            current = test;
        } else {
            if (current) lines.push(current);
            if (lines.length >= maxLines - 1) {
                current = word + "…";
                break;
            }
            current = word;
        }
    }
    if (current && lines.length < maxLines) lines.push(current);
    return lines;
}

function drawCard(canvas: HTMLCanvasElement, data: ShareData) {
    const ctx = canvas.getContext("2d")!;
    const W = 1080, H = 1920;
    canvas.width = W;
    canvas.height = H;

    // ── Background ──────────────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#070012");
    bg.addColorStop(0.48, "#130330");
    bg.addColorStop(1, "#0b0220");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const g1 = ctx.createRadialGradient(W * 0.78, H * 0.32, 0, W * 0.78, H * 0.32, 780);
    g1.addColorStop(0, "rgba(168,85,247,0.22)");
    g1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(W * 0.18, H * 0.72, 0, W * 0.18, H * 0.72, 520);
    g2.addColorStop(0, "rgba(88,28,135,0.16)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    // ── Stars ────────────────────────────────────────────────────
    for (let i = 0; i < 110; i++) {
        const x = ((Math.sin(i * 1.618 + 0.4) + 1) / 2) * W;
        const y = ((Math.cos(i * 2.718 + 1.1) + 1) / 2) * H;
        const r = i % 7 === 0 ? 3 : i % 3 === 0 ? 1.8 : 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.1 + (i % 5) * 0.07})`;
        ctx.fill();
    }

    // ── App name ─────────────────────────────────────────────────
    ctx.textAlign = "center";
    ctx.font = "300 40px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(168,85,247,0.72)";
    ctx.fillText("O Que Você Está Sentindo Hoje", W / 2, 142);

    const lg = ctx.createLinearGradient(W * 0.25, 0, W * 0.75, 0);
    lg.addColorStop(0, "rgba(168,85,247,0)");
    lg.addColorStop(0.5, "rgba(168,85,247,0.35)");
    lg.addColorStop(1, "rgba(168,85,247,0)");
    ctx.strokeStyle = lg;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W * 0.25, 170);
    ctx.lineTo(W * 0.75, 170);
    ctx.stroke();

    // ── Milestone badge (opcional) ───────────────────────────────
    let contentY = 255;
    if (data.milestone) {
        ctx.font = "500 44px system-ui, sans-serif";
        ctx.fillStyle = "rgba(196,162,253,0.9)";
        ctx.fillText(data.milestone, W / 2, contentY);
        contentY += 85;
    }

    // ── Aspas decorativas ────────────────────────────────────────
    ctx.font = "300 260px Georgia, serif";
    ctx.fillStyle = "rgba(168,85,247,0.09)";
    ctx.textAlign = "left";
    ctx.fillText("\u201C", 36, contentY + 240);

    // ── Declaração (texto principal) ─────────────────────────────
    ctx.font = "italic 700 78px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.textAlign = "center";
    const declLines = wrapText(ctx, data.declaration, W - 200, 5);
    const declLineH = 108;
    const declStartY = contentY + 305;
    declLines.forEach((l, i) => ctx.fillText(l, W / 2, declStartY + i * declLineH));
    const afterDecl = declStartY + declLines.length * declLineH + 65;

    // ── Divisor ──────────────────────────────────────────────────
    const dg = ctx.createLinearGradient(W * 0.3, 0, W * 0.7, 0);
    dg.addColorStop(0, "rgba(168,85,247,0)");
    dg.addColorStop(0.5, "rgba(168,85,247,0.48)");
    dg.addColorStop(1, "rgba(168,85,247,0)");
    ctx.strokeStyle = dg;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W * 0.3, afterDecl);
    ctx.lineTo(W * 0.7, afterDecl);
    ctx.stroke();

    // ── Versículo ─────────────────────────────────────────────────
    const verseY = afterDecl + 85;
    ctx.font = "italic 400 52px Georgia, serif";
    ctx.fillStyle = "rgba(255,255,255,0.58)";
    const verseLines = wrapText(ctx, `\u201C${data.verse}\u201D`, W - 240, 5);
    const verseLineH = 72;
    verseLines.forEach((l, i) => ctx.fillText(l, W / 2, verseY + i * verseLineH));
    const afterVerse = verseY + verseLines.length * verseLineH + 58;

    // ── Referência ────────────────────────────────────────────────
    ctx.font = "600 46px system-ui, sans-serif";
    ctx.fillStyle = "rgba(168,85,247,0.85)";
    ctx.fillText(`\u2014 ${data.verseRef}`, W / 2, afterVerse);

    // ── Atribuição ────────────────────────────────────────────────
    ctx.font = "400 38px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    if (data.journeyLabel) {
        const parts = [data.journeyEmoji, data.dayLabel, data.journeyLabel].filter(Boolean);
        ctx.fillText(parts.join(" · "), W / 2, H - 248);
    } else if (data.date) {
        ctx.fillText(`Devocional Diário · ${data.date}`, W / 2, H - 248);
    }

    // ── Watermark ─────────────────────────────────────────────────
    ctx.font = "300 36px system-ui, sans-serif";
    ctx.fillStyle = "rgba(168,85,247,0.38)";
    ctx.fillText("oquevoceestasentindohoje.app", W / 2, H - 148);
}

interface Props {
    open: boolean;
    onClose: () => void;
    data: ShareData | null;
}

export default function ShareModal({ open, onClose, data }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawn, setDrawn] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!open || !data) { setDrawn(false); return; }
        const t = setTimeout(() => {
            if (canvasRef.current) {
                drawCard(canvasRef.current, data);
                setDrawn(true);
            }
        }, 80);
        return () => clearTimeout(t);
    }, [open, data]);

    async function handleShare() {
        if (!canvasRef.current || !drawn) return;
        canvasRef.current.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], "devocional.png", { type: "image/png" });
            if (typeof navigator !== "undefined" && navigator.share) {
                try {
                    if (navigator.canShare?.({ files: [file] })) {
                        await navigator.share({ files: [file], title: data?.title ?? "Devocional" });
                        return;
                    }
                } catch { /* fallback */ }
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "devocional.png"; a.click();
            URL.revokeObjectURL(url);
        }, "image/png");
    }

    async function handleCopy() {
        if (!data) return;
        const text = `${data.declaration}\n\n"${data.verse}"\n— ${data.verseRef}\n\nO Que Você Está Sentindo Hoje`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end justify-center"
                    style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ type: "spring", damping: 26 }}
                        className="w-full max-w-sm rounded-t-3xl p-6 pb-10"
                        style={{ background: "#100a24", border: "1px solid rgba(168,85,247,0.22)" }}
                    >
                        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(168,85,247,0.3)" }} />

                        <p className="text-xs uppercase tracking-widest mb-5 text-center" style={{ color: "rgba(168,85,247,0.7)" }}>
                            Compartilhar
                        </p>

                        {/* Preview compacto do card */}
                        <div className="flex justify-center mb-5">
                            <div
                                className="relative rounded-2xl overflow-hidden"
                                style={{
                                    width: 162, height: 288,
                                    background: "#070012",
                                    boxShadow: "0 0 40px rgba(168,85,247,0.25), 0 8px 32px rgba(0,0,0,0.6)",
                                    flexShrink: 0,
                                }}
                            >
                                {!drawn && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div
                                            className="w-7 h-7 rounded-full"
                                            style={{ border: "2px solid transparent", borderTopColor: "#a855f7" }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        />
                                    </div>
                                )}
                                <canvas
                                    ref={canvasRef}
                                    style={{
                                        position: "absolute", top: 0, left: 0,
                                        width: "100%", height: "100%",
                                        opacity: drawn ? 1 : 0,
                                        transition: "opacity 0.35s",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Botões de ação */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={handleShare}
                                disabled={!drawn}
                                className="flex items-center justify-center gap-2 rounded-2xl py-4"
                                style={{
                                    background: drawn ? "linear-gradient(135deg,#9333ea,#7c3aed)" : "rgba(168,85,247,0.18)",
                                    opacity: drawn ? 1 : 0.55,
                                    boxShadow: drawn ? "0 4px 20px rgba(147,51,234,0.4)" : "none",
                                    transition: "all 0.3s",
                                }}
                            >
                                <span className="text-lg">📤</span>
                                <span className="text-sm font-semibold text-white">Compartilhar</span>
                            </button>

                            <button
                                onClick={handleCopy}
                                disabled={!data}
                                className="flex items-center justify-center gap-2 rounded-2xl py-4"
                                style={{ background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.22)" }}
                            >
                                <span className="text-lg">{copied ? "✅" : "📋"}</span>
                                <span className="text-sm font-medium" style={{ color: copied ? "#4ade80" : "var(--text-secondary)" }}>
                                    {copied ? "Copiado!" : "Copiar texto"}
                                </span>
                            </button>
                        </div>

                        <p className="text-xs text-center" style={{ color: "rgba(168,85,247,0.42)" }}>
                            Salve e compartilhe no Instagram Stories ou Feed
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
