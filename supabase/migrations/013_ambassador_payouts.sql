-- =============================================
-- Embaixadores — Fatia 5: comissão e saque
-- Contexto: docs/superpowers/specs/2026-08-15-embaixadores-saque-design.md
--
-- Duas mudanças de fundo:
--  1. "Confirmada" deixa de ser um status mutável e passa a ser derivado da
--     data (mais de 7 dias). Não existe rotina agendada para falhar em silêncio.
--  2. Todo pagamento feito vira um registro, e cada conversão carimba em qual
--     saque saiu, tornando impossível pagar a mesma comissão duas vezes.
-- =============================================

create table if not exists public.ambassador_payouts (
  id                uuid default gen_random_uuid() primary key,
  ambassador_id     uuid references public.ambassadors on delete cascade not null,
  amount_cents      integer not null,
  conversions_count integer not null default 0,
  period_start      timestamptz,
  period_end        timestamptz,
  method            text not null default 'pix',
  notes             text,
  paid_at           timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create index if not exists ambassador_payouts_ambassador_idx
  on public.ambassador_payouts (ambassador_id, paid_at desc);

alter table public.ambassador_payouts enable row level security;
-- Sem policy permissiva: acesso só via service_role no servidor.

-- Em qual saque esta comissão foi paga (null = ainda não paga).
alter table public.conversions
  add column if not exists payout_id uuid references public.ambassador_payouts on delete set null;

create index if not exists conversions_payout_idx on public.conversions (ambassador_id, payout_id);

-- =============================================
-- View revisada: três faixas de dinheiro
--   pendente   = dentro da garantia de 7 dias
--   disponível = passou dos 7 dias e ainda não foi paga
--   pago       = já saiu num saque
-- Estornos não contam em lugar nenhum, nem para o nível.
--
-- Precisa de DROP antes: "create or replace view" só permite acrescentar
-- colunas no fim, e aqui a coluna gross_confirmed_cents (migration 012) muda
-- de nome para gross_available_cents. Nada depende desta view, então derrubar
-- e recriar é seguro.
-- =============================================
drop view if exists public.ambassador_stats;

create view public.ambassador_stats
with (security_invoker = true) as
select
  a.id as ambassador_id,
  a.name,
  a.status,

  coalesce((
    select count(*)
    from public.link_clicks lc
    join public.ambassador_links al on al.id = lc.link_id
    where al.ambassador_id = a.id
  ), 0) as clicks,

  coalesce((
    select count(*)
    from public.attributions at
    where at.ambassador_id = a.id
  ), 0) as signups,

  coalesce((
    select count(distinct c.user_id)
    from public.conversions c
    where c.ambassador_id = a.id and c.status <> 'refunded'
  ), 0) as paying_count,

  coalesce((
    select sum(c.gross_amount_cents)
    from public.conversions c
    where c.ambassador_id = a.id
      and c.status <> 'refunded'
      and c.payout_id is null
      and c.occurred_at > now() - interval '7 days'
  ), 0) as gross_pending_cents,

  coalesce((
    select sum(c.gross_amount_cents)
    from public.conversions c
    where c.ambassador_id = a.id
      and c.status <> 'refunded'
      and c.payout_id is null
      and c.occurred_at <= now() - interval '7 days'
  ), 0) as gross_available_cents,

  coalesce((
    select sum(c.gross_amount_cents)
    from public.conversions c
    where c.ambassador_id = a.id and c.payout_id is not null
  ), 0) as gross_paid_cents

from public.ambassadors a;
