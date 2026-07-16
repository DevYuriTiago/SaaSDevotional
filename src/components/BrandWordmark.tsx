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
 * Marca oficial: o emblema + a wordmark "Humanáh". Acessível via aria-label.
 */
export default function BrandWordmark({ size = 30, className, style }: Props) {
    const fontSize = Math.round(size * 0.6);
    return (
        <span
            className={`inline-flex items-center gap-2.5 ${className ?? ""}`}
            style={style}
            role="img"
            aria-label="Humanáh"
        >
            <BrandMark size={size} style={{ flexShrink: 0 }} />
            <span
                className="font-display"
                style={{ color: "var(--cream)", fontSize, lineHeight: 1.08, fontWeight: 500, letterSpacing: "-0.01em" }}
                aria-hidden="true"
            >
                Human<span style={{ color: "var(--gold)" }}>á</span>h
            </span>
        </span>
    );
}
