import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const protectedRoutes = ["/dashboard", "/devotional", "/journal", "/journey", "/profile", "/onboarding", "/emotion", "/subscription"];
    const authRoutes = ["/login", "/signup"];
    const pathname = request.nextUrl.pathname;

    const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
    const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

    if (!user && isProtected) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (user && isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    // Value-first: o novo usuário gera e lê seu 1º devocional ANTES do onboarding.
    // Liberamos /emotion e /devotional; o onboarding é cobrado ao entrar no app
    // (dashboard, jornadas, perfil, etc.).
    const valueFirstExempt = ["/onboarding", "/emotion", "/devotional"];
    if (user && isProtected && !valueFirstExempt.some((r) => pathname.startsWith(r))) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", user.id)
            .single();

        if (profile && profile.onboarding_completed === false) {
            const url = request.nextUrl.clone();
            url.pathname = "/onboarding";
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
