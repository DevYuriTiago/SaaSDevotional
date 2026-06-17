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
        // Se sessão já foi criada (confirmação de e-mail desativada no Supabase)
        if (signUpData.session) {
            await track(EVENTS.SIGNUP, { method: "email", ...getStoredUtm() });
            // Value-first: leva direto à 1ª geração; onboarding vem depois.
            router.push("/emotion");
            router.refresh();
            return;
        }
        // Confirmação de e-mail ativada — mostra mensagem
        setEmailSent(true);
    }

    return (
        <main className="relative min-h-dvh flex items-center justify-center px-6 py-12">

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
                        <button
                            onClick={() => setEmailSent(false)}
                            className="underline"
                            style={{ color: "var(--gold)" }}
                        >
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
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-flex flex-col items-center gap-3 mb-6">
                            <BrandMark size={48} />
                            <span className="font-display text-lg" style={{ color: "var(--cream)", fontWeight: 500 }}>Sentindo Hoje</span>
                        </Link>
                        <h1 className="font-display mb-2" style={{ color: "var(--cream)", fontSize: "1.6rem", fontWeight: 400, letterSpacing: "-0.01em" }}>Comece sua jornada</h1>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            Seus 7 primeiros devocionais são gratuitos
                        </p>
                    </div>

                    <div className="glass-strong rounded-3xl p-8">
                        <GoogleButton next="/emotion" label="Continuar com Google" />

                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>ou</span>
                            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                    Seu nome
                                </label>
                                <input
                                    {...register("name")}
                                    type="text"
                                    placeholder="Como você se chama?"
                                    className="input-base"
                                    autoComplete="name"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                    E-mail
                                </label>
                                <input
                                    {...register("email")}
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="input-base"
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                    Senha
                                </label>
                                <input
                                    {...register("password")}
                                    type="password"
                                    placeholder="••••••••"
                                    className="input-base"
                                    autoComplete="new-password"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                                )}
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

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full justify-center py-4"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                                        Criando conta...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Icon name="sparkle" size={18} />
                                        Criar conta gratuita
                                    </span>
                                )}
                            </button>
                        </form>

                        <p className="mt-4 text-xs text-center" style={{ color: "var(--text-muted)" }}>
                            Ao criar, você concorda com nossos termos de uso.
                        </p>

                        <div className="mt-6 text-center">
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                Já tem conta?{" "}
                                <Link href="/login" className="font-medium" style={{ color: "var(--gold)" }}>
                                    Entrar
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </main>
    );
}
