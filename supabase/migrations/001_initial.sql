-- =============================================
-- Sentindo Hoje — Supabase Initial Migration
-- =============================================

-- =============================================
-- PROFILES
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free','premium')),
  devotionals_used integer not null default 0,
  total_devotionals integer not null default 0,
  streak_days integer not null default 0,
  last_devotional_date date,
  onboarding_completed boolean not null default false,
  night_mode_preference boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- DEVOTIONALS
-- =============================================
create table public.devotionals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  emotion text not null,
  emotion_raw text not null,
  emotion_category text,
  emotion_intensity integer,
  title text not null,
  verse text not null,
  verse_reference text not null,
  reflection text not null,
  practical_application text not null,
  prayer text not null,
  declaration text not null,
  reflective_question text not null,
  is_saved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.devotionals enable row level security;

create policy "Users can view own devotionals"
  on public.devotionals for select
  using (auth.uid() = user_id);

create policy "Users can insert own devotionals"
  on public.devotionals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own devotionals"
  on public.devotionals for update
  using (auth.uid() = user_id);

-- =============================================
-- JOURNAL ENTRIES
-- =============================================
create table public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  devotional_id uuid references public.devotionals on delete set null,
  content text not null,
  emotion text,
  created_at timestamptz not null default now()
);

alter table public.journal_entries enable row level security;

create policy "Users can view own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- =============================================
-- JOURNEYS (seed data)
-- =============================================
create table public.journeys (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text not null,
  theme text not null,
  total_days integer not null default 21,
  cover_emoji text,
  created_at timestamptz not null default now()
);

insert into public.journeys (slug, title, description, theme, cover_emoji) values
  ('ansiedade', '21 dias para a paz', 'Uma jornada para superar a ansiedade e encontrar a paz que excede o entendimento', 'ansiedade', '🕊️'),
  ('fe', '21 dias de fé', 'Aprofunde sua fé com reflexões diárias sobre a confiança em Deus', 'fe', '🙏'),
  ('proposito', '21 dias de propósito', 'Descubra o propósito de Deus para sua vida com devocionais guiados', 'proposito', '🎯'),
  ('cura', '21 dias de cura', 'Permita que Deus cure suas feridas emocionais e espirituais', 'cura', '💜'),
  ('gratidao', '21 dias de gratidão', 'Transforme sua perspectiva com uma jornada de gratidão e louvor', 'gratidao', '🌟'),
  ('identidade', '21 dias de identidade', 'Redescubra quem você é em Cristo', 'identidade', '👑');

-- =============================================
-- USER JOURNEYS
-- =============================================
create table public.user_journeys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  journey_id uuid references public.journeys not null,
  current_day integer not null default 1,
  completed boolean not null default false,
  started_at timestamptz not null default now(),
  unique (user_id, journey_id)
);

alter table public.user_journeys enable row level security;

create policy "Users can view own user_journeys"
  on public.user_journeys for select
  using (auth.uid() = user_id);

create policy "Users can insert own user_journeys"
  on public.user_journeys for insert
  with check (auth.uid() = user_id);

create policy "Users can update own user_journeys"
  on public.user_journeys for update
  using (auth.uid() = user_id);

-- Indexes
create index devotionals_user_id_idx on public.devotionals(user_id);
create index devotionals_created_at_idx on public.devotionals(created_at desc);
create index journal_entries_user_id_idx on public.journal_entries(user_id);
create index journal_entries_created_at_idx on public.journal_entries(created_at desc);
create index user_journeys_user_id_idx on public.user_journeys(user_id);
