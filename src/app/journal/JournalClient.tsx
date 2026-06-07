"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function JournalClient({ entries }: { entries: any[] }) {
    return (
        <main className="relative min-h-dvh overflow-x-hidden pb-24 lg:pb-10" style={{ background: "var(--bg-base)" }}>
            <div className="relative z-10 max-w-md lg:max-w-2xl mx-auto px-5 pt-12">
                <div className="mb-7">
                    <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Registros</p>
                    <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Diário espiritual</h1>
                </div>
                {entries.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                        <span className="text-5xl mb-5 block">📝</span>
                        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Diário vazio</h2>
                        <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: "var(--text-secondary)" }}>Após cada devocional, registre suas reflexões aqui.</p>
                        <Link href="/emotion" className="btn-primary">Gerar devocional</Link>
                    </motion.div>
                ) : (
                    <div className="relative">
                        <div className="absolute left-14 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, rgba(168,85,247,0.4), rgba(168,85,247,0.05))" }} />
                        <div className="space-y-6">
                            {entries.map((entry, i) => {
                                const date = new Date(entry.created_at);
                                const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                                return (
                                    <motion.div key={entry.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex gap-4">
                                        <div className="flex flex-col items-end pt-3 flex-shrink-0" style={{ width: 52 }}>
                                            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{time}</span>
                                        </div>
                                        <div className="relative flex-shrink-0 mt-3.5">
                                            <div className="w-3 h-3 rounded-full" style={{ background: "var(--gradient-button)", boxShadow: "0 0 8px rgba(168,85,247,0.5)" }} />
                                        </div>
                                        <div className="flex-1 pb-2">
                                            {entry.devotionals && (<div className="flex items-center gap-2 mb-2"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(168,85,247,0.12)", color: "var(--brand-purple)" }}>{entry.devotionals.emotion}</span></div>)}
                                            <div className="rounded-2xl p-4" style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}>
                                                {entry.devotionals?.title && (<p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>{entry.devotionals.title}</p>)}
                                                <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{entry.content}</p>
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
            <Link href="/emotion" className="fixed bottom-24 lg:bottom-8 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-light text-white" style={{ background: "var(--gradient-button)", boxShadow: "var(--shadow-button)" }}>+</Link>
            <BottomNav />
        </main>
    );
}
