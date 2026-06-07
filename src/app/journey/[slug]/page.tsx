import { JOURNEY_THEMES } from "@/lib/constants";
import JourneySlugClient from "./JourneySlugClient";
import { notFound } from "next/navigation";

export function generateStaticParams() {
    return JOURNEY_THEMES.map((t) => ({ slug: t.slug }));
}

export default async function JourneySlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const theme = JOURNEY_THEMES.find((t) => t.slug === slug);
    if (!theme) notFound();
    return <JourneySlugClient slug={slug} />;
}
