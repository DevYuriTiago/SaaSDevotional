-- =============================================
-- Journey Plans — plano de 21 versículos por usuário+jornada
-- =============================================
create table if not exists public.journey_plans (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  slug        text not null,
  verses      jsonb not null,  -- [{day, reference, text, theme}] x21
  created_at  timestamptz not null default now(),
  unique (user_id, slug)
);

alter table public.journey_plans enable row level security;

create policy "Users can manage own journey plans"
  on public.journey_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- Journey Days — conteúdo gerado por dia (cache permanente)
-- =============================================
create table if not exists public.journey_days (
  id           uuid default gen_random_uuid() primary key,
  plan_id      uuid references public.journey_plans(id) on delete cascade not null,
  user_id      uuid references auth.users on delete cascade not null,
  slug         text not null,
  day          integer not null check (day between 1 and 21),
  content      jsonb not null,   -- objeto Devotional completo
  generated_at timestamptz not null default now(),
  unique (user_id, slug, day)
);

alter table public.journey_days enable row level security;

create policy "Users can manage own journey days"
  on public.journey_days for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
