import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { captureAttribution } from "@/lib/ambassadors/attribution";

const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Dispara 1x no onboarding. O cookie hmn_ref é httpOnly → lido AQUI no servidor.
export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const cookieStore = await cookies();
    const hmnRef = cookieStore.get("hmn_ref")?.value ?? null;

    const result = await captureAttribution(admin, user.id, hmnRef);
    return NextResponse.json(result);
}
