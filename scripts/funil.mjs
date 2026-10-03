// Raio-x do funil, só com números agregados (nenhum dado pessoal sai daqui).
//
//   node --env-file=.env.local scripts/funil.mjs
//
// Responde a pergunta que separa "preciso de mais gente" de "preciso consertar
// o que acontece depois que a pessoa chega".

import { createClient } from "@supabase/supabase-js";

const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LIMITE_GRATIS = 7;

function barra(n, total, largura = 28) {
    if (!total) return "";
    const cheio = Math.round((n / total) * largura);
    return "#".repeat(cheio) + ".".repeat(largura - cheio);
}

function pct(n, total) {
    return total > 0 ? `${((n / total) * 100).toFixed(1)}%` : "0%";
}

const { data: perfis, error } = await db
    .from("profiles")
    .select("id, created_at, onboarding_completed, devotionals_used, total_devotionals, subscription_tier, subscription_status, premium_until");

if (error) {
    console.error("Falha ao ler profiles:", error.message);
    process.exit(1);
}

const total = perfis.length;
const onboardados = perfis.filter((p) => p.onboarding_completed).length;
const geraram = perfis.filter((p) => (p.total_devotionals ?? 0) > 0).length;
const geraram2mais = perfis.filter((p) => (p.total_devotionals ?? 0) >= 2).length;
const bateramLimite = perfis.filter((p) => (p.devotionals_used ?? 0) >= LIMITE_GRATIS).length;
const premium = perfis.filter((p) => p.subscription_tier === "premium").length;

console.log("\n==================== FUNIL ====================\n");
const etapas = [
    ["cadastraram", total],
    ["concluíram onboarding", onboardados],
    ["geraram 1º devocional", geraram],
    ["voltaram (2 ou mais)", geraram2mais],
    [`bateram o limite grátis (${LIMITE_GRATIS})`, bateramLimite],
    ["assinaram", premium],
];
for (const [rotulo, n] of etapas) {
    console.log(`${String(n).padStart(4)}  ${barra(n, total)}  ${rotulo}  (${pct(n, total)})`);
}

console.log("\n============ ONDE ESTÁ O VAZAMENTO ============\n");
const quedas = [
    ["cadastro -> onboarding", total, onboardados],
    ["onboarding -> 1º devocional", onboardados, geraram],
    ["1º devocional -> voltar", geraram, geraram2mais],
    ["voltar -> bater o limite", geraram2mais, bateramLimite],
    ["bater o limite -> assinar", bateramLimite, premium],
];
for (const [rotulo, de, para] of quedas) {
    const perdeu = de - para;
    console.log(`${rotulo.padEnd(30)} ${String(para).padStart(3)}/${String(de).padEnd(3)}  passou ${pct(para, de).padStart(6)}  (perdeu ${perdeu})`);
}

// Distribuição de uso: mostra se as pessoas chegam perto do paywall
const faixas = { "0": 0, "1": 0, "2 a 3": 0, "4 a 6": 0, "7 ou mais": 0 };
for (const p of perfis) {
    const n = p.total_devotionals ?? 0;
    if (n === 0) faixas["0"]++;
    else if (n === 1) faixas["1"]++;
    else if (n <= 3) faixas["2 a 3"]++;
    else if (n <= 6) faixas["4 a 6"]++;
    else faixas["7 ou mais"]++;
}
console.log("\n======= QUANTOS DEVOCIONAIS CADA UM GEROU ======\n");
for (const [faixa, n] of Object.entries(faixas)) {
    console.log(`${faixa.padEnd(10)} ${String(n).padStart(4)}  ${barra(n, total)}`);
}

// Ritmo de cadastro nas últimas semanas
const agora = Date.now();
const DIA = 86400000;
const janelas = [[7, "últimos 7 dias"], [30, "últimos 30 dias"], [90, "últimos 90 dias"]];
console.log("\n============== RITMO DE CADASTRO ==============\n");
for (const [dias, rotulo] of janelas) {
    const n = perfis.filter((p) => agora - new Date(p.created_at).getTime() <= dias * DIA).length;
    console.log(`${rotulo.padEnd(18)} ${String(n).padStart(4)}  (${(n / dias).toFixed(1)} por dia)`);
}

// Eventos registrados, se houver
const { data: eventos } = await db.from("analytics_events").select("event");
if (eventos?.length) {
    const contagem = {};
    for (const e of eventos) contagem[e.event] = (contagem[e.event] ?? 0) + 1;
    console.log("\n================== EVENTOS ===================\n");
    for (const [ev, n] of Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 12)) {
        console.log(`${String(n).padStart(5)}  ${ev}`);
    }
} else {
    console.log("\n(sem eventos registrados em analytics_events)");
}

console.log("");
