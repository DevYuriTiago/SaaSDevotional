"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatShortDate } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";
import { useDevotionalStore } from "@/store";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icons";

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
        <main className="aurora-bg relative min-h-dvh overflow-x-hidden pb-28 lg:pb-10">
            <div className="relative z-10 max-w-md lg:max-w-2xl mx-auto px-5 pt-12">
                <div className="flex items-center gap-3 mb-7">
                    <Link href="/dashboard" className="flex items-center gap-1 text-sm" style={{ color: "var(--text-muted)" }}>
                        <Icon name="arrow-left" size={16} /> Voltar
                    </Link>
                    <div className="flex-1">
                        <p className="eyebrow" style={{ color: "var(--text-muted)", fontSize: 10 }}>Todos os registros</p>
                        <h1 className="font-display" style={{ color: "var(--cream)", fontSize: "clamp(1.3rem, 5vw, 1.6rem)", fontWeight: 400 }}>Histórico de devocionais</h1>
                    </div>
                </div>

                {devotionals.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}>
                            <Icon name="book" size={30} style={{ color: "var(--text-secondary)" }} />
                        </div>
                        <h2 className="font-display mb-2" style={{ color: "var(--cream)", fontSize: "1.25rem", fontWeight: 400 }}>Nenhum devocional ainda</h2>
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
                                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                                    style={{ background: "rgba(255,252,245,0.05)", border: "1px solid var(--glass-border)" }}
                                >
                                    <Icon name={d.is_saved ? "heart" : "book"} size={18} style={{ color: "var(--text-secondary)" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate mb-0.5" style={{ color: "var(--cream)" }}>{d.title}</p>
                                    <p className="font-serif-devotional text-sm mb-1" style={{ color: "var(--gold)" }}>{d.verse_reference}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,252,245,0.05)", color: "var(--text-muted)" }}>{d.emotion}</span>
                                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatShortDate(d.created_at)}</span>
                                    </div>
                                </div>
                                <Icon name="arrow-right" size={16} className="flex-shrink-0 mt-1" style={{ color: "var(--text-muted)" }} />
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
            <BottomNav />
        </main>
    );
}
