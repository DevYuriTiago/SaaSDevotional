import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Devotional, EmotionAnalysis, ToastMessage } from "@/types";

// ─── Auth Store ────────────────────────────────────
interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
}));

// ─── Devotional Flow Store ─────────────────────────
interface DevotionalFlowState {
    currentEmotion: string;
    currentEmotionRaw: string;
    emotionAnalysis: EmotionAnalysis | null;
    currentDevotional: Devotional | null;
    isGenerating: boolean;
    setEmotion: (emotion: string, raw: string) => void;
    setEmotionAnalysis: (analysis: EmotionAnalysis) => void;
    setDevotional: (devotional: Devotional) => void;
    setGenerating: (loading: boolean) => void;
    reset: () => void;
}

export const useDevotionalStore = create<DevotionalFlowState>((set) => ({
    currentEmotion: "",
    currentEmotionRaw: "",
    emotionAnalysis: null,
    currentDevotional: null,
    isGenerating: false,
    setEmotion: (emotion, raw) =>
        set({ currentEmotion: emotion, currentEmotionRaw: raw }),
    setEmotionAnalysis: (analysis) => set({ emotionAnalysis: analysis }),
    setDevotional: (devotional) => set({ currentDevotional: devotional }),
    setGenerating: (loading) => set({ isGenerating: loading }),
    reset: () =>
        set({
            currentEmotion: "",
            currentEmotionRaw: "",
            emotionAnalysis: null,
            currentDevotional: null,
            isGenerating: false,
        }),
}));

// ─── UI Store ──────────────────────────────────────
interface UIState {
    nightMode: boolean;
    sidebarOpen: boolean;
    toasts: ToastMessage[];
    toggleNightMode: () => void;
    setSidebarOpen: (open: boolean) => void;
    addToast: (toast: Omit<ToastMessage, "id">) => void;
    removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set, get) => ({
            nightMode: false,
            sidebarOpen: false,
            toasts: [],
            toggleNightMode: () => set((s) => ({ nightMode: !s.nightMode })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            addToast: (toast) => {
                const id =
                    typeof crypto !== "undefined" && crypto.randomUUID
                        ? crypto.randomUUID()
                        : `${Date.now()}-${performance.now()}`;
                set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
                setTimeout(() => get().removeToast(id), 4500);
            },
            removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        }),
        {
            name: "ui-store",
            // Só a preferência de tema persiste; toasts/sidebar são efêmeros.
            partialize: (s) => ({ nightMode: s.nightMode }),
        }
    )
);

// Helper de conveniência para disparar toasts fora de componentes.
export function toast(t: Omit<ToastMessage, "id">) {
    useUIStore.getState().addToast(t);
}
