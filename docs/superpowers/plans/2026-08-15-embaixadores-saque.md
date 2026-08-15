# Embaixadores — Fatia 5: Comissão e saque — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (execução inline).

**Goal:** Destravar o saldo (confirmação por data), tratar estorno e entregar a fila de saque no admin.

**Architecture:** A view do banco classifica cada conversão em pendente, disponível ou paga; `earnings.ts` aplica a taxa; a rota de saque cria o registro e carimba as conversões numa operação só.

**Tech Stack:** Next.js 16, Supabase service_role, Stripe webhooks, Vitest.

## Global Constraints
- Spec: `docs/superpowers/specs/2026-08-15-embaixadores-saque-design.md`.
- Sem trailer `Co-Authored-By`. **Sem travessão em texto visível.**
- Nunca zerar saldo sem registrar o pagamento (mesma operação).
- Rotas de admin validam o cookie por conta própria.
- Rodar testes com `npx vitest run --no-file-parallelism <arquivo>`.

---

### Task 1: Migration 013
`supabase/migrations/013_ambassador_payouts.sql`: tabela `ambassador_payouts` (RLS ligada, sem policy permissiva), coluna `conversions.payout_id`, e `create or replace view ambassador_stats` com `gross_pending_cents` / `gross_available_cents` / `gross_paid_cents` e `paying_count` ignorando estornos. Commit.

### Task 2: estorno no webhook (TDD)
Em `src/app/api/webhook/stripe/route.ts`, tratar `charge.refunded`: pegar `charge.invoice` e marcar a conversão correspondente como `refunded`. Sem invoice, ignora. Teste novo em `src/__tests__/api/webhook-stripe.test.ts`: evento de estorno marca a conversão; evento sem invoice não faz nada. Commit.

### Task 3: `earnings.ts` com as três faixas (TDD)
`AmbassadorStats` ganha `grossAvailableCents` e `grossPaidCents` (renomeando o antigo confirmado). `Earnings` ganha `paidCents`. Ajustar `computeEarnings` e os testes existentes. Atualizar o portal (`/embaixador`) para ler os campos novos e exibir "já recebido". Commit.

### Task 4: `POST /api/admin/payouts` (TDD)
Body `{ ambassadorId }`. Sem cookie de admin → 401. Lê as conversões elegíveis (confirmadas por data, não estornadas, sem payout), calcula a comissão pela taxa do nível atual, cria `ambassador_payouts` e carimba `payout_id` nas conversões daquela lista. Sem saldo → 422. Devolve `{ ok, amountCents, conversionsCount }`. Testes: 401 sem auth; sem saldo; caminho feliz carimbando as conversões certas; falha ao criar o payout não carimba nada. Test `src/__tests__/api/admin-payouts.test.ts`. Commit.

### Task 5: tela `/admin/saques`
Server component lista embaixadores com saldo (join `ambassador_stats` + `ambassadors` para a chave Pix), client component com valor devido, chave Pix copiável, botão de marcar como pago e histórico dos últimos saques. Link entre as telas do admin. Commit.

### Task 6: Verificação
`npm run build`, lint, suíte sequencial verde (só as 4 falhas pré-existentes). Commit se houver ajuste.
