-- =============================================
-- Embaixadores — Fatia 4: números do portal
-- Contexto: docs/superpowers/specs/2026-08-15-embaixadores-portal-design.md
--
-- Uma view agrega tudo por embaixador. O portal lê filtrando uma linha; o
-- painel de observabilidade (fase futura) lê a tabela inteira. Assim a regra
-- de contagem existe num lugar só.
--
-- Subconsultas em vez de joins encadeados: juntar cliques, atribuições e
-- conversões na mesma query multiplicaria linhas e inflaria as contagens.
-- =============================================

create or replace view public.ambassador_stats
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
    where c.ambassador_id = a.id
  ), 0) as paying_count,

  coalesce((
    select sum(c.gross_amount_cents)
    from public.conversions c
    where c.ambassador_id = a.id and c.status = 'pending'
  ), 0) as gross_pending_cents,

  coalesce((
    select sum(c.gross_amount_cents)
    from public.conversions c
    where c.ambassador_id = a.id and c.status = 'confirmed'
  ), 0) as gross_confirmed_cents

from public.ambassadors a;
