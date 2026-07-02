import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";

/* ════════════════════════════════════════════════════════════
   Ícones de linha autorais — traço único, currentColor.
   Substituem todos os emoji do app. Inline (sem dependência de
   versão do lucide). Glifos das emoções no espírito ex-voto.
   ════════════════════════════════════════════════════════════ */

export type IconName =
    | "dawn" | "book" | "compass" | "pen" | "user" | "plus" | "crown"
    | "flame" | "bookmark" | "heart" | "heart-mend" | "share" | "play"
    | "pause" | "arrow-left" | "arrow-right" | "chevron-left" | "chevron-right"
    | "check" | "close" | "bell" | "calendar" | "star" | "sparkle"
    | "settings" | "moon" | "sunrise" | "anchor" | "quote" | "lock"
    | "logout" | "rewind" | "forward" | "constellation" | "storm" | "rain"
    | "hands" | "rest" | "waves" | "dove" | "feather" | "scroll"
    | "mail" | "eye" | "eye-off" | "shield";

export interface IconProps {
    name: IconName;
    size?: number;
    strokeWidth?: number;
    className?: string;
    style?: CSSProperties;
}

function paths(name: IconName): ReactNode {
    switch (name) {
        // ── Navegação / sistema ──────────────────────────
        case "dawn": // sol nascendo sobre o horizonte (Início)
            return (
                <>
                    <line x1="2.5" y1="18" x2="21.5" y2="18" />
                    <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
                    <line x1="12" y1="3.5" x2="12" y2="6" />
                    <line x1="4.6" y1="8.6" x2="6.2" y2="10.2" />
                    <line x1="19.4" y1="8.6" x2="17.8" y2="10.2" />
                </>
            );
        case "book":
            return (
                <>
                    <path d="M12 6c-2-1.4-4.5-2-7-2v13c2.5 0 5 .6 7 2 2-1.4 4.5-2 7-2V4c-2.5 0-5 .6-7 2Z" />
                    <line x1="12" y1="6" x2="12" y2="21" />
                </>
            );
        case "compass":
            return (
                <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M15.6 8.4l-2.2 5.2-5.2 2.2 2.2-5.2 5.2-2.2Z" />
                </>
            );
        case "pen":
            return (
                <>
                    <path d="M4 20h16" />
                    <path d="M14.3 4.7l5 5L9 20H4v-5L14.3 4.7Z" />
                </>
            );
        case "feather":
            return (
                <>
                    <path d="M20 5a5.5 5.5 0 0 0-8 0L5.5 11.5V19h7.5L19.5 12A5.5 5.5 0 0 0 20 5Z" />
                    <line x1="16" y1="8" x2="7.5" y2="16.5" />
                    <line x1="11.5" y1="9" x2="14" y2="11.5" />
                </>
            );
        case "scroll":
            return (
                <>
                    <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V4Z" />
                    <path d="M6 4a2 2 0 0 0-2 2v2h2" />
                    <line x1="9" y1="9" x2="16" y2="9" />
                    <line x1="9" y1="13" x2="16" y2="13" />
                </>
            );
        case "user":
            return (
                <>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4.5 20c0-4 3.5-6 7.5-6s7.5 2 7.5 6" />
                </>
            );
        case "plus":
            return (
                <>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </>
            );
        case "crown":
            return <path d="M3 8l3.6 8.5h10.8L21 8l-5 3.8-4-7-4 7L3 8Z" />;
        case "bookmark":
            return <path d="M6 4h12v16l-6-4-6 4V4Z" />;
        case "share":
            return (
                <>
                    <path d="M21 3 10.5 13.5" />
                    <path d="M21 3l-7 18-3.4-7.6L3 10l18-7Z" />
                </>
            );
        case "play":
            return <path d="M7 4.8v14.4L20 12 7 4.8Z" />;
        case "pause":
            return (
                <>
                    <line x1="9" y1="5" x2="9" y2="19" />
                    <line x1="15" y1="5" x2="15" y2="19" />
                </>
            );
        case "arrow-left":
            return (
                <>
                    <line x1="20" y1="12" x2="4.5" y2="12" />
                    <path d="M10.5 5.5 4 12l6.5 6.5" />
                </>
            );
        case "arrow-right":
            return (
                <>
                    <line x1="4" y1="12" x2="19.5" y2="12" />
                    <path d="M13.5 5.5 20 12l-6.5 6.5" />
                </>
            );
        case "chevron-left":
            return <path d="M15 5l-7 7 7 7" />;
        case "chevron-right":
            return <path d="M9 5l7 7-7 7" />;
        case "check":
            return <path d="M4 12.5l5 5L20 6" />;
        case "close":
            return (
                <>
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                </>
            );
        case "bell":
            return (
                <>
                    <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2Z" />
                    <path d="M10 20a2 2 0 0 0 4 0" />
                </>
            );
        case "calendar":
            return (
                <>
                    <rect x="4" y="5" width="16" height="16" rx="2.5" />
                    <line x1="4" y1="9.5" x2="20" y2="9.5" />
                    <line x1="8.5" y1="3" x2="8.5" y2="6" />
                    <line x1="15.5" y1="3" x2="15.5" y2="6" />
                </>
            );
        case "settings":
            return (
                <>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.1 5.1l2.1 2.1M16.8 16.8l2.1 2.1M18.9 5.1l-2.1 2.1M7.2 16.8l-2.1 2.1" />
                </>
            );
        case "lock":
            return (
                <>
                    <rect x="5" y="11" width="14" height="9" rx="2.5" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </>
            );
        case "logout":
            return (
                <>
                    <path d="M9.5 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3.5" />
                    <path d="M15 8l4 4-4 4M19 12H9.5" />
                </>
            );
        case "mail":
            return (
                <>
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="M4 7l8 6 8-6" />
                </>
            );
        case "eye":
            return (
                <>
                    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                    <circle cx="12" cy="12" r="3" />
                </>
            );
        case "eye-off":
            return (
                <>
                    <path d="M10.6 6.2A8.8 8.8 0 0 1 12 6c6 0 9.5 6 9.5 6a14.6 14.6 0 0 1-3 3.4M6.4 8.1A14.7 14.7 0 0 0 2.5 12S6 18 12 18a8.7 8.7 0 0 0 3.6-.8" />
                    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                    <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" />
                </>
            );
        case "shield":
            return (
                <>
                    <path d="M12 3.5l7 2.5v5c0 4.5-3 7.6-7 9.5-4-1.9-7-5-7-9.5V6l7-2.5Z" />
                    <path d="M9.2 12l2 2 3.6-3.8" />
                </>
            );
        case "rewind":
            return (
                <>
                    <path d="M11 4a8 8 0 1 1-7.6 5.6" />
                    <path d="M3 4v5h5" />
                </>
            );
        case "forward":
            return (
                <>
                    <path d="M13 4a8 8 0 1 0 7.6 5.6" />
                    <path d="M21 4v5h-5" />
                </>
            );
        case "quote":
            return (
                <>
                    <path d="M6 7h4v4c0 2-1.2 3.2-3.6 3.6V13c1-.2 1.6-.6 1.6-1.4H6V7Z" fill="currentColor" stroke="none" />
                    <path d="M15 7h4v4c0 2-1.2 3.2-3.6 3.6V13c1-.2 1.6-.6 1.6-1.4H15V7Z" fill="currentColor" stroke="none" />
                </>
            );

        // ── Símbolos espirituais ──────────────────────────
        case "flame":
            return <path d="M12 3c2.8 3.8 6 5.4 6 9.6A6 6 0 0 1 6 12.6c0-1.9 1-3.3 1.9-4.3 0 1.5 1 2.5 2.1 2.5-1.6-3 0-5.9 2-7.8Z" />;
        case "heart":
            return <path d="M12 20S4 14.6 4 9.2A4 4 0 0 1 12 8a4 4 0 0 1 8 1.2C20 14.6 12 20 12 20Z" />;
        case "heart-mend": // coração com costura (arrependido)
            return (
                <>
                    <path d="M12 20S4 14.6 4 9.2A4 4 0 0 1 12 8a4 4 0 0 1 8 1.2C20 14.6 12 20 12 20Z" />
                    <path d="M12 8l-1.6 3h3.2L12 14" />
                </>
            );
        case "anchor": // fé como âncora da alma (Hb 6:19)
            return (
                <>
                    <circle cx="12" cy="4.6" r="2.1" />
                    <line x1="12" y1="6.7" x2="12" y2="21" />
                    <line x1="8" y1="11" x2="16" y2="11" />
                    <path d="M4 14a8 8 0 0 0 16 0" />
                </>
            );
        case "sunrise":
            return (
                <>
                    <line x1="3" y1="19" x2="21" y2="19" />
                    <path d="M7 15a5 5 0 0 1 10 0" />
                    <path d="M12 3.5v3.5M12 3.5l-2 2M12 3.5l2 2" />
                </>
            );
        case "moon":
            return <path d="M20 13.6A8 8 0 1 1 10.4 4 6.5 6.5 0 0 0 20 13.6Z" />;
        case "rest": // lua com 'z' (cansado)
            return (
                <>
                    <path d="M19.5 14A7.5 7.5 0 1 1 11 5.4 6 6  0 0 0 19.5 14Z" />
                    <path d="M14.5 4h3l-3 3h3" />
                </>
            );
        case "storm": // nuvem agitada (ansioso)
            return (
                <>
                    <path d="M7 13.5a3 3 0 0 1 .4-6 4.5 4.5 0 0 1 8.6 1.1A3 3 0 0 1 16 14H8" />
                    <path d="M6 17.5h8M6 20.5h5" />
                </>
            );
        case "rain": // nuvem com gotas (triste)
            return (
                <>
                    <path d="M7 12.5a3 3 0 0 1 .4-6 4.5 4.5 0 0 1 8.6 1.1A3 3 0 0 1 16 13H8" />
                    <path d="M8 16.5 7 19M12 16.5 11 19M16 16.5 15 19" />
                </>
            );
        case "hands": // mãos abertas recebendo a luz (grato)
            return (
                <>
                    <path d="M4 13a8 8 0 0 0 16 0" />
                    <path d="M4 13l-1.2-2M20 13l1.2-2" />
                    <path d="M12 3l1 2.8 2.8 1L13 7.8 12 10.6 11 7.8 8.2 6.8 11 5.8 12 3Z" fill="currentColor" stroke="none" />
                </>
            );
        case "waves":
            return (
                <>
                    <path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                    <path d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                </>
            );
        case "dove":
            return (
                <>
                    <path d="M4 14c4.2 0 6.2-2.2 7-5 1 3 4 4.8 8 3.8-1 4-5 6-9 5-3-.9-5-2-6-3.8Z" />
                    <path d="M11 9l3.2-3.2" />
                </>
            );

        // ── Estrelas (Carta Celeste) ──────────────────────
        case "star":
            return <path d="M12 2.5l2.1 7.4 7.4 2.1-7.4 2.1L12 21.5l-2.1-7.4L2.5 12l7.4-2.1L12 2.5Z" fill="currentColor" stroke="none" />;
        case "sparkle":
            return (
                <>
                    <path d="M11 3l1.6 5.4L18 10l-5.4 1.6L11 17l-1.6-5.4L4 10l5.4-1.6L11 3Z" />
                    <path d="M18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />
                </>
            );
        case "constellation":
            return (
                <>
                    <path d="M5 17l5-8 4 5 5-9" />
                    <circle cx="5" cy="17" r="1.3" fill="currentColor" stroke="none" />
                    <circle cx="10" cy="9" r="1.3" fill="currentColor" stroke="none" />
                    <circle cx="14" cy="14" r="1.3" fill="currentColor" stroke="none" />
                    <circle cx="19" cy="5" r="1.3" fill="currentColor" stroke="none" />
                </>
            );
        default:
            return null;
    }
}

