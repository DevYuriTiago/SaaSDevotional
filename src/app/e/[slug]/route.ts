import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashIp } from "@/lib/ambassadors/hash";

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

    // Registra o clique (IP hasheado — LGPD).
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    await admin.from("link_clicks").insert({
        link_id: link.id,
        ip_hash: hashIp(ip),
        country: req.headers.get("x-vercel-ip-country") ?? null,
        device: req.headers.get("user-agent")?.slice(0, 255) ?? null,
        referrer: req.headers.get("referer") ?? null,
    });

    const dest = new URL(link.destination || "/", req.url);
    const res = NextResponse.redirect(dest);
    res.cookies.set(COOKIE, link.id, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: NINETY_DAYS,
        path: "/",
    });
    return res;
}
