"use client";

import { useEffect, useState } from "react";
import { STREAK_MILESTONES } from "@/lib/constants";
import ShareModal, { type ShareData } from "@/components/ShareModal";

// Versículo de perseverança — combina com a conquista de constância.
const PERSEVERANCE_VERSE = {
    text: "E não nos cansemos de fazer o bem, porque a seu tempo ceifaremos, se não desfalecermos.",
    ref: "Gálatas 6:9",
};

interface Props {
    streak: number;
}

/**
 * Ao bater um marco de streak (7/21/100...), abre uma vez um card
 * compartilhável de conquista. "Já celebrado" é guardado no localStorage
 * para não repetir.
 */
export default function MilestoneCelebration({ streak }: Props) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<ShareData | null>(null);

    useEffect(() => {
        const milestone = STREAK_MILESTONES.find((m) => m.days === streak);
        if (!milestone) return;

        const key = `sh_milestone_${milestone.days}`;
        try {
            if (localStorage.getItem(key)) return;
            localStorage.setItem(key, "1");
        } catch {
            // se localStorage falhar, segue mostrando (melhor mostrar que silenciar)
        }

        setData({
            type: "devotional",
            title: milestone.label,
            declaration: `Há ${milestone.days} dias caminhando com Deus, um dia de cada vez.`,
            verse: PERSEVERANCE_VERSE.text,
            verseRef: PERSEVERANCE_VERSE.ref,
            milestone: `${milestone.days} dias de constância`,
            date: new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" }),
        });
        setOpen(true);
    }, [streak]);

    return <ShareModal open={open} onClose={() => setOpen(false)} data={data} />;
}
