import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashIp } from "@/lib/ambassadors/hash";
import { assessClick, DEDUPE_WINDOW_MINUTES } from "@/lib/ambassadors/click-guard";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COOKIE = "hmn_ref";
const NINETY_DAYS = 60 * 60 * 24 * 90;

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
    const { slug } = await ctx.params;
    const home = new URL("/", req.url);

    const { data: link } = await admin
        .from("ambassador_links")
        .select("id, destination, active")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();

    // Slug inexistente/inativo: redireciona pra home sem vazar nada.
    if (!link) return NextResponse.redirect(home);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ipHash = hashIp(ip);

    // Já houve clique deste IP neste link na janela recente?
    let hasRecentClick = false;
    if (ipHash) {
        const desde = new Date(Date.now() - DEDUPE_WINDOW_MINUTES * 60_000).toISOString();
        const { data: recente } = await admin
            .from("link_clicks")
            .select("id")
            .eq("link_id", link.id)
            .eq("ip_hash", ipHash)
            .gte("clicked_at", desde)
            .maybeSingle();
        hasRecentClick = Boolean(recente);
    }

    const verdict = assessClick({
        secFetchDest: req.headers.get("sec-fetch-dest"),
        hasRecentClick,
    });

    // Suspeitos são gravados com o motivo em vez de descartados: mantém o
    // rastro para perícia, e a view não conta o que tem blocked_reason.
    await admin.from("link_clicks").insert({
        link_id: link.id,
        ip_hash: ipHash,
        country: req.headers.get("x-vercel-ip-country") ?? null,
        device: req.headers.get("user-agent")?.slice(0, 255) ?? null,
        referrer: req.headers.get("referer") ?? null,
        blocked_reason: verdict.countClick ? null : verdict.reason,
    });

    // O redirecionamento acontece sempre, inclusive para o atacante: não
    // revelamos que a defesa existe nem prendemos ninguém numa tela de erro.
    const dest = new URL(link.destination || "/", req.url);
    const res = NextResponse.redirect(dest);

    if (verdict.setCookie) {
        res.cookies.set(COOKIE, link.id, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: NINETY_DAYS,
            path: "/",
        });
    }
    return res;
}
