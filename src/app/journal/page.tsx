import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JournalClient from "./JournalClient";

export default async function JournalPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: entries } = await supabase
        .from("journal_entries")
        .select("*, devotionals(title, emotion, verse_reference)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return <JournalClient entries={entries ?? []} />;
}
