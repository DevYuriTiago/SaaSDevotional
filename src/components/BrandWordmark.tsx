import { BrandMark } from "@/components/icons";
import type { CSSProperties } from "react";

interface Props {
    /** Tamanho da logo (o "O"). O texto escala a partir dele. */
    size?: number;
    /** "stack" quebra em 2 linhas (sidebars estreitas); "inline" mantém em 1. */
    layout?: "stack" | "inline";
    className?: string;
    style?: CSSProperties;
}

/**
 * Marca-frase: a logo (círculo) faz o papel da letra "O" de
 * "O que você está sentindo hoje?". Acessível via aria-label.
 */
export default function BrandWordmark({ size = 30, layout = "stack", className, style }: Props) {
    const fontSize = Math.round(size * 0.46);
    return (
        <span
            className={`inline-flex items-center gap-2.5 ${className ?? ""}`}
            style={style}
            role="img"
            aria-label="O Que Você Está Sentindo Hoje"
        >
            <BrandMark size={size} style={{ flexShrink: 0 }} />
            <span
                className="font-display"
                style={{ color: "var(--cream)", fontSize, lineHeight: 1.08, fontWeight: 400, letterSpacing: "-0.01em" }}
                aria-hidden="true"
            >
                que você está{layout === "stack" ? <br /> : " "}
                sentindo <span style={{ fontStyle: "italic", color: "var(--gold)" }}>hoje?</span>
            </span>
        </span>
    );
}
