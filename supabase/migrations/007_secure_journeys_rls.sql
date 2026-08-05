-- ─────────────────────────────────────────────────────────────
-- Fase 0.1 (segurança) — blindar a tabela `journeys`.
--
-- Achado da auditoria: `public.journeys` (catálogo de temas) estava com
-- Row Level Security DESATIVADO. Sem RLS, a API REST do Supabase expõe a
-- tabela para leitura E escrita a qualquer usuário (inclusive anônimo).
--
-- Hoje o app NÃO usa essa tabela (os temas vêm da constante JOURNEY_THEMES),
-- então ela é apenas referência. Ligamos RLS e liberamos SOMENTE leitura;
-- nenhuma escrita (insert/update/delete) fica disponível para anon/authenticated.
-- Escritas só via service_role (server), que ignora RLS.
-- ─────────────────────────────────────────────────────────────

alter table public.journeys enable row level security;

drop policy if exists "Jornadas são públicas para leitura" on public.journeys;
create policy "Jornadas são públicas para leitura"
  on public.journeys for select
  using (true);
