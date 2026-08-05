import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}

/**
 * "Agora" no fuso do Brasil, como um Date cujos getters locais
 * (getDate/getMonth/getDay/getHours) refletem o horário de São Paulo.
 * Determinístico no servidor (UTC) e no cliente → evita mismatch de hidratação
 * em qualquer UI que dependa da data/hora atual (saudação, faixa de semana...).
 */
export function brazilNow(): Date {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Sao_Paulo",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    }).formatToParts(new Date());
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
    return new Date(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
}

export function formatShortDate(date: Date | string): string {
    // Fuso fixo (Brasil): sem isso, o servidor (UTC) e o cliente (local)
    // formatam dias diferentes perto da meia-noite → mismatch de hidratação.
    return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "short",
        timeZone: "America/Sao_Paulo",
    }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + "…";
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
