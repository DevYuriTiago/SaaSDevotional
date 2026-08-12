import { createClient } from "@supabase/supabase-js";
import FilaClient, { type Application } from "./FilaClient";

// A fila reflete o banco a cada visita: nada de cache entre decisões.
export const dynamic = "force-dynamic";

export default async function CuradoriaPage() {
    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: pending } = await admin
        .from("ambassadors")
        .select("id, name, email, whatsapp, social_platform, social_handle, followers_count, church, testimony, promotion_plan, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    const { data: recent } = await admin
        .from("ambassadors")
        .select("id, name, status, reviewed_at")
        .in("status", ["active", "rejected"])
        .order("reviewed_at", { ascending: false })
        .limit(8);

    return (
        <FilaClient
            pending={(pending ?? []) as Application[]}
            recent={(recent ?? []) as { id: string; name: string; status: string; reviewed_at: string | null }[]}
        />
    );
}
