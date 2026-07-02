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

    const [devResult, journalResult, datesResult, journeysResult] = await Promise.all([
        supabase.from("devotionals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("journal_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("devotionals").select("created_at").eq("user_id", user.id),
        supabase.from("journey_plans").select("slug, journey_days(count)").eq("user_id", user.id),
    ]);

    const activeDates = (datesResult.data ?? []).map((r: { created_at: string }) => r.created_at);

    // Jornada ativa = primeira com menos de 21 dias concluídos.
    const journeyRows = (journeysResult.data ?? []) as { slug: string; journey_days: { count: number }[] }[];
    const activeJourney =
        journeyRows
            .map((p) => ({ slug: p.slug, completedDays: p.journey_days?.[0]?.count ?? 0 }))
            .find((p) => p.completedDays < 21) ?? null;

    return (
        <DashboardClient
            profile={profileData}
            devotionals={devResult.data ?? []}
            journalEntries={journalResult.data ?? []}
            activeDates={activeDates}
            activeJourney={activeJourney}
        />
    );
}
