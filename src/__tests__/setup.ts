import "@testing-library/jest-dom";
import { vi } from "vitest";

// ── Next.js navigation mocks ──────────────────────────────────────────────────
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
    redirect: vi.fn(),
}));

vi.mock("next/headers", () => ({
    cookies: vi.fn(() => ({
        getAll: vi.fn(() => []),
        set: vi.fn(),
    })),
    headers: vi.fn(() => new Headers()),
}));

// ── Web Speech API ────────────────────────────────────────────────────────────
Object.defineProperty(window, "speechSynthesis", {
    writable: true,
    value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        getVoices: vi.fn(() => []),
        paused: false,
        speaking: false,
    },
});

global.SpeechSynthesisUtterance = vi.fn().mockImplementation(function (text: string) {
    return {
        text,
        lang: "",
        rate: 1,
        pitch: 1,
        voice: null,
        onend: null,
        onerror: null,
    };
}) as unknown as typeof SpeechSynthesisUtterance;

// ── Web Audio API ─────────────────────────────────────────────────────────────
const mockGainNode = {
    gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
};

const mockOscillatorNode = {
    type: "sine" as OscillatorType,
    frequency: { value: 440 },
    detune: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
};

global.AudioContext = vi.fn().mockImplementation(function () {
    return {
        createGain: vi.fn(() => ({ ...mockGainNode })),
        createOscillator: vi.fn(() => ({ ...mockOscillatorNode })),
        currentTime: 0,
        destination: {},
        close: vi.fn().mockResolvedValue(undefined),
    };
}) as unknown as typeof AudioContext;

// ── localStorage (Zustand persist) ───────────────────────────────────────────
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (i: number) => Object.keys(store)[i] ?? null,
    };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });
