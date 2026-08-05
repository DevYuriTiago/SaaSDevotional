-- =============================================
-- Programa de Embaixadores — Fatia 1: motor de atribuição
-- 5 tabelas + RLS negado por padrão (só service_role no servidor).
-- Contexto: docs/superpowers/specs/2026-08-05-embaixadores-motor-atribuicao-design.md
-- =============================================

-- 1) EMBAIXADOR
create table if not exists public.ambassadors (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete set null, -- nulo até ter login (fatia futura)
  name       text not null,
  email      text,
  whatsapp   text,
  pix_key    text,
  status     text not null default 'active' check (status in ('pending','active','suspended')),
  created_at timestamptz not null default now()
);

-- 2) LINK COMPARTILHÁVEL (1 embaixador pode ter vários)
create table if not exists public.ambassador_links (
  id            uuid default gen_random_uuid() primary key,
  ambassador_id uuid references public.ambassadors on delete cascade not null,
  slug          text not null unique,
  destination   text not null default '/',
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists ambassador_links_ambassador_idx on public.ambassador_links (ambassador_id);

-- 3) LOG DE CLIQUES (IP hasheado — LGPD)
create table if not exists public.link_clicks (
  id         uuid default gen_random_uuid() primary key,
  link_id    uuid references public.ambassador_links on delete cascade not null,
  clicked_at timestamptz not null default now(),
  ip_hash    text,
  country    text,
  device     text,
  referrer   text
);
create index if not exists link_clicks_link_idx on public.link_clicks (link_id);

-- 4) ATRIBUIÇÃO usuário → embaixador (FIRST-TOUCH via UNIQUE(user_id))
create table if not exists public.attributions (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users on delete cascade not null unique,
  ambassador_id  uuid references public.ambassadors on delete cascade not null,
  link_id        uuid references public.ambassador_links on delete set null,
  first_touch_at timestamptz not null default now()
);
create index if not exists attributions_ambassador_idx on public.attributions (ambassador_id);

-- 5) CONVERSÃO: 1 linha por fatura paga (idempotente via UNIQUE(stripe_invoice_id))
create table if not exists public.conversions (
  id                uuid default gen_random_uuid() primary key,
  ambassador_id     uuid references public.ambassadors on delete cascade not null,
  user_id           uuid references auth.users on delete set null,
  stripe_invoice_id text not null unique,
  stripe_event_type text,
  gross_amount_cents integer not null,
  currency          text not null default 'brl',
  status            text not null default 'pending' check (status in ('pending','confirmed','refunded')),
  occurred_at       timestamptz not null default now()
);
create index if not exists conversions_ambassador_idx on public.conversions (ambassador_id);

-- RLS: ligado, sem policy permissiva → negado a anon/authenticated.
-- Todo acesso é via service_role (servidor), que ignora RLS.
alter table public.ambassadors      enable row level security;
alter table public.ambassador_links enable row level security;
alter table public.link_clicks      enable row level security;
alter table public.attributions     enable row level security;
alter table public.conversions      enable row level security;
