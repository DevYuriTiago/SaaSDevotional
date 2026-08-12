import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_LEN = 24;
const FALLBACK = "embaixador";

/**
 * Converte um nome no slug do link público (/e/<slug>).
 * Só a-z e 0-9: o slug aparece na URL que o embaixador divulga em voz alta e
 * digita em bio de rede social, então quanto mais simples, melhor.
 */
export function slugify(name: string): string {
    const clean = (name ?? "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "") // tira os acentos separados pelo NFD
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, MAX_LEN);
    return clean || FALLBACK;
}

/** Primeiro slug livre a partir de uma base: base, base2, base3... */
export async function uniqueSlug(admin: SupabaseClient, base: string): Promise<string> {
    const root = slugify(base);

    for (let i = 1; i < 100; i++) {
        const candidate = i === 1 ? root : `${root}${i}`;
        const { data } = await admin
            .from("ambassador_links")
            .select("id")
            .eq("slug", candidate)
            .maybeSingle();
        if (!data) return candidate;
    }

    // Improvável: 99 homônimos. Cai para um sufixo aleatório em vez de falhar.
    return `${root}${Date.now().toString(36).slice(-4)}`;
}
