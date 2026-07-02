"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { BrandMark, Icon } from "@/components/icons";
import Wordmark from "@/components/Wordmark";
import { track, getStoredUtm, EVENTS } from "@/lib/analytics/events";

const schema = z.object({
    name: z.string().min(2, "Nome muito curto"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();
    const [serverError, setServerError] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    async function onSubmit(data: FormData) {
        setServerError(null);
        const { data: signUpData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: { name: data.name },
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/emotion`,
            },
        });
        if (error) {
            setServerError(error.message);
            return;
        }
        if (signUpData.session) {
            await track(EVENTS.SIGNUP, { method: "email", ...getStoredUtm() });
            router.push("/emotion");
            router.refresh();
            return;
        }
        setEmailSent(true);
    }

    return (
        <main className="auth-glow relative min-h-dvh flex items-center justify-center px-6 py-12">
            {emailSent ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md text-center glass-strong rounded-3xl p-10"
                >
                    <span className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-2xl"
                        style={{ background: "rgba(247,201,122,0.12)", border: "1px solid var(--glass-border)" }}>
                        <Icon name="bell" size={28} style={{ color: "var(--gold)" }} />
                    </span>
                    <h2 className="font-display mb-3" style={{ color: "var(--cream)", fontSize: "1.5rem", fontWeight: 400 }}>
                        Verifique seu e-mail
                    </h2>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                        Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar sua conta e começar sua jornada.
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Não recebeu?{" "}
                        <button onClick={() => setEmailSent(false)} className="underline" style={{ color: "var(--gold)" }}>
                            Tentar novamente
                        </button>
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative z-10 w-full max-w-md"
                >
                    {/* Marca */}
                    <div className="text-center mb-9">
                        <Link href="/" className="inline-flex flex-col items-center gap-0 mb-5">
                            <BrandMark size={140} className="brand-emblem" />
                            <Wordmark className="brand-wordmark" priority />
                        </Link>
                        <p className="text-sm leading-relaxed px-4" style={{ color: "var(--text-secondary)" }}>
                            Comece sua jornada e receba direcionamentos<br className="hidden sm:block" /> personalizados para o momento que você vive.
                        </p>
                    </div>

                    {/* Card */}
                    <div
                        className="glass-strong rounded-3xl p-7"
                        style={{ border: "1px solid rgba(247,201,122,0.22)", boxShadow: "0 0 50px rgba(247,201,122,0.07), var(--shadow-card)" }}
                    >
                        <GoogleButton next="/emotion" label="Cadastrar com Google" />

                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>ou</span>
                            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Nome completo</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Icon name="user" size={18} style={{ color: "var(--text-muted)" }} />
                                    </span>
                                    <input
                                        {...register("name")}
                                        type="text"
                                        placeholder="Como você se chama?"
                                        className="input-base"
                                        style={{ paddingLeft: 46 }}
                                        autoComplete="name"
                                    />
                                </div>
                                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                            </div>

                            {/* E-mail */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>E-mail</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Icon name="mail" size={18} style={{ color: "var(--text-muted)" }} />
                                    </span>
                                    <input
                                        {...register("email")}
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="input-base"
                                        style={{ paddingLeft: 46 }}
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                            </div>

                            {/* Senha */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Senha</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Icon name="lock" size={18} style={{ color: "var(--text-muted)" }} />
                                    </span>
                                    <input
                                        {...register("password")}
                                        type={showPw ? "text" : "password"}
                                        placeholder="Crie uma senha segura"
                                        className="input-base"
                                        style={{ paddingLeft: 46, paddingRight: 46 }}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw((v) => !v)}
                                        aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                                    >
                                        <Icon name={showPw ? "eye-off" : "eye"} size={18} style={{ color: "var(--text-muted)" }} />
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                            </div>

                            {serverError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-3"
                                >
                                    {serverError}
                                </motion.p>
                            )}

                            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-4">
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                                        Criando conta...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Icon name="sparkle" size={18} />
                                        Criar minha conta gratuita
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Confiança (dentro do card) */}
                        <div className="flex items-center justify-center gap-2 mt-5 text-center">
                            <Icon name="shield" size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Seus dados estão protegidos e nunca serão compartilhados.
                            </p>
                        </div>
                    </div>

                    {/* Já tem conta */}
                    <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
                        Já tem uma conta?{" "}
                        <Link href="/login" className="font-semibold inline-flex items-center gap-1" style={{ color: "var(--gold)" }}>
                            Fazer login <Icon name="arrow-right" size={14} />
                        </Link>
                    </p>
                </motion.div>
            )}
        </main>
    );
}
