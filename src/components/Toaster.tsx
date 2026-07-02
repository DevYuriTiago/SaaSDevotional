"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store";
import { Icon, type IconName } from "@/components/icons";

const TONE: Record<string, { icon: IconName; color: string; border: string }> = {
    success: { icon: "check", color: "var(--gold)", border: "rgba(247,201,122,0.35)" },
    error: { icon: "bell", color: "var(--amber)", border: "rgba(224,151,90,0.4)" },
    info: { icon: "sparkle", color: "var(--text-secondary)", border: "var(--glass-border)" },
};

export default function Toaster() {
    const toasts = useUIStore((s) => s.toasts);
    const removeToast = useUIStore((s) => s.removeToast);

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
            <AnimatePresence>
                {toasts.map((t) => {
                    const tone = TONE[t.type] ?? TONE.info;
                    return (
                        <motion.button
                            key={t.id}
                            layout
                            initial={{ opacity: 0, y: -16, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -12, scale: 0.96 }}
                            transition={{ type: "spring", damping: 26, stiffness: 320 }}
                            onClick={() => removeToast(t.id)}
                            className="pointer-events-auto w-full flex items-start gap-3 rounded-2xl px-4 py-3 text-left"
                            style={{
                                background: "var(--glass-strong)",
                                border: `1px solid ${tone.border}`,
                                backdropFilter: "blur(20px)",
                                boxShadow: "var(--shadow-card)",
                            }}
                        >
                            <Icon name={tone.icon} size={18} style={{ color: tone.color, flexShrink: 0, marginTop: 1 }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold" style={{ color: "var(--cream)" }}>{t.title}</p>
                                {t.description && (
                                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{t.description}</p>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
