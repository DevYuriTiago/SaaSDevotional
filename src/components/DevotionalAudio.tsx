"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { Devotional } from "@/types";
import { Icon } from "@/components/icons";

interface Props {
    devotional: Devotional;
    isPremium: boolean;
}

// Escolhe a MELHOR voz pt disponível no dispositivo (natural/online/Google/Siri),
// em vez da primeira da lista (que costuma ser a mais robótica).
function pickBestPtVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
    const pt = voices.filter((v) => /^pt/i.test(v.lang));
    if (pt.length === 0) return undefined;
    const ptBR = pt.filter((v) => /pt[-_]?br/i.test(v.lang));
    const pool = ptBR.length ? ptBR : pt;
    const score = (v: SpeechSynthesisVoice) => {
        const n = v.name.toLowerCase();
        let s = 0;
        if (/natural|neural|online/.test(n)) s += 5; // Microsoft (Edge) — as melhores
        if (n.includes("google")) s += 3;            // Chrome / Android
        if (n.includes("luciana")) s += 2;           // iOS / Safari
        if (/premium|enhanced/.test(n)) s += 2;
        if (!v.localService) s += 1;                 // vozes de rede tendem a soar melhor
        return s;
    };
    return [...pool].sort((a, b) => score(b) - score(a))[0];
}

export default function DevotionalAudio({ devotional, isPremium }: Props) {
    const [speaking, setSpeaking] = useState(false);
    const [ambient, setAmbient] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const oscRefs = useRef<OscillatorNode[]>([]);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        return () => {
            if (typeof window !== "undefined") window.speechSynthesis?.cancel();
            if (audioCtxRef.current) {
                oscRefs.current.forEach(o => { try { o.stop(); } catch { /* already stopped */ } });
                audioCtxRef.current.close();
            }
        };
    }, []);

    // Carrega/atualiza as vozes (alguns navegadores só populam após 'voiceschanged').
    useEffect(() => {
        const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
        if (!synth) return;
        const load = () => { voicesRef.current = synth.getVoices(); };
        load();
        synth.addEventListener?.("voiceschanged", load);
        return () => synth.removeEventListener?.("voiceschanged", load);
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
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        // Prefere a MELHOR voz pt disponível (natural/online), não a primeira.
        const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices();
        const best = pickBestPtVoice(voices);
        if (best) utterance.voice = best;

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
                style={{ background: "rgba(247,201,122,0.05)", border: "1px solid var(--glass-border)" }}
            >
                <Icon name="lock" size={16} style={{ color: "var(--gold)" }} />
                <span className="text-xs flex-1" style={{ color: "var(--text-muted)" }}>
                    Áudio disponível no Premium
                </span>
                <Link href="/subscription" className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--gold)" }}>
                    Assinar
                    <Icon name="arrow-right" size={13} style={{ color: "var(--gold)" }} />
                </Link>
            </div>
        );
    }

    // Tempo de leitura estimado (~130 palavras/min).
    const words = [
        devotional.title, devotional.verse, devotional.reflection,
        devotional.practical_application, devotional.prayer, devotional.declaration,
        devotional.reflective_question,
    ].filter(Boolean).join(" ").split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 130));

    return (
        <div className="flex items-center gap-2.5">
            {/* Ouvir devocional (TTS) */}
            <button
                onClick={handleTTS}
                className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                style={{ background: speaking ? "rgba(247,201,122,0.10)" : "rgba(255,252,245,0.04)", border: `1px solid ${speaking ? "rgba(247,201,122,0.4)" : "var(--glass-border)"}` }}
            >
                <span
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ border: "1.5px solid rgba(247,201,122,0.5)", background: speaking ? "rgba(247,201,122,0.15)" : "transparent" }}
                >
                    <Icon name={speaking ? "pause" : "play"} size={16} style={{ color: "var(--gold)" }} />
                </span>
                <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate" style={{ color: "var(--cream)" }}>
                        {speaking ? "Parar leitura" : "Ouvir devocional"}
                    </span>
                    <span className="block text-xs" style={{ color: "var(--text-muted)" }}>{minutes} min</span>
                </span>
            </button>

            {/* Música ambiente — switch compacto */}
            <button
                onClick={handleAmbient}
                role="switch"
                aria-checked={ambient}
                aria-label="Música ambiente"
                title={ambient ? "Música ambiente ligada" : "Música ambiente"}
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl flex-shrink-0 transition-all"
                style={{ background: ambient ? "rgba(247,201,122,0.10)" : "rgba(255,252,245,0.04)", border: `1px solid ${ambient ? "rgba(247,201,122,0.4)" : "var(--glass-border)"}` }}
            >
                <Icon name="waves" size={18} style={{ color: ambient ? "var(--gold)" : "var(--text-secondary)" }} />
                <span
                    className="w-9 h-5 rounded-full relative transition-all duration-300"
                    style={{ background: ambient ? "var(--gradient-gold)" : "rgba(255,255,255,0.1)", border: `1px solid ${ambient ? "transparent" : "rgba(255,255,255,0.12)"}` }}
                >
                    <span
                        className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-300"
                        style={{ left: ambient ? "calc(100% - 17px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                    />
                </span>
            </button>
        </div>
    );
}
