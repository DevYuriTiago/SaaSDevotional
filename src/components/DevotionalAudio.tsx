"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { Devotional } from "@/types";

interface Props {
    devotional: Devotional;
    isPremium: boolean;
}

export default function DevotionalAudio({ devotional, isPremium }: Props) {
    const [speaking, setSpeaking] = useState(false);
    const [ambient, setAmbient] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const oscRefs = useRef<OscillatorNode[]>([]);

    useEffect(() => {
        return () => {
            if (typeof window !== "undefined") window.speechSynthesis?.cancel();
            if (audioCtxRef.current) {
                oscRefs.current.forEach(o => { try { o.stop(); } catch { /* already stopped */ } });
                audioCtxRef.current.close();
            }
        };
    }, []);

    function handleTTS() {
        if (!isPremium) return;

        if (speaking) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }

        const sections = [
            devotional.title + ".",
            devotional.verse + ". " + devotional.verse_reference + ".",
            devotional.reflection,
            "Oração. " + devotional.prayer,
            "Declaração de fé. " + devotional.declaration,
        ];
        const text = sections.filter(Boolean).join(" ");

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        utterance.rate = 0.82;
        utterance.pitch = 0.95;

        // Prefer a Portuguese voice when available
        const voices = window.speechSynthesis.getVoices();
        const ptVoice = voices.find(v => v.lang.startsWith("pt"));
        if (ptVoice) utterance.voice = ptVoice;

        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);

        setSpeaking(true);
        window.speechSynthesis.speak(utterance);
    }

    function handleAmbient() {
        if (!isPremium) return;

        if (ambient) {
            if (masterGainRef.current && audioCtxRef.current) {
                masterGainRef.current.gain.linearRampToValueAtTime(
                    0,
                    audioCtxRef.current.currentTime + 1.5
                );
                setTimeout(() => {
                    oscRefs.current.forEach(o => { try { o.stop(); } catch { /* already stopped */ } });
                    oscRefs.current = [];
                    audioCtxRef.current?.close();
                    audioCtxRef.current = null;
                }, 1600);
            }
            setAmbient(false);
            return;
        }

        // Lá menor (Am) — tonalidade contemplativa e acolhedora
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 2.5);
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        // A2, C3, E3, A3, C4 — acorde Am com harmônicos suaves
        const notes = [
            { freq: 110.0, vol: 0.35 },
            { freq: 130.8, vol: 0.25 },
            { freq: 164.8, vol: 0.20 },
            { freq: 220.0, vol: 0.15 },
            { freq: 261.6, vol: 0.10 },
        ];

        oscRefs.current = notes.map(({ freq, vol }, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.value = vol;

            // Tremolo muito lento e suave para cada oscilador
            lfo.frequency.value = 0.05 + i * 0.018;
            lfoGain.gain.value = 0.006;
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);
            lfo.start();

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            return osc;
        });

        setAmbient(true);
    }

    if (!isPremium) {
        return (
            <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.12)" }}
            >
                <span className="text-base">🔒</span>
                <span className="text-xs flex-1" style={{ color: "var(--text-muted)" }}>
                    Áudio disponível no Premium
                </span>
                <Link href="/subscription" className="text-xs font-semibold" style={{ color: "var(--brand-purple)" }}>
                    Assinar →
                </Link>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={handleTTS}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-medium transition-all"
                style={{
                    background: speaking ? "rgba(168,85,247,0.18)" : "rgba(168,85,247,0.07)",
                    border: `1px solid ${speaking ? "rgba(168,85,247,0.4)" : "rgba(168,85,247,0.14)"}`,
                    color: speaking ? "var(--brand-purple)" : "var(--text-secondary)",
                }}
            >
                <span>{speaking ? "⏹" : "▶"}</span>
                <span>{speaking ? "Parar leitura" : "Ouvir devocional"}</span>
            </button>
            <button
                onClick={handleAmbient}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-medium transition-all"
                style={{
                    background: ambient ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.07)",
                    border: `1px solid ${ambient ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.14)"}`,
                    color: ambient ? "#818CF8" : "var(--text-secondary)",
                }}
            >
                <span>{ambient ? "🔇" : "🎵"}</span>
                <span>{ambient ? "Som ligado" : "Música ambiente"}</span>
            </button>
        </div>
    );
}
