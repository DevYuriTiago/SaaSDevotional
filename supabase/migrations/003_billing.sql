-- =============================================
-- Billing — persistir IDs e status da assinatura Stripe
-- Permite portal de gerenciamento, reconciliação e win-back de inadimplência.
-- =============================================

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists subscription_current_period_end timestamptz;

-- Lookup rápido por customer no webhook (e evita customers duplicados).
create unique index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;
