import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Garante que o perfil existe (cobre usuários criados antes da migration)
    let { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (!profileData) {
        const { data: created } = await supabase
            .from("profiles")
            .upsert({ id: user.id, name: user.user_metadata?.name ?? null })
            .select()
            .single();
        profileData = created;
    }

    const [devResult, journalResult] = await Promise.all([
        supabase.from("devotionals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("journal_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    ]);

    return (
        <DashboardClient
            profile={profileData}
            devotionals={devResult.data ?? []}
            journalEntries={journalResult.data ?? []}
        />
    );
}
