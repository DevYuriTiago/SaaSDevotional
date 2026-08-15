-- =============================================
-- Embaixadores — Fatia 9: fechamento das pontas soltas
-- Contexto: auditoria do docs/embaixadores.md contra o código.
--
-- Três lacunas que esta migration destrava:
--  1. pix_key existia mas nada escrevia nela: o saque travava por falta de chave.
--     Agora o próprio embaixador preenche no portal (quem é dono do dado é quem
--     digita, evitando erro de transcrição).
--  2. A landing promete doar a comissão para a igreja e não havia mecanismo.
--  3. Cliques bloqueados eram gravados mas invisíveis no admin.
-- =============================================

alter table public.ambassadors
  -- Quanto da comissão a pessoa quer destinar à igreja ou ministério (0 a 100).
  add column if not exists donation_percent integer not null default 0
    check (donation_percent >= 0 and donation_percent <= 100),
  -- Para onde vai a doação (nome da igreja ou ministério).
  add column if not exists donation_target text,
  add column if not exists payment_updated_at timestamptz;

-- A view ganha a contagem de tentativas bloqueadas, para o admin enxergar
-- quem está sofrendo (ou tentando) cookie stuffing.
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
    where al.ambassador_id = a.id and lc.blocked_reason is null
  ), 0) as clicks,

  coalesce((
    select count(*)
    from public.link_clicks lc
    join public.ambassador_links al on al.id = lc.link_id
    where al.ambassador_id = a.id and lc.blocked_reason is not null
  ), 0) as blocked_clicks,

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
