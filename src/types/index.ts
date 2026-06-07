// -----------------------------------------------
// DOMAIN ENTITIES
// -----------------------------------------------

export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    subscription_tier: "free" | "premium";
    devotionals_used: number;
    streak_days: number;
    total_devotionals: number;
    onboarding_completed: boolean;
    night_mode_preference: boolean;
    created_at: string;
}

export interface EmotionCategory {
    id: string;
    label: string;
    emoji: string;
    color: string;
    description: string;
    sub_emotions?: string[];
}

export interface Devotional {
    id: string;
    user_id: string;
    emotion: string;
    emotion_raw: string;
    title: string;
    verse: string;
    verse_reference: string;
    reflection: string;
    practical_application: string;
    prayer: string;
    declaration: string;
    reflective_question: string;
    is_saved: boolean;
    created_at: string;
}

export interface JournalEntry {
    id: string;
    user_id: string;
    devotional_id: string | null;
    content: string;
    emotion: string | null;
    created_at: string;
}

export interface Journey {
    id: string;
    slug: string;
    title: string;
    description: string;
    theme: string;
    total_days: number;
    cover_emoji: string;
}

export interface UserJourney {
    id: string;
    user_id: string;
    journey_id: string;
    current_day: number;
    completed: boolean;
    started_at: string;
    journey?: Journey;
}

export interface Achievement {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: string;
    unlocked_at?: string;
}

// -----------------------------------------------
// SUBSCRIPTION
// -----------------------------------------------

export type SubscriptionTier = "free" | "premium";

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: "month" | "year";
    features: string[];
}

// -----------------------------------------------
// AI / EMOTION ENGINE
// -----------------------------------------------

export interface EmotionAnalysis {
    primary_emotion: string;
    intensity: "low" | "medium" | "high";
    spiritual_context: string;
    biblical_themes: string[];
    recommended_tone: string;
}

export interface DevotionalGenerationInput {
    user_id: string;
    emotion_raw: string;
    emotion_analysis: EmotionAnalysis;
    user_name?: string | null;
}

export interface DevotionalContent {
    title: string;
    verse: string;
    verse_reference: string;
    reflection: string;
    practical_application: string;
    prayer: string;
    declaration: string;
    reflective_question: string;
}

// -----------------------------------------------
// UI STATE
// -----------------------------------------------

export interface ToastMessage {
    id: string;
    type: "success" | "error" | "info";
    title: string;
    description?: string;
}
