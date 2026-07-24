"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/icons";

export interface ShareData {
    type: "devotional" | "journey";
    title: string;
    declaration: string;
    verse: string;
    verseRef: string;
    emotion?: string;
    reflection?: string;
    reflectiveQuestion?: string;
    dayLabel?: string;
    journeyLabel?: string;
    journeyEmoji?: string;
    milestone?: string;
    date?: string;
}

type ShareVariant = "verse" | "declaration" | "question";

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 8): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth) {
            current = test;
        } else {
            if (current) lines.push(current);
            if (lines.length >= maxLines - 1) { current = word + "…"; break; }
            current = word;
        }
    }
    if (current && lines.length < maxLines) lines.push(current);
    return lines;
}

function excerpt(text: string, max = 210): string {
    const clean = (text ?? "").replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max);
    const lastDot = cut.lastIndexOf(". ");
    if (lastDot > max * 0.5) return cut.slice(0, lastDot + 1);
    return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, v: string) {
    try { (ctx as unknown as { letterSpacing: string }).letterSpacing = v; } catch { /* não suportado */ }
}

function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, alpha = 0.9) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        const ang = (Math.PI / 4) * i - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.34;
        ctx.lineTo(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(247,201,122,${alpha})`;
    ctx.fill();
}

function drawDivider(ctx: CanvasRenderingContext2D, W: number, y: number, half: number) {
    const cx = W / 2;
    const grad = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
    grad.addColorStop(0, "rgba(247,201,122,0)");
    grad.addColorStop(0.5, "rgba(247,201,122,0.5)");
    grad.addColorStop(1, "rgba(247,201,122,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - half, y); ctx.lineTo(cx - 26, y);
    ctx.moveTo(cx + 26, y); ctx.lineTo(cx + half, y);
    ctx.stroke();
    drawSparkle(ctx, cx, y, 12);
}


function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// Globo simples (ícone de link) em traço dourado.
function drawGlobe(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.46, r, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
}

// Card no formato Story do Instagram (1080×1920).
async function drawCard(canvas: HTMLCanvasElement, data: ShareData, variant: ShareVariant) {
    const ctx = canvas.getContext("2d")!;
    const W = 1080, H = 1920;
    canvas.width = W;
    canvas.height = H;

    let bg: HTMLImageElement | null = null;
    let logo: HTMLImageElement | null = null;
    let wm: HTMLImageElement | null = null;
    try {
        [bg, logo, wm] = await Promise.all([
            loadImage("/fundo-comp.png"),
            loadImage("/new-icon.png"),
            loadImage("/new-wordmark.png"),
        ]);
    } catch { /* segue sem assets */ }

    if (bg) {
        const s = Math.max(W / bg.width, H / bg.height);
        ctx.drawImage(bg, (W - bg.width * s) / 2, (H - bg.height * s) / 2, bg.width * s, bg.height * s);
    } else {
        ctx.fillStyle = "#07070D";
        ctx.fillRect(0, 0, W, H);
    }

    ctx.textAlign = "center";

    // Emblema
    if (logo) {
        const ls = 178;
        ctx.drawImage(logo, W / 2 - ls / 2, 85, ls, ls);
    }

    // Wordmark (imagem)
    if (wm) {
        const ww = 555;
        const wh = (ww * wm.height) / wm.width;
        ctx.drawImage(wm, W / 2 - ww / 2, 250, ww, wh);
    }

    // Tagline
    ctx.fillStyle = "rgba(247,201,122,0.72)";
    ctx.font = "600 25px system-ui, sans-serif";
    setLetterSpacing(ctx, "5px");
    ctx.fillText("SEU ALIMENTO ESPIRITUAL DIÁRIO", W / 2, 608);
    setLetterSpacing(ctx, "0px");

    drawDivider(ctx, W, 690, 150);

    // Rótulo (o card NÃO expõe o sentimento escolhido pelo usuário)
    const LABELS: Record<ShareVariant, string> = {
        verse: "UMA PALAVRA PARA LEMBRAR HOJE",
        declaration: "DECLARAÇÃO DE FÉ",
        question: "PARA REFLETIR",
    };
    ctx.fillStyle = "rgba(247,201,122,0.9)";
    ctx.font = "600 29px system-ui, sans-serif";
    setLetterSpacing(ctx, "6px");
    ctx.fillText(LABELS[variant], W / 2, 762);
    setLetterSpacing(ctx, "0px");

    // Conteúdo principal (versículo completo — auto-ajuste sem truncar)
    const content =
        variant === "verse" ? `“${data.verse}”`
            : variant === "question" ? (data.reflectiveQuestion || excerpt(data.reflection || data.declaration, 220))
                : data.declaration;

    const REGION_TOP = 835, REGION_BOTTOM = 1320;
    const regionH = REGION_BOTTOM - REGION_TOP;
    const maxW = W - 150;
    let fontSize = 78, lineH = 102;
    let lines: string[] = [];
    for (fontSize = 78; fontSize >= 30; fontSize -= 2) {
        lineH = Math.round(fontSize * 1.34);
        ctx.font = `700 ${fontSize}px Georgia, 'Times New Roman', serif`;
        lines = wrapText(ctx, content, maxW, 40);
        if (lines.length * lineH <= regionH) break;
    }
    const blockH = lines.length * lineH;
    const firstBaseline = REGION_TOP + Math.max(0, (regionH - blockH) / 2) + fontSize * 0.82;
    ctx.fillStyle = "rgba(251,247,230,0.96)";
    lines.forEach((l, i) => ctx.fillText(l, W / 2, firstBaseline + i * lineH));

    drawDivider(ctx, W, 1370, 90);

    // Livro + referência
    ctx.save();
    ctx.translate(W / 2 - 30, 1397);
    ctx.scale(60 / 24, 60 / 24);
    ctx.strokeStyle = "rgba(247,201,122,0.9)";
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke(new Path2D("M12 6c-2-1.4-4.5-2-7-2v13c2.5 0 5 .6 7 2 2-1.4 4.5-2 7-2V4c-2.5 0-5 .6-7 2Z"));
    ctx.beginPath(); ctx.moveTo(12, 6); ctx.lineTo(12, 21); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "rgba(247,201,122,0.9)";
    ctx.font = "600 42px system-ui, sans-serif";
    setLetterSpacing(ctx, "4px");
    ctx.fillText(data.verseRef.toUpperCase(), W / 2, 1510);
    setLetterSpacing(ctx, "0px");

    // ── CTA (motor viral): convite + link em pílula ──
    // Container bleeds off the bottom edge (não é um retângulo fechado — encaixa no final).
    roundRect(ctx, 88, 1600, 904, 420, 40);
    ctx.fillStyle = "rgba(247,201,122,0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(247,201,122,0.28)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Linha-convite com sparkle à esquerda (grupo centralizado)
    const ctaText = "Descubra seu devocional de hoje";
    ctx.font = "600 41px system-ui, sans-serif";
    const ctaW = ctx.measureText(ctaText).width;
    const spR = 14;
    const groupLeft = W / 2 - (spR * 2 + 22 + ctaW) / 2;
    drawSparkle(ctx, groupLeft + spR, 1692, spR);
    ctx.fillStyle = "rgba(251,247,230,0.95)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(ctaText, groupLeft + spR * 2 + 22, 1696);

    // Pílula do link (globo + domínio)
    const pillW = 400, pillH = 84, pillX = W / 2 - pillW / 2, pillY = 1786;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = "rgba(247,201,122,0.07)";
    ctx.fill();
    ctx.strokeStyle = "rgba(247,201,122,0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const domain = "humanah.app";
    ctx.font = "500 40px system-ui, sans-serif";
    const dW = ctx.measureText(domain).width;
    const globeR = 17;
    const gx = W / 2 - (globeR * 2 + 18 + dW) / 2 + globeR;
    drawGlobe(ctx, gx, pillY + pillH / 2, globeR, "rgba(247,201,122,0.95)");
    ctx.fillStyle = "rgba(247,201,122,0.95)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(domain, gx + globeR + 18, pillY + pillH / 2 + 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
}

interface Props {
    open: boolean;
    onClose: () => void;
    data: ShareData | null;
}

const VARIANTS: { key: ShareVariant; label: string }[] = [
    { key: "verse", label: "Versículo" },
    { key: "declaration", label: "Declaração" },
    { key: "question", label: "Pergunta" },
];

export default function ShareModal({ open, onClose, data }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawn, setDrawn] = useState(false);
    const [copied, setCopied] = useState(false);
    const [variant, setVariant] = useState<ShareVariant>("verse");

    useEffect(() => {
        if (!open || !data) { setDrawn(false); return; }
        let cancelled = false;
        setDrawn(false);
        const t = setTimeout(() => {
            if (canvasRef.current) {
                drawCard(canvasRef.current, data, variant)
                    .then(() => { if (!cancelled) setDrawn(true); })
                    .catch(() => { if (!cancelled) setDrawn(true); });
            }
        }, 60);
        return () => { cancelled = true; clearTimeout(t); };
    }, [open, data, variant]);

    async function handleShare() {
        if (!canvasRef.current || !drawn || !data) return;
        canvasRef.current.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], "devocional.png", { type: "image/png" });

            // Texto de promoção que acompanha a imagem (WhatsApp/Instagram usam como legenda).
            const shareUrl = "https://humanah.app";
            const body =
                variant === "verse" ? `"${data.verse}"\n— ${data.verseRef}`
                    : variant === "question" ? (data.reflectiveQuestion || excerpt(data.reflection || data.declaration, 260))
                        : `${data.declaration}\n— ${data.verseRef}`;
            const shareText = `${body}\n\n✨ Receba o seu devocional de hoje na Humanáh, feito para o seu momento:\n${shareUrl}`;

            if (typeof navigator !== "undefined" && navigator.share) {
                const withText = { files: [file], text: shareText, title: "Humanáh" };
                const filesOnly = { files: [file], title: "Humanáh" };
                try {
                    // Tenta imagem + texto; se a combinação não for suportada, cai para só imagem.
                    if (navigator.canShare?.(withText)) {
                        await navigator.share(withText);
                        return;
                    }
                    if (navigator.canShare?.(filesOnly)) {
                        await navigator.share(filesOnly);
                        return;
                    }
                } catch { /* fallback */ }
            }
            // Fallback (desktop/sem Web Share): baixa a imagem e copia o texto de promoção.
            try { await navigator.clipboard?.writeText(shareText); } catch { /* sem clipboard */ }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "devocional.png"; a.click();
            URL.revokeObjectURL(url);
        }, "image/png");
    }

    async function handleCopy() {
        if (!data) return;
        const shareUrl = "https://humanah.app";
        const body =
            variant === "verse" ? `"${data.verse}"\n— ${data.verseRef}`
                : variant === "question" ? (data.reflectiveQuestion || excerpt(data.reflection || data.declaration, 260))
                    : `${data.declaration}\n— ${data.verseRef}`;
        const text = `${body}\n\nDescubra o seu devocional de hoje 🙏\n${shareUrl}`;
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
                        style={{ background: "var(--surface)", border: "1px solid var(--glass-border)" }}
                    >
                        <div className="flex items-center justify-center relative mb-5">
                            <div className="w-10 h-1 rounded-full" style={{ background: "rgba(247,201,122,0.3)" }} />
                            <button
                                onClick={onClose}
                                aria-label="Fechar"
                                className="absolute right-0 -top-1 flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                                style={{ color: "var(--text-muted)", border: "1px solid var(--glass-border)" }}
                            >
                                <Icon name="close" size={16} />
                            </button>
                        </div>

                        <p className="eyebrow mb-4 text-center" style={{ color: "var(--gold)" }}>Compartilhar</p>

                        {/* Seletor de variação */}
                        <div className="flex gap-1.5 p-1 rounded-full mb-5" style={{ background: "rgba(255,252,245,0.04)", border: "1px solid var(--glass-border)" }}>
                            {VARIANTS.map((v) => {
                                const active = variant === v.key;
                                return (
                                    <button
                                        key={v.key}
                                        onClick={() => setVariant(v.key)}
                                        className="flex-1 py-2 rounded-full text-xs font-semibold transition-all"
                                        style={{ background: active ? "var(--gradient-gold)" : "transparent", color: active ? "#2A1E08" : "var(--text-secondary)" }}
                                    >
                                        {v.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Preview compacto (9:16) */}
                        <div className="flex justify-center mb-5">
                            <div
                                className="relative rounded-2xl overflow-hidden"
                                style={{ width: 174, height: 309, background: "#07070D", boxShadow: "0 0 40px rgba(247,201,122,0.22), 0 8px 32px rgba(0,0,0,0.6)", flexShrink: 0 }}
                            >
                                {!drawn && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div
                                            className="w-7 h-7 rounded-full"
                                            style={{ border: "2px solid transparent", borderTopColor: "var(--gold)" }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        />
                                    </div>
                                )}
                                <canvas
                                    ref={canvasRef}
                                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: drawn ? 1 : 0, transition: "opacity 0.35s" }}
                                />
                            </div>
                        </div>

                        {/* Botões de ação */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={handleShare}
                                disabled={!drawn}
                                className="flex items-center justify-center gap-2 rounded-2xl py-4"
                                style={{ background: drawn ? "var(--gradient-gold)" : "rgba(247,201,122,0.18)", opacity: drawn ? 1 : 0.55, boxShadow: drawn ? "0 4px 20px rgba(247,201,122,0.35)" : "none", transition: "all 0.3s" }}
                            >
                                <Icon name="share" size={18} style={{ color: drawn ? "var(--night)" : "var(--gold)" }} />
                                <span className="text-sm font-semibold" style={{ color: drawn ? "var(--night)" : "var(--gold)" }}>Compartilhar</span>
                            </button>

                            <button
                                onClick={handleCopy}
                                disabled={!data}
                                className="flex items-center justify-center gap-2 rounded-2xl py-4"
                                style={{ background: "rgba(247,201,122,0.10)", border: "1px solid var(--glass-border)" }}
                            >
                                <Icon name={copied ? "check" : "scroll"} size={18} style={{ color: copied ? "var(--gold)" : "var(--text-secondary)" }} />
                                <span className="text-sm font-medium" style={{ color: copied ? "var(--gold)" : "var(--text-secondary)" }}>
                                    {copied ? "Copiado!" : "Copiar texto"}
                                </span>
                            </button>
                        </div>

                        <p className="text-xs text-center" style={{ color: "rgba(247,201,122,0.45)" }}>
                            Salve e compartilhe no Instagram Stories ou Feed
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
