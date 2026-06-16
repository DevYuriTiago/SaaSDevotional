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
import { BrandMark } from "@/components/icons";

const schema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [serverError, setServerError] = useState<string | null>(null);

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
        <main className="relative min-h-dvh flex items-center justify-center px-6 py-12">

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Marca */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex flex-col items-center gap-3 mb-6">
                        <BrandMark size={48} />
                        <span className="font-display text-lg" style={{ color: "var(--cream)", fontWeight: 500 }}>Sentindo Hoje</span>
                    </Link>
                    <h1 className="font-display mb-2" style={{ color: "var(--cream)", fontSize: "1.6rem", fontWeight: 400, letterSpacing: "-0.01em" }}>Bem-vindo de volta</h1>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Continue sua jornada espiritual
                    </p>
                </div>

                <div className="glass-strong rounded-3xl p-8">
                    <GoogleButton next="/dashboard" label="Entrar com Google" />

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>ou</span>
                        <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                                    Senha
                                </label>
                                <Link href="/forgot-password" className="text-xs" style={{ color: "var(--gold)" }}>
                                    Esqueci minha senha
                                </Link>
                            </div>
                            <input
                                {...register("password")}
                                type="password"
                                placeholder="••••••••"
                                className="input-base"
                                autoComplete="current-password"
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
                                    Entrando...
                                </span>
                            ) : (
                                "Entrar"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Não tem conta?{" "}
                            <Link href="/signup" className="font-medium" style={{ color: "var(--gold)" }}>
                                Criar gratuitamente
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
