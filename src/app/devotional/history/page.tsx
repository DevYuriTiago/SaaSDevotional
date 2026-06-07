import { createClient } from "@/lib/supabase/server";
import HistoryClient from "./HistoryClient";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: devotionals } = await supabase
        .from("devotionals")
        .select("id, title, emotion, verse_reference, is_saved, created_at")
        .eq("user_id", user.id)
        .or("emotion_category.is.null,emotion_category.not.like.journey:%")
        .order("created_at", { ascending: false })
        .limit(100);

    return <HistoryClient devotionals={devotionals ?? []} />;
}
