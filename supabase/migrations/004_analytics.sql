-- =============================================
-- Analytics — eventos de funil próprios (sem dependência externa).
-- Permite calcular ativação, D1/D7, paywall→checkout→conversão por query.
-- =============================================

create table if not exists public.analytics_events (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete set null,
  event       text not null,           -- ex.: signup, devotional_generated, paywall_viewed, checkout_started, subscription_activated, journey_started
  props       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

-- Usuários autenticados só inserem eventos atribuídos a si mesmos.
-- Leitura/agregação fica restrita ao service role (dashboards de admin).
create policy "Users insert own analytics events"
  on public.analytics_events for insert
  with check (auth.uid() = user_id);

create index if not exists analytics_events_event_idx on public.analytics_events (event);
create index if not exists analytics_events_user_idx on public.analytics_events (user_id);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);
