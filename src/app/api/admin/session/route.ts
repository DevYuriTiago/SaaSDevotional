import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, deriveAdminToken, verifyAdminSecret } from "@/lib/admin/auth";

const TWELVE_HOURS = 60 * 60 * 12;

// Abre a sessão do painel admin. O cookie leva um token derivado do segredo,
// nunca o segredo em si.
export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => ({}))) as { secret?: string };
    const secret = typeof body.secret === "string" ? body.secret : "";

    if (!verifyAdminSecret(secret)) {
        return NextResponse.json({ ok: false, error: "Senha incorreta." }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, deriveAdminToken(secret), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: TWELVE_HOURS,
        path: "/",
    });
    return res;
}

export async function DELETE() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 0, path: "/" });
    return res;
}
