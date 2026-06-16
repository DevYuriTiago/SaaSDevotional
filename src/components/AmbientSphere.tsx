"use client";

import { motion } from "framer-motion";

/* ════════════════════════════════════════════════════════════
   Auréola — substitui o antigo orbe roxo genérico.
   Anéis de ouro concêntricos (aureole sacra / coroa de sol),
   sem esfera de plástico. Calor de vela ao centro.
   ════════════════════════════════════════════════════════════ */

interface AmbientSphereProps {
    size?: number;
    className?: string;
}

export default function AmbientSphere({ size = 280, className = "" }: AmbientSphereProps) {
    const rings = [1, 0.78, 0.56];
    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            {/* brilho quente central */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: size * 0.7,
                    height: size * 0.7,
                    background: "radial-gradient(circle, rgba(247,201,122,0.22) 0%, rgba(224,151,90,0.08) 45%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.65, 1, 0.65] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* anéis de ouro concêntricos */}
            {rings.map((r, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: size * r,
                        height: size * r,
                        border: "1px solid rgba(247,201,122,0.28)",
                        boxShadow: i === rings.length - 1 ? "0 0 30px rgba(247,201,122,0.18)" : "none",
                    }}
                    animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.85, 0.4] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                />
            ))}
            {/* pontos de luz (estrelas) sobre o anel */}
            {[0, 72, 144, 216, 288].map((deg) => (
                <div
                    key={deg}
                    className="absolute rounded-full"
                    style={{
                        width: 2.5,
                        height: 2.5,
                        background: "var(--gold-light)",
                        boxShadow: "0 0 6px rgba(251,227,176,0.8)",
                        transform: `rotate(${deg}deg) translateY(-${(size * 0.5) / 2}px)`,
                    }}
                />
            ))}
        </div>
    );
}
