"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";
import { Icon } from "@/components/icons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function JournalClient({ entries }: { entries: any[] }) {
    return (
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden pb-24 lg:pb-10">
            <div className="relative z-10 max-w-md lg:max-w-2xl mx-auto px-5 pt-12">
                <div className="mb-7">
                    <p className="eyebrow mb-1.5"><span className="gold-rule" /> Registros</p>
                    <h1 className="font-display text-2xl" style={{ color: "var(--cream)", fontWeight: 500 }}>Diário espiritual</h1>
                </div>
                {entries.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                        <Icon name="pen" size={44} style={{ color: "var(--text-secondary)" }} className="mx-auto mb-5" />
                        <h2 className="font-display text-lg mb-2" style={{ color: "var(--cream)", fontWeight: 500 }}>Diário vazio</h2>
                        <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: "var(--text-secondary)" }}>Após cada devocional, registre suas reflexões aqui.</p>
                        <Link href="/emotion" className="btn-primary">Gerar devocional</Link>
                    </motion.div>
                ) : (
                    <div className="relative">
                        <div className="absolute left-14 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, rgba(255,252,245,0.15), rgba(255,252,245,0.03))" }} />
                        <div className="space-y-6">
                            {entries.map((entry, i) => {
                                const date = new Date(entry.created_at);
                                const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
                                return (
                                    <motion.div key={entry.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex gap-4">
                                        <div className="flex flex-col items-end pt-3 flex-shrink-0" style={{ width: 52 }}>
                                            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{time}</span>
                                        </div>
                                        <div className="relative flex-shrink-0 mt-3.5">
                                            <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,252,245,0.25)" }} />
                                        </div>
                                        <div className="flex-1 pb-2">
                                            {entry.devotionals && (<div className="flex items-center gap-2 mb-2"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,252,245,0.05)", color: "var(--text-secondary)" }}>{entry.devotionals.emotion}</span></div>)}
                                            <div className="rounded-2xl p-4" style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}>
                                                {entry.devotionals?.title && (<p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>{entry.devotionals.title}</p>)}
                                                <p className="font-serif-devotional text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>{entry.content}</p>
                                                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{formatDate(entry.created_at)}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            <Link href="/emotion" className="fixed bottom-24 lg:bottom-8 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-gold)", color: "var(--night)", boxShadow: "0 8px 24px rgba(247,201,122,0.35)" }}>
                <Icon name="plus" size={24} strokeWidth={1.8} />
            </Link>
            <BottomNav />
        </main>
    );
}
