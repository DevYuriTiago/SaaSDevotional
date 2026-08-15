# Fatia 4 — Portal do embaixador (design)

> Programa de Embaixadores Humanáh, quarta fatia (fase 4 de `docs/embaixadores.md`).
> Fatias 1 (motor), 2 (landing) e 3 (curadoria) já na `homolog`.
> Branch: `feature/embaixadores`. Data: 2026-08-15.

## 1. Objetivo
Dar ao embaixador aprovado a sua própria tela: o link exclusivo, o funil de
resultados ao vivo, quanto já ganhou e em que nível está. É o que a landing
promete na pergunta "como acompanho meus resultados".

### Fora de escopo
Kit de divulgação (fase 6), saque via Pix (fase 5), painel de observabilidade do
dono do negócio (seção 7 do doc, fase própria).

## 2. Decisões travadas

### Login sem depender de SMTP
O embaixador **cria uma conta normal do app com o mesmo e-mail da inscrição**.
Na primeira visita a `/embaixador`, o sistema casa o e-mail autenticado com a
inscrição `active` e grava `ambassadors.user_id` (coluna já existe, nula).

Por que não magic link: o serviço de e-mail embutido do Supabase é fortemente
limitado por hora e a própria documentação desaconselha para produção, e o SMTP
próprio (Zoho) está indisponível. Este caminho funciona hoje, sem dependência
nova, e tem o efeito colateral bom de o embaixador usar o produto que divulga.

**Trava de segurança:** o vínculo só ocorre se o e-mail estiver **confirmado**
(`user.email_confirmed_at`). Sem isso, alguém poderia se cadastrar com o e-mail
de outra pessoa e assumir o portal dela caso a confirmação esteja desligada no
projeto Supabase. Vínculo é definitivo: uma vez preso a um `user_id`, o portal
não migra sozinho para outra conta.

### Números vêm de uma view no banco
Migration cria `ambassador_stats`, que agrega por embaixador: cliques, cadastros
atribuídos, pagantes distintos e receita bruta. Motivos: uma consulta em vez de
várias contagens espalhadas pelo código, e reaproveitamento — o painel de
observabilidade (fase futura) lê a mesma view sem filtro, o portal lê filtrando
uma linha.

### Nível e comissão continuam no TypeScript
`levels.ts` segue como fonte única das faixas e taxas. A view entrega números
crus; `earnings.ts` deriva nível, taxa e valor. Assim não existe regra de
comissão duplicada entre banco e código.

### Só conversões confirmadas contam como ganho
`conversions.status` distingue `pending` de `confirmed`. O portal mostra
**"a liberar"** (pending, dentro da garantia de 7 dias) separado de **"disponível"**
(confirmed), para não prometer dinheiro que ainda pode ser estornado.

## 3. Modelo de dados
Migration `012_ambassador_stats.sql`, apenas leitura (nenhuma tabela nova):

```sql
create view public.ambassador_stats as
  ambassadors a
  ← cliques      : count(link_clicks via ambassador_links)
  ← cadastros    : count(attributions)
  ← pagantes     : count(distinct conversions.user_id)
  ← bruto_pend   : sum(gross_amount_cents) where status='pending'
  ← bruto_conf   : sum(gross_amount_cents) where status='confirmed'
```
A view roda com `security_invoker`, e o acesso continua sendo só via
`service_role` no servidor (as tabelas de origem têm RLS negando tudo).

## 4. A tela `/embaixador`
- **Cabeçalho**: nome, medalhão do nível atual, taxa vigente.
- **Seu link**: URL, botão copiar, **QR code** (útil para projetar num culto).
- **Funil**: cliques → cadastros → pagantes, com as taxas de conversão entre as
  etapas (é o que mostra onde a divulgação trava).
- **Ganhos**: disponível e a liberar, em reais.
- **Progresso**: barra "faltam X pagantes para o nível Y", com o próximo medalhão.
- **Estados vazios**: sem cliques ainda, texto orientando a divulgar; sem
  inscrição aprovada, convite para se inscrever em `/embaixadores`.

## 5. Rotas e acesso
- `/embaixador` entra em `protectedRoutes` do middleware (exige login).
- Página server component: resolve o embaixador do usuário, busca stats,
  renderiza. Sem inscrição ativa para aquele e-mail, mostra o convite.
- `/embaixador` fora do sitemap e no `disallow` do robots.

## 6. Dependência nova
`qrcode` para gerar o QR no servidor (SVG embutido, sem chamada externa).
