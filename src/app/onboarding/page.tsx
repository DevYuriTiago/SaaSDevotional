"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BrandMark, Icon } from "@/components/icons";
import { compressAvatar } from "@/lib/image";
import { toast } from "@/store";

const TOTAL_STEPS = 3;
// Generoso: a foto é comprimida no navegador antes de subir (fotos de celular
// modernas passam fácil de 10 MB). Este limite é só sanidade.
const MAX_PHOTO_MB = 25;

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const fileRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Pré-preenche com o nome que já temos (cadastro ou Google) — o usuário
    // pode trocar para como prefere ser chamado (ex.: conta profissional).
    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase
                .from("profiles")
                .select("name, avatar_url")
                .eq("id", user.id)
                .maybeSingle();
            const current = (profile?.name as string) ?? (user.user_metadata?.name as string) ?? "";
            // Só o primeiro nome: é assim que a gente vai te chamar.
            setName(current.split(" ")[0] ?? "");
            if (profile?.avatar_url) setPhotoPreview(profile.avatar_url as string);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Captura de embaixador (first-touch): o servidor lê o cookie httpOnly hmn_ref.
    // Fire-and-forget e idempotente — roda 1x quando o usuário novo chega no onboarding.
    useEffect(() => {
        fetch("/api/ambassador/attach", { method: "POST" }).catch(() => {});
    }, []);

    function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast({ type: "error", title: "Formato não suportado", description: "Escolha uma imagem (JPG, PNG…)." });
            return;
        }
        if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
            toast({ type: "error", title: "Imagem muito grande", description: `O limite é ${MAX_PHOTO_MB} MB.` });
            return;
        }
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    }

    async function finish() {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }

            let avatarUrl: string | null = null;
            if (photoFile) {
                // Recorta + comprime no navegador: qualquer foto de celular vira ~80 KB.
                let upload: Blob = photoFile;
                try { upload = await compressAvatar(photoFile); } catch { /* sobe o original */ }
                const path = `${user.id}/avatar.jpg`;
                const { error: upErr } = await supabase.storage
                    .from("avatars")
                    .upload(path, upload, { upsert: true, cacheControl: "3600", contentType: "image/jpeg" });
                if (upErr) {
                    // A foto é um bônus — nunca deve travar o onboarding.
                    console.warn("[onboarding] upload da foto falhou:", upErr.message);
                    toast({ type: "info", title: "Não consegui salvar a foto agora", description: "Você pode adicionar depois no seu perfil." });
                } else {
                    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
                    // cache-buster: a URL é a mesma quando troca a foto
                    avatarUrl = `${pub.publicUrl}?v=${Date.now()}`;
                }
            }

            const cleanName = name.trim();
            await supabase
                .from("profiles")
                .update({
                    onboarding_completed: true,
                    ...(cleanName ? { name: cleanName } : {}),
                    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
                })
                .eq("id", user.id);

            router.push("/emotion");
            router.refresh();
        } catch {
            toast({ type: "error", title: "Algo deu errado", description: "Tente novamente em instantes." });
            setLoading(false);
        }
    }

    const firstName = name.trim().split(" ")[0];
    const canAdvance = step !== 1 || name.trim().length >= 2;

    return (
        <main className="aurora-bg relative min-h-dvh flex items-center justify-center px-6 py-8 overflow-hidden">
            <div className="relative z-10 w-full max-w-md">
                {/* Progresso */}
                <div className="flex gap-2 mb-10 justify-center">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <div
                            key={i}
                            className="h-1 rounded-full transition-all duration-500"
                            style={{
                                width: i === step ? 30 : 8,
                                background: i <= step ? "var(--gold)" : "var(--glass-border)",
                            }}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -18 }}
                        transition={{ duration: 0.4 }}
                        className="text-center"
                    >
                        {/* ── 0. Acolhimento — o que acabou de acontecer ── */}
                        {step === 0 && (
                            <>
                                <BrandMark size={72} className="mx-auto mb-6" style={{ filter: "drop-shadow(0 0 26px rgba(247,201,122,0.3))" }} />
                                <h1 className="font-display leading-tight mb-4" style={{ color: "var(--cream)", fontSize: "clamp(1.8rem, 6.5vw, 2.3rem)", fontWeight: 400 }}>
                                    Que bom ter você <span style={{ fontStyle: "italic", color: "var(--gold)" }}>aqui</span>.
                                </h1>
                                <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                    A partir de hoje você não precisa abrir a Bíblia sem saber por onde começar.
                                    Diga o que está sentindo e receba uma <strong style={{ color: "var(--cream)" }}>Palavra viva</strong>,
                                    escolhida para o momento que você está vivendo.
                                </p>
                            </>
                        )}

                        {/* ── 1. Personalização — nome e foto ── */}
                        {step === 1 && (
                            <>
                                <h1 className="font-display leading-tight mb-3" style={{ color: "var(--cream)", fontSize: "clamp(1.7rem, 6vw, 2.1rem)", fontWeight: 400 }}>
                                    Como você gostaria de <span style={{ fontStyle: "italic", color: "var(--gold)" }}>ser chamado</span>?
                                </h1>
                                <p className="text-sm leading-relaxed mb-7" style={{ color: "var(--text-secondary)" }}>
                                    É assim que vou te chamar nos seus devocionais e orações.
                                    Pode ser o apelido que quem te ama usa.
                                </p>

                                {/* Foto (opcional) */}
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="relative mx-auto mb-3 block rounded-full"
                                    aria-label="Escolher foto de perfil"
                                >
                                    <span
                                        className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                                        style={{
                                            background: photoPreview ? "transparent" : "rgba(247,201,122,0.10)",
                                            border: "1.5px solid rgba(247,201,122,0.35)",
                                        }}
                                    >
                                        {photoPreview ? (
                                            <Image src={photoPreview} alt="" width={96} height={96} className="w-24 h-24 object-cover" unoptimized />
                                        ) : (
                                            <Icon name="user" size={30} style={{ color: "var(--gold)" }} />
                                        )}
                                    </span>
                                    <span
                                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center"
                                        style={{ background: "var(--gradient-gold)", color: "#2A1E08", boxShadow: "var(--shadow-button)" }}
                                    >
                                        <Icon name="plus" size={16} strokeWidth={2.2} />
                                    </span>
                                </button>
                                <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
                                    {photoPreview ? "Toque para trocar a foto" : "Se quiser, coloque um rosto nessa caminhada (opcional)"}
                                </p>
                                <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} className="hidden" />

                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome ou apelido"
                                    className="input-base text-center"
                                    maxLength={40}
                                    autoComplete="given-name"
                                />
                            </>
                        )}

                        {/* ── 2. Promessa — o hábito que começa ── */}
                        {step === 2 && (
                            <>
                                <div
                                    className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                                    style={{ background: "rgba(247,201,122,0.10)", border: "1px solid rgba(247,201,122,0.3)" }}
                                >
                                    <Icon name="sunrise" size={30} style={{ color: "var(--gold)" }} />
                                </div>
                                <h1 className="font-display leading-tight mb-4" style={{ color: "var(--cream)", fontSize: "clamp(1.8rem, 6.5vw, 2.3rem)", fontWeight: 400 }}>
                                    {firstName ? `${firstName}, sua caminhada` : "Sua caminhada"} <span style={{ fontStyle: "italic", color: "var(--gold)" }}>começa agora</span>.
                                </h1>
                                <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                    Como o maná no deserto: uma Palavra <strong style={{ color: "var(--cream)" }}>fresca a cada manhã</strong>,
                                    feita para o que você vive. Vamos receber a primeira agora?
                                </p>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Ações */}
                <div className="mt-9">
                    {step < TOTAL_STEPS - 1 ? (
                        <button
                            onClick={() => setStep((s) => s + 1)}
                            disabled={!canAdvance}
                            className="btn-primary w-full justify-center"
                        >
                            Continuar
                            <Icon name="arrow-right" size={18} strokeWidth={1.8} />
                        </button>
                    ) : (
                        <button onClick={finish} disabled={loading} className="btn-primary w-full justify-center">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                                    Preparando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Icon name="sparkle" size={18} />
                                    Receber minha primeira Palavra
                                </span>
                            )}
                        </button>
                    )}

                    {step > 0 && !loading && (
                        <button
                            onClick={() => setStep((s) => s - 1)}
                            className="w-full text-center text-xs mt-4 py-2"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Voltar
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
