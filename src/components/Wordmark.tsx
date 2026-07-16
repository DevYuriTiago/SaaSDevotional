import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * Marca-frase oficial (PNG dourado transparente). Use o `className` para
 * dimensionar (ex.: "w-72"); a altura ajusta sozinha pela proporção 1536×1024.
 * Em espaços pequenos (sidebar) prefira texto — aqui a serifa fina ficaria ilegível.
 */
export default function Wordmark({
    className,
    style,
    priority = false,
}: {
    className?: string;
    style?: CSSProperties;
    priority?: boolean;
}) {
    return (
        <Image
            src="/new-wordmark.png"
            alt="Humanáh"
            width={1536}
            height={1024}
            priority={priority}
            className={className}
            style={{ height: "auto", ...style }}
        />
    );
}
