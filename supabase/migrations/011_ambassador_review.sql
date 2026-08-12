-- =============================================
-- Embaixadores — Fatia 3: curadoria (aprovar / recusar)
-- Contexto: docs/superpowers/specs/2026-08-12-embaixadores-curadoria-design.md
-- =============================================

-- 'rejected' passa a ser um estado válido: a curadoria é manual e precisa
-- registrar a recusa (e não apagar a inscrição, para não reavaliar o mesmo perfil).
alter table public.ambassadors
  drop constraint if exists ambassadors_status_check;

alter table public.ambassadors
  add constraint ambassadors_status_check
  check (status in ('pending','active','suspended','rejected'));

-- Quando a decisão foi tomada (histórico da curadoria).
alter table public.ambassadors
  add column if not exists reviewed_at timestamptz;

create index if not exists ambassadors_status_idx on public.ambassadors (status, created_at desc);
