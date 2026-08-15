# Fatia 5 — Comissão e saque (design)

> Programa de Embaixadores Humanáh, fase 5 de `docs/embaixadores.md`.
> Fatias 1 a 4 na `homolog`. Branch: `feature/embaixadores`. Data: 2026-08-15.

## 1. Objetivo
Fechar o ciclo financeiro. Hoje toda conversão nasce `pending` e nada a promove,
então o saldo "disponível" do embaixador fica eternamente em zero. Esta fatia
destrava o saldo, trata estorno e entrega a fila de saque no admin.

O cálculo de nível e comissão já foi feito na Fatia 4 (`earnings.ts`).

### Fora de escopo
Envio automático de Pix (a transferência continua manual, decisão travada na
Fatia 1), kit de divulgação, exportação, antifraude avançado.

## 2. Decisões travadas

### Confirmação derivada da data, sem rotina agendada
Uma conversão está confirmada quando `occurred_at` tem mais de 7 dias e ela não
foi estornada nem paga. Nada de cron promovendo status.

Motivo: um cron que falha silenciosamente trava o saldo de todos os embaixadores
sem ninguém perceber, e o sintoma (saldo parado) demora a ser notado. Data não
falha. Menos infraestrutura, menos modo de falha.

Consequência: a coluna `status` deixa de ser o critério de "confirmado" e passa a
registrar só o que é fato do mundo: `pending` (normal) ou `refunded` (estornado).

### Estorno chega por evento
O webhook do Stripe passa a tratar `charge.refunded`, marcando a conversão
daquela fatura como `refunded`. Comissão sobre dinheiro devolvido não é devida.

### Saque com rastro por conversão
- `ambassador_payouts`: um registro por pagamento feito (valor, período, data, quem).
- `conversions.payout_id`: carimba em qual saque aquela comissão saiu.

Assim "disponível" é: confirmada, não estornada e **sem `payout_id`**. Pagar duas
vezes a mesma comissão passa a ser impossível, e cada valor pago tem histórico.

### A taxa vigente vale sobre o saldo não pago
Como o nível é vitalício e nunca rebaixa, quem sobe de nível ganha a taxa nova
inclusive sobre o que ainda não recebeu. Mais generoso e mais simples de explicar
do que congelar a taxa de cada conversão.

## 3. Modelo de dados
Migration `013_ambassador_payouts.sql`:

```sql
ambassador_payouts
  id, ambassador_id, amount_cents, conversions_count,
  period_start, period_end, method ('pix'), notes,
  paid_at, created_at

conversions
  + payout_id uuid → ambassador_payouts (null = ainda não pago)
```

A view `ambassador_stats` é recriada com as faixas novas:
- `gross_pending_cents`: dentro dos 7 dias, não estornada, não paga;
- `gross_available_cents`: passou dos 7 dias, não estornada, não paga;
- `gross_paid_cents`: já saiu num saque.

`paying_count` passa a ignorar conversões estornadas (nível não sobe por dinheiro
devolvido).

## 4. Fluxo do saque
```
admin abre /admin/saques
  → lista embaixadores com saldo disponível > 0
  → mostra chave Pix (copiar) e o valor devido
  → admin paga pelo banco, por fora
  → clica em "marcar como pago"
        ↓
  POST /api/admin/payouts
  cria ambassador_payouts + carimba payout_id nas conversões incluídas
        ↓
  saldo do embaixador zera; portal dele passa a mostrar "já recebido"
```

O carimbo usa a lista exata de conversões elegíveis lidas no momento da
operação, não um intervalo de datas solto: se uma conversão nova confirmar
enquanto o admin decide, ela fica para o próximo saque em vez de entrar num
pagamento cujo valor já foi transferido.

## 5. Segurança
- `/api/admin/payouts` valida o cookie de admin, como as demais rotas de admin.
- Nunca zera saldo sem registrar o pagamento: as duas coisas são a mesma operação.
- A chave Pix é PII: aparece só no admin, nunca em log ou resposta pública.
