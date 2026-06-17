-- =============================================
-- Referral + Premium temporário
-- Loop de convite: convidante e convidado ganham dias de premium quando o
-- convidado gera seu 1º devocional. Premium temporário via premium_until
-- (independente da assinatura Stripe).
-- =============================================

alter table public.profiles
  add column if not exists premium_until timestamptz,
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references auth.users on delete set null;

create unique index if not exists profiles_referral_code_idx
  on public.profiles (referral_code)
  where referral_code is not null;

-- Convites: 1 linha por convidado. status: pending → rewarded.
create table if not exists public.referrals (
  id           uuid default gen_random_uuid() primary key,
  referrer_id  uuid references auth.users on delete cascade not null,
  invitee_id   uuid references auth.users on delete cascade not null,
  code         text not null,
  status       text not null default 'pending' check (status in ('pending','rewarded')),
  created_at   timestamptz not null default now(),
  rewarded_at  timestamptz,
  unique (invitee_id)
);

alter table public.referrals enable row level security;

-- Convidante e convidado podem ver os convites que os envolvem.
create policy "Users view own referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = invitee_id);

create index if not exists referrals_referrer_idx on public.referrals (referrer_id);
