"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BrandMark, Icon } from "@/components/icons";

const schema = z
    .object({
        password: z.string().min(6, "Mínimo de 6 caracteres"),
        confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, {
        message: "As senhas não coincidem",
        path: ["confirm"],
    });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
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
        const { error } = await supabase.auth.updateUser({ password: data.password });
        if (error) {
            setServerError("Não foi possível atualizar a senha. O link pode ter expirado.");
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
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex flex-col items-center gap-3 mb-6">
                        <BrandMark size={48} />
                        <span className="font-display text-lg" style={{ color: "var(--cream)", fontWeight: 500 }}>Sentindo Hoje</span>
                    </Link>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                        style={{ background: "rgba(247,201,122,0.12)", border: "1px solid var(--glass-border)" }}>
                        <Icon name="lock" size={28} style={{ color: "var(--gold)" }} />
                    </div>
                    <h1 className="font-display mb-2" style={{ color: "var(--cream)", fontSize: "1.6rem", fontWeight: 400, letterSpacing: "-0.01em" }}>
                        Nova senha
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Escolha uma senha segura para sua conta
                    </p>
                </div>

                <div className="glass-strong rounded-3xl p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                Nova senha
                            </label>
                            <input
                                {...register("password")}
                                type="password"
                                placeholder="••••••••"
                                className="input-base"
                                autoComplete="new-password"
                                autoFocus
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                Confirmar senha
                            </label>
                            <input
                                {...register("confirm")}
                                type="password"
                                placeholder="••••••••"
                                className="input-base"
                                autoComplete="new-password"
                            />
                            {errors.confirm && (
                                <p className="mt-1 text-xs text-red-400">{errors.confirm.message}</p>
                            )}
                        </div>

                        {serverError && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-3">
                                    {serverError}
                                </p>
                                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                                    Solicite um{" "}
                                    <Link href="/forgot-password" style={{ color: "var(--gold)" }}>
                                        novo link de recuperação
                                    </Link>
                                </p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full justify-center py-4"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                                    Salvando...
                                </span>
                            ) : (
                                "Salvar nova senha"
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </main>
    );
}
