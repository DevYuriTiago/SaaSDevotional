# Fatia 8 — Antifraude e polimento (design)

> Programa de Embaixadores Humanáh, fase 8 de `docs/embaixadores.md`.
> Fatias 1 a 7 na `homolog`. Branch: `feature/embaixadores`. Data: 2026-08-15.

## 1. Objetivo
Fechar o último item de antifraude do doc: **cookie stuffing**. Os outros três
(auto-indicação, comissão só em pagante e após reembolso, first-touch) já foram
implementados nas fases 1, 3 e 5.

## 2. O ataque
O fraudador carrega `/e/<slug>` de forma invisível dentro de um iframe, uma tag
de imagem ou um script, numa página com tráfego. Quem visita recebe o cookie
`hmn_ref` sem nunca ter clicado. Se essa pessoa um dia se cadastrar e assinar, o
crédito vai para o fraudador, que não trouxe ninguém.

O prejuízo é duplo: comissão indevida e, pior, o crédito é **roubado do
embaixador legítimo** que realmente trouxe a pessoa, já que a atribuição é
first-touch.

## 3. Decisões travadas

### A defesa principal é o cabeçalho `Sec-Fetch-Dest`
Todo navegador moderno envia esse cabeçalho dizendo em que contexto o recurso
está sendo carregado: `document` numa navegação de topo, `iframe` dentro de um
quadro, `image` numa tag de imagem, `script`, `empty` em fetch/XHR.

Cookie stuffing precisa, por definição, de um contexto que **não** é `document`.
Então: valor presente e diferente de `document` significa carregamento invisível,
e nesse caso **o cookie não é gravado**.

Ausência do cabeçalho não bloqueia. Navegadores antigos não o enviam, e punir
quem não manda o cabeçalho puniria usuário legítimo. Preferimos deixar passar um
ataque raro a quebrar a atribuição de alguém real.

### Cliques repetidos não somam, mas não são bloqueio
Recarregar a página ou clicar duas vezes no próprio link é comportamento normal,
não fraude. Cliques do mesmo IP no mesmo link dentro de **30 minutos** deixam de
contar na métrica, mas o cookie continua sendo gravado normalmente.

Isso separa dois conceitos que costumam ser confundidos:
- **higiene de métrica**: não inflar o número de cliques;
- **defesa**: não gravar cookie de carregamento invisível.

### Tentativas bloqueadas são registradas, não descartadas
`link_clicks` ganha `blocked_reason`. O clique suspeito é gravado com o motivo,
e a view passa a contar apenas os limpos. Assim você mantém o rastro para
perícia (e para perceber que alguém está tentando) sem sujar as métricas.

### O redirecionamento acontece sempre
Mesmo bloqueado, a resposta continua sendo o redirecionamento para a home.
Nunca mostramos ao atacante que a defesa existe, e um usuário legítimo num
contexto estranho não fica preso numa página de erro.

## 4. Componentes
| Arquivo | Responsabilidade |
|---|---|
| `src/lib/ambassadors/click-guard.ts` | `assessClick()`, função pura: decide contar o clique e gravar o cookie |
| `supabase/migrations/014_click_guard.sql` | `link_clicks.blocked_reason` + view contando só cliques limpos |
| `src/app/e/[slug]/route.ts` | aplica a avaliação |

`assessClick` recebe `{ secFetchDest, secFetchSite, hasRecentClick }` e devolve
`{ countClick, setCookie, reason }`. Sem I/O, para ser testável de verdade.

## 5. Fora de escopo
Impressão digital de dispositivo (fingerprinting), que é invasivo e tem seus
próprios problemas de privacidade, e limite de taxa por IP, que faz mais sentido
quando houver volume real para calibrar.
