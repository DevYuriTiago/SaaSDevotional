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

const schema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPw, setShowPw] = useState(false);
    const [remember, setRemember] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    async function onSubmit(data: FormData) {
        setServerError(null);
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });
        if (error) {
            setServerError("E-mail ou senha incorretos.");
            return;
        }
        router.push("/dashboard");
        router.refresh();
    }

    return (
        <main className="auth-glow relative min-h-dvh flex items-center justify-center px-6 py-12">
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
                        Faça login para continuar sua jornada<br className="hidden sm:block" /> e receber direcionamentos personalizados.
                    </p>
                </div>

                {/* Card */}
                <div
                    className="glass-strong rounded-3xl p-7"
                    style={{ border: "1px solid rgba(247,201,122,0.22)", boxShadow: "0 0 50px rgba(247,201,122,0.07), var(--shadow-card)" }}
                >
                    <GoogleButton next="/dashboard" label="Entrar com Google" />

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>ou</span>
                        <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                                    placeholder="••••••••"
                                    className="input-base"
                                    style={{ paddingLeft: 46, paddingRight: 46 }}
                                    autoComplete="current-password"
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

                        {/* Lembrar + esqueci */}
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={remember}
                                onClick={() => setRemember((v) => !v)}
                                className="flex items-center gap-2 text-sm"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                <span
                                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                                    style={{
                                        border: remember ? "none" : "1px solid var(--glass-border)",
                                        background: remember ? "var(--gradient-gold)" : "transparent",
                                    }}
                                >
                                    {remember && <Icon name="check" size={13} style={{ color: "#2A1E08" }} strokeWidth={2.5} />}
                                </span>
                                Lembrar de mim
                            </button>
                            <Link href="/forgot-password" className="text-xs" style={{ color: "var(--gold)" }}>
                                Esqueci minha senha
                            </Link>
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
                                    Entrando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Icon name="sparkle" size={18} />
                                    Entrar na minha conta
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Criar conta */}
                <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
                    Ainda não tem uma conta?{" "}
                    <Link href="/signup" className="font-semibold inline-flex items-center gap-1" style={{ color: "var(--gold)" }}>
                        Criar conta gratuita <Icon name="arrow-right" size={14} />
                    </Link>
                </p>

                {/* Confiança */}
                <div className="flex items-center justify-center gap-2 mt-6 px-4 text-center">
                    <Icon name="shield" size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Seus dados estão protegidos e nunca serão compartilhados.
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
