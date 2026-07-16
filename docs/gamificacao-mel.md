# Gamificação Humanáh — "O Mel da Palavra"

> **Status:** 💡 ideia adiada para **depois do lançamento** (16/07/2026).
> Registrada aqui para análise futura. Nada implementado.

## Objetivo
Transformar a gamificação atual (XP/nível + conquistas com cadeado) num **loop viral, empolgante e consistente** — no espírito do "regar a árvore" do Glorify — que:
1. dê **ânimo** pro usuário voltar todo dia e avançar;
2. seja **irresistível de compartilhar** no Instagram (stories);
3. reforce a identidade Humanáh (dourado, noite→alvorada);
4. **encaixe no que já é coletado** (sem exigir novos dados pesados).

## Por que MEL 🍯 (a metáfora escolhida)
Âncoras que tornam a metáfora autêntica e defensável:
- **Maná tinha sabor de mel** — "o seu sabor era como bolos de mel" (Êxodo 16:31).
- **"Quão doces são as tuas palavras ao meu paladar! Mais doces do que o mel à minha boca"** (Salmo 119:103).
- **Mel = dourado** = literalmente a cor da marca. Fica lindo no story.
- Diferencia do Glorify (que usa árvore), mantendo o mesmo poder de "crescimento visível".

## As 3 mecânicas consideradas

### A) Favo de mel que se preenche 🐝 — **RECOMENDADO**
Um favo de células hexagonais douradas. Cada devocional preenche **uma célula** com mel brilhante.
- Marcos completam **seções** do favo; conquistas viram **células especiais** (com ícone).
- Streak = brilho/frescor do mel; jornada de 21 dias = uma seção inteira do favo.
- **Prós:** progresso super satisfatório (ver células enchendo), colecionável, dourado nativo, ótimo no story, mapeia 1:1 no que já existe (1 devocional = 1 célula).
- **Contras:** precisa de um bom trabalho de layout/animação do favo.

### B) Pote de mel que enche
Uma jarra que enche de mel com a constância e transborda nos marcos.
- **Prós:** simples de entender e produzir.
- **Contras:** progresso "raso" (só um nível subindo), menos colecionável/viral que o favo.

### C) Colmeia viva
Uma colmeia com abelhas; a constância "produz" mel e a colmeia prospera.
- **Prós:** vivo, orgânico, encantador.
- **Contras:** caro de produzir (animação de abelhas) — arriscado para prazos curtos.

## Como encaixa nos dados que já temos
| Dado atual | Vira, no favo |
|---|---|
| `total_devotionals` | nº de células preenchidas |
| `streak_days` | brilho/frescor do mel + "mel do dia" |
| dias em jornada | uma seção dedicada do favo |
| conquistas (7) | células especiais com ícone/nome |
| XP/nível | pode virar "colheita"/"safra" (reestruturar, não remover) |

## O loop viral (Instagram)
- Card de story 1080×1920 com **o favo dourado do usuário no estado atual** + frase ("Minha Palavra foi doce como mel — X dias, Y células") + marca.
- Gatilho de compartilhar **no momento do marco** (encheu uma seção, bateu streak) — pico de empolgação.
- Reaproveita o `ShareModal`/Canvas que já existe.

## Perguntas em aberto (decidir ao retomar)
- Mecânica final: favo (A), pote (B) ou colmeia (C)?
- O que fazer com XP/nível — reestruturar como "safra"/"colheita" ou aposentar?
- Escopo v1: favo estático que preenche (mais barato) vs. animação rica?
- Onde vive: nova aba, dentro do Perfil, ou card no Dashboard?
- Gatilho de share: automático no marco, botão sempre visível, ou ambos?

## Próximo passo quando retomar
Rodar o brainstorming a partir daqui, escolher a mecânica, e então gerar o spec + plano de implementação.
