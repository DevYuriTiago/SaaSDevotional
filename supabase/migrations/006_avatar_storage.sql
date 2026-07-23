-- Avatares — bucket público de fotos de perfil.
-- Cada usuário só escreve dentro da própria pasta (avatars/<user_id>/...).

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Leitura pública (a foto aparece no app sem signed URL).
drop policy if exists "Avatares são públicos para leitura" on storage.objects;
create policy "Avatares são públicos para leitura"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Envio: só na própria pasta.
drop policy if exists "Usuário envia o próprio avatar" on storage.objects;
create policy "Usuário envia o próprio avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Atualização (upsert da mesma foto).
drop policy if exists "Usuário atualiza o próprio avatar" on storage.objects;
create policy "Usuário atualiza o próprio avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Remoção.
drop policy if exists "Usuário remove o próprio avatar" on storage.objects;
create policy "Usuário remove o próprio avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
