-- ─────────────────────────────────────────────────────────────
-- Fase 0 (continuação) — resolve avisos do Security Advisor do Supabase.
-- ─────────────────────────────────────────────────────────────

-- 1) "Public Bucket Allows Listing" (bucket avatars)
--    A política de SELECT ampla (using true) deixava QUALQUER um LISTAR os
--    objetos do bucket e, com isso, enumerar os user_ids (pastas). Restringe a
--    listagem/download autenticado à própria pasta do usuário.
--    A EXIBIÇÃO das fotos continua funcionando: o bucket é público e serve as
--    imagens pela URL pública (/object/public/...), que não depende desta policy.
drop policy if exists "Avatares são públicos para leitura" on storage.objects;
drop policy if exists "Usuário lista o próprio avatar" on storage.objects;
create policy "Usuário lista o próprio avatar"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2/3) "Public / Signed-In Can Execute SECURITY DEFINER Function"
--    handle_new_user() é uma função de TRIGGER (roda no cadastro para criar o
--    profile). O Postgres, por padrão, concede EXECUTE a PUBLIC — isso permitiria
--    chamá-la diretamente via RPC. Revogamos esse acesso. O trigger
--    on_auth_user_created continua funcionando (dispara como dono, não via grant).
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
