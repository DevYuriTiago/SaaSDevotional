-- =============================================
-- Embaixadores — Fatia 8: antifraude (cookie stuffing)
-- Contexto: docs/superpowers/specs/2026-08-15-embaixadores-antifraude-design.md
--
-- Cliques suspeitos passam a ser GRAVADOS com o motivo, em vez de descartados:
-- mantém o rastro para perícia e para você perceber que alguém está tentando,
-- sem sujar as métricas. A view conta apenas os cliques limpos.
-- =============================================

alter table public.link_clicks
  add column if not exists blocked_reason text;

-- Índice para a checagem de clique repetido (mesmo IP, mesmo link, recente).
create index if not exists link_clicks_dedupe_idx
  on public.link_clicks (link_id, ip_hash, clicked_at desc);

-- A view precisa ser derrubada porque nenhuma coluna muda de nome, mas o
-- critério de contagem muda; recriar mantém tudo explícito num lugar só.
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
      and lc.blocked_reason is null      -- só cliques limpos entram na métrica
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
