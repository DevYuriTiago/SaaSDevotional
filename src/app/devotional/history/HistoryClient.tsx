"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";
import { useDevotionalStore } from "@/store";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DevotionalSummary {
    id: string;
    title: string;
    emotion: string;
    verse_reference: string;
    is_saved: boolean;
    created_at: string;
}

export default function HistoryClient({ devotionals }: { devotionals: DevotionalSummary[] }) {
    const router = useRouter();
    const { setDevotional } = useDevotionalStore();

    async function openDevotional(id: string) {
        const supabase = createClient();
        const { data } = await supabase.from("devotionals").select("*").eq("id", id).single();
        if (data) {
            setDevotional(data);
            router.push("/devotional/read");
        }
    }

    return (
        <main className="relative min-h-dvh overflow-x-hidden pb-24 lg:pb-10" style={{ background: "var(--bg-base)" }}>
            <div className="relative z-10 max-w-md lg:max-w-2xl mx-auto px-5 pt-12">
                <div className="flex items-center gap-3 mb-7">
                    <Link href="/dashboard" className="text-sm" style={{ color: "var(--text-muted)" }}>← Voltar</Link>
                    <div className="flex-1">
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Todos os registros</p>
                        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Histórico de devocionais</h1>
                    </div>
                </div>

                {devotionals.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                        <span className="text-5xl mb-5 block">📖</span>
                        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Nenhum devocional ainda</h2>
                        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Gere seu primeiro devocional agora.</p>
                        <Link href="/emotion" className="btn-primary">Começar</Link>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {devotionals.map((d, i) => (
                            <motion.button
                                key={d.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => openDevotional(d.id)}
                                className="w-full text-left card-base p-4 flex items-start gap-4"
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                                    style={{ background: "rgba(168,85,247,0.12)" }}
                                >
                                    {d.is_saved ? "❤️" : "📖"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate mb-0.5" style={{ color: "var(--text-primary)" }}>{d.title}</p>
                                    <p className="text-xs mb-1" style={{ color: "var(--brand-purple)" }}>{d.verse_reference}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.1)", color: "var(--text-muted)" }}>{d.emotion}</span>
                                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(d.created_at)}</span>
                                    </div>
                                </div>
                                <span className="text-sm flex-shrink-0 mt-1" style={{ color: "var(--text-muted)" }}>→</span>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
            <BottomNav />
        </main>
    );
}