export function Icon({ name, size = 22, strokeWidth = 1.6, className, style }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
            aria-hidden="true"
            focusable="false"
        >
            {paths(name)}
        </svg>
    );
}

/* Marca: cruz + livro aberto dentro do anel de ouro */
// Marca oficial (emblema dourado: halo + cruz-estrela + livro aberto).
// Renderiza o asset oficial em vez do antigo traço de linha, para que toda a
// aplicação use a mesma identidade — basta passar `size`.
export function BrandMark({ size = 40, className, style }: { size?: number; className?: string; style?: CSSProperties }) {
    return (
        <Image
            src="/icon-512.png"
            alt="O Que Você Está Sentindo Hoje"
            width={size}
            height={size}
            className={className}
            style={style}
            priority
        />
    );
}

/* Glifo ex-voto da emoção (mapeado em constants.ts) */
const EMOTION_GLYPHS: Record<string, IconName> = {
    storm: "storm",
    rain: "rain",
    flame: "flame",
    compass: "compass",
    hands: "hands",
    sunrise: "sunrise",
    rest: "rest",
    anchor: "anchor",
    heart: "heart-mend",
    moon: "moon",
};

export function EmotionGlyph({ glyph, ...rest }: { glyph?: string } & Omit<IconProps, "name">) {
    return <Icon name={(glyph && EMOTION_GLYPHS[glyph]) || "sparkle"} {...rest} />;
}

/* Glifo de cada jornada de 21 dias */
const JOURNEY_GLYPHS: Record<string, IconName> = {
    ansiedade: "waves",
    fe: "flame",
    "paz-interior": "dove",
    identidade: "crown",
    proposito: "sparkle",
    direcao: "compass",
};

export function journeyGlyph(slug: string): IconName {
    return JOURNEY_GLYPHS[slug] ?? "star";
}
