"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/icons";

const PLATFORMS = [
    { value: "instagram", label: "Instagram" },
    { value: "youtube", label: "YouTube" },
    { value: "tiktok", label: "TikTok" },
    { value: "outro", label: "Outro" },
];

type Status = "idle" | "sending" | "done" | "error";

export default function ApplyForm() {
    const [status, setStatus] = useState<Status>("idle");
    const [errors, setErrors] = useState<Record<string, string>>({});

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (status === "sending") return;
        setStatus("sending");
        setErrors({});

        const fd = new FormData(e.currentTarget);
        const payload = {
            name: fd.get("name"),
            email: fd.get("email"),
            whatsapp: fd.get("whatsapp"),
            social_platform: fd.get("social_platform"),
            social_handle: fd.get("social_handle"),
            followers_count: Number(fd.get("followers_count")),
            church: fd.get("church"),
            testimony: fd.get("testimony"),
            promotion_plan: fd.get("promotion_plan"),
            website: fd.get("website"), // honeypot
        };

        try {
            const res = await fetch("/api/ambassador/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (res.ok && json.ok) {
                setStatus("done");
            } else if (res.status === 422 && json.errors) {
                setErrors(json.errors);
                setStatus("idle");
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    }

    if (status === "done") {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
                className="surface-wood rounded-[28px] p-10 sm:p-14 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(247,201,122,0.12)", border: "1px solid rgba(247,201,122,0.35)" }}>
                    <Icon name="check" size={28} style={{ color: "var(--gold)" }} />
                </div>
                <h3 className="font-display text-2xl mb-3" style={{ color: "var(--cream)", fontWeight: 500 }}>
                    Inscrição recebida.
                </h3>
                <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
                    Lemos cada história, uma a uma. Você receberá o nosso retorno
                    em até <strong style={{ color: "var(--cream)" }}>7 dias</strong>, no e-mail informado.
                </p>
            </motion.div>
        );
    }

    const err = (field: string) =>
        errors[field] ? <p className="text-xs mt-1.5" style={{ color: "var(--amber)" }}>{errors[field]}</p> : null;

    return (
        <form onSubmit={onSubmit} className="surface-wood rounded-[28px] p-7 sm:p-10" noValidate>
            {/* honeypot — invisível para humanos; bot que preencher é descartado */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                className="absolute opacity-0 pointer-events-none h-0 w-0" />

            <div className="grid sm:grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-muted)" }}>Seu nome *</label>
                    <input name="name" className="input-base" placeholder="Nome completo" maxLength={80} required />
                    {err("name")}
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-muted)" }}>E-mail *</label>
                    <input name="email" type="email" className="input-base" placeholder="voce@email.com" maxLength={120} required />
                    {err("email")}
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-muted)" }}>WhatsApp *</label>
                    <input name="whatsapp" className="input-base" placeholder="(11) 91234-5678" maxLength={20} required />
                    {err("whatsapp")}
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-muted)" }}>Plataforma principal *</label>
                    <select name="social_platform" className="input-base" defaultValue="instagram" required>
                        {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    {err("social_platform")}
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-muted)" }}>Seu @ ou canal *</label>
                    <input name="social_handle" className="input-base" placeholder="@seuperfil" maxLength={80} required />
                    {err("social_handle")}
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-muted)" }}>Seguidores (aprox.) *</label>
                    <input name="followers_count" type="number" min={0} step={1} className="input-base" placeholder="Ex.: 12000" required />
                    {err("followers_count")}
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-muted)" }}>Igreja ou ministério <span className="normal-case tracking-normal">(opcional)</span></label>
                    <input name="church" className="input-base" placeholder="Onde você congrega ou serve" maxLength={120} />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-muted)" }}>Sua caminhada com Cristo *</label>
                    <textarea name="testimony" rows={4} className="input-base resize-none" style={{ height: "auto" }}
                        placeholder="Conte um pouco da sua história de fé. É a parte que lemos com mais carinho." maxLength={2000} required />
                    {err("testimony")}
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-muted)" }}>Como pretende divulgar? <span className="normal-case tracking-normal">(opcional)</span></label>
                    <textarea name="promotion_plan" rows={2} className="input-base resize-none" style={{ height: "auto" }}
                        placeholder="Stories, cultos, grupos, células…" maxLength={1000} />
                </div>
            </div>

            {status === "error" && (
                <p className="text-sm mt-5 text-center" style={{ color: "var(--amber)" }}>
                    Não foi possível enviar agora. Tente novamente em instantes.
                </p>
            )}

            <button type="submit" disabled={status === "sending"} className="btn-primary w-full justify-center mt-7" style={{ height: 56 }}>
                {status === "sending" ? (
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                        Enviando...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Icon name="feather" size={18} /> Enviar minha inscrição
                    </span>
                )}
            </button>
            <p className="text-[11px] text-center mt-3" style={{ color: "var(--text-muted)" }}>
                Curadoria manual · retorno em até 7 dias · seus dados ficam protegidos (LGPD)
            </p>
        </form>
    );
}
