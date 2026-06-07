"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
    email: z.string().email("E-mail inválido"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const [sent, setSent] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    async function onSubmit(data: FormData) {
        setServerError(null);
        const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
            redirectTo,
        });
        if (error) {
            setServerError("Não foi possível enviar o e-mail. Tente novamente.");
            return;
        }
        setSent(true);
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
                    <Link href="/login" className="inline-flex items-center gap-2 mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
                        <ArrowLeft size={16} />
                        Voltar ao login
                    </Link>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                        style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.25)" }}>
                        <Mail size={28} style={{ color: "var(--brand-purple)" }} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                        Recuperar senha
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Enviaremos um link para você criar uma nova senha
                    </p>
                </div>

                <div className="glass-strong rounded-3xl p-8">
                    <AnimatePresence mode="wait">
                        {sent ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-4"
                            >
                                <div className="text-5xl mb-4">📬</div>
                                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                                    E-mail enviado!
                                </h2>
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    Enviamos um link para{" "}
                                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                                        {getValues("email")}
                                    </span>
                                    . Verifique também a caixa de spam.
                                </p>
                                <Link href="/login" className="btn-primary mt-4 flex items-center justify-center">
                                    Voltar ao login
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-5"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                        E-mail da sua conta
                                    </label>
                                    <input
                                        {...register("email")}
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="input-base"
                                        autoComplete="email"
                                        autoFocus
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
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
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enviando...
                                        </span>
                                    ) : (
                                        "Enviar link de recuperação"
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </main>
    );
}
