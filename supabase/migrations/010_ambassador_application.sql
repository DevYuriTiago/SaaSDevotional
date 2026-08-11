-- =============================================
-- Embaixadores — Fatia 2: inscrição pública (landing /embaixadores)
-- Colunas do formulário de aplicação + idempotência por e-mail.
-- Contexto: docs/superpowers/specs/2026-08-10-embaixadores-landing-design.md
-- =============================================

alter table public.ambassadors
  add column if not exists social_platform text,   -- instagram | youtube | tiktok | outro
  add column if not exists social_handle   text,   -- @ do canal principal
  add column if not exists followers_count integer,
  add column if not exists church          text,   -- igreja/ministério (opcional)
  add column if not exists testimony       text,   -- caminhada com Cristo (curadoria lê)
  add column if not exists promotion_plan  text;   -- como pretende divulgar (opcional)

-- Uma inscrição por e-mail (case-insensitive). Duplicata vira sucesso
-- idempotente na rota — não vaza quem já se inscreveu.
create unique index if not exists ambassadors_email_unique_idx
  on public.ambassadors (lower(email))
  where email is not null;
