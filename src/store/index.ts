import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Devotional, EmotionAnalysis } from "@/types";

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
    toggleNightMode: () => void;
    setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            nightMode: false,
            sidebarOpen: false,
            toggleNightMode: () => set((s) => ({ nightMode: !s.nightMode })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
        }),
        { name: "ui-store" }
    )
);
