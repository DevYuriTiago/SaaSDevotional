/**
 * Cards de divulgação do embaixador, desenhados no Canvas do navegador.
 * Mesma técnica do ShareModal do app, com uma diferença essencial: o QR do
 * embaixador entra desenhado na imagem, então o card funciona sozinho. Quem vê
 * o story aponta a câmera e cai no link, sem depender de sticker nem de bio.
 */

export type PromoFormat = "story" | "feed";

const DIMS: Record<PromoFormat, { w: number; h: number }> = {
    story: { w: 1080, h: 1920 },
    feed: { w: 1080, h: 1080 },
};

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/** Quebra o texto em linhas que cabem na largura dada. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width <= maxWidth) line = test;
        else { if (line) lines.push(line); line = w; }
    }
    if (line) lines.push(line);
    return lines;
}

/** Converte o SVG do QR (gerado no servidor) numa imagem utilizável no Canvas. */
async function qrImage(svg: string): Promise<HTMLImageElement | null> {
    try {
        // O QR vem em dourado sobre fundo transparente. No card ele fica sobre
        // um selo claro, então trocamos o traço para escuro para dar contraste.
        const escuro = svg.replace(/#F7C97A/gi, "#1A160F");
        const blob = new Blob([escuro], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const img = await loadImage(url);
        URL.revokeObjectURL(url);
        return img;
    } catch {
        return null;
    }
}

export async function drawPromoCard(
    canvas: HTMLCanvasElement,
    { format, headline, link, qrSvg }: { format: PromoFormat; headline: string; link: string; qrSvg: string | null }
) {
    const { w: W, h: H } = DIMS[format];
    const ctx = canvas.getContext("2d")!;
    canvas.width = W;
    canvas.height = H;

    const isStory = format === "story";

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

    // Escurece o miolo para o texto respirar sobre qualquer fundo.
    const veil = ctx.createLinearGradient(0, 0, 0, H);
    veil.addColorStop(0, "rgba(7,7,13,0.55)");
    veil.addColorStop(0.5, "rgba(7,7,13,0.30)");
    veil.addColorStop(1, "rgba(7,7,13,0.80)");
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";

    const topo = isStory ? 140 : 80;

    if (logo) {
        const ls = isStory ? 150 : 110;
        ctx.drawImage(logo, W / 2 - ls / 2, topo, ls, ls);
    }
    if (wm) {
        const ww = isStory ? 460 : 360;
        const wh = (ww * wm.height) / wm.width;
        ctx.drawImage(wm, W / 2 - ww / 2, topo + (isStory ? 175 : 130), ww, wh);
    }

    // Frase principal
    const headlineY = isStory ? 760 : 470;
    ctx.fillStyle = "#FBF7E6";
    const fs = isStory ? 78 : 62;
    ctx.font = `400 ${fs}px Georgia, 'Times New Roman', serif`;
    const linhas = wrap(ctx, headline, W - 200);
    const lh = fs * 1.28;
    linhas.forEach((l, i) => ctx.fillText(l, W / 2, headlineY + i * lh));

    // Selo do QR
    const qr = qrSvg ? await qrImage(qrSvg) : null;
    const selo = isStory ? 400 : 300;
    const seloY = isStory ? 1120 : 640;
    const seloX = W / 2 - selo / 2;

    if (qr) {
        ctx.fillStyle = "#FBF7E6";
        const r = 34;
        ctx.beginPath();
        ctx.moveTo(seloX + r, seloY);
        ctx.arcTo(seloX + selo, seloY, seloX + selo, seloY + selo, r);
        ctx.arcTo(seloX + selo, seloY + selo, seloX, seloY + selo, r);
        ctx.arcTo(seloX, seloY + selo, seloX, seloY, r);
        ctx.arcTo(seloX, seloY, seloX + selo, seloY, r);
        ctx.closePath();
        ctx.fill();

        const pad = selo * 0.1;
        ctx.drawImage(qr, seloX + pad, seloY + pad, selo - pad * 2, selo - pad * 2);

        ctx.fillStyle = "#D9D2C2";
        ctx.font = `600 ${isStory ? 34 : 28}px system-ui, sans-serif`;
        ctx.fillText("APONTE A CÂMERA", W / 2, seloY + selo + (isStory ? 62 : 52));
    }

    // Link, em pílula dourada no rodapé
    const linkTexto = link.replace(/^https?:\/\//, "");
    const pillFs = isStory ? 40 : 34;
    ctx.font = `600 ${pillFs}px system-ui, sans-serif`;
    const tw = ctx.measureText(linkTexto).width;
    const pw = tw + 76;
    const ph = isStory ? 92 : 78;
    const px = W / 2 - pw / 2;
    const py = H - (isStory ? 210 : 150);

    const grad = ctx.createLinearGradient(px, py, px + pw, py + ph);
    grad.addColorStop(0, "#FBE3B0");
    grad.addColorStop(0.5, "#F7C97A");
    grad.addColorStop(1, "#C9962E");
    ctx.fillStyle = grad;
    const pr = ph / 2;
    ctx.beginPath();
    ctx.moveTo(px + pr, py);
    ctx.arcTo(px + pw, py, px + pw, py + ph, pr);
    ctx.arcTo(px + pw, py + ph, px, py + ph, pr);
    ctx.arcTo(px, py + ph, px, py, pr);
    ctx.arcTo(px, py, px + pw, py, pr);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#2A1E08";
    ctx.fillText(linkTexto, W / 2, py + ph / 2 + pillFs * 0.35);
}

/** Frases sugeridas para o card, curtas por natureza do formato. */
export const PROMO_HEADLINES = [
    "Uma Palavra feita para o que você está sentindo hoje.",
    "Quando você não sabe nem por onde começar a orar.",
    "Seu maná é fresco a cada manhã.",
    "Diga o que sente. Receba a Palavra para hoje.",
];
