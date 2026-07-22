# Tema Claro / Escuro (Dia / Madrugada) — roadmap pós-lançamento

> **Status:** 💡 adiado para próximas versões (decisão de 22/07/2026).
> Hoje o app é escuro por identidade; o Modo Madrugada é um segundo tom de escuro.
> A ideia é ter um **Modo Dia (claro)** de verdade, alternável.

## Por que NÃO é "uma linha"
A base (fundo) até é centralizada em variáveis (`:root` e `.night-mode` no `globals.css`), mas:
- **~248 cores hardcoded** em **~27 arquivos** `.tsx` (véus quase-pretos, vidros claros translúcidos, sombras) — todas assumindo **fundo escuro**. Em fundo claro viram painéis invisíveis / véus errados.
- **~101 usos de `color: var(--gold)`** como TEXTO — o dourado (#F7C97A) fica **ilegível** sobre creme. Cada um precisa virar `--gold-on-light` (#9C7320, que já existe) **por tema**.
- Assets feitos pro escuro: fotos de alvorada, fios dourados das telas de auth (`auth-glow`), card de compartilhar, emblema dourado.

Virar só a variável de fundo → app "claro" com **dourado sumido + caixas invisíveis**.

## Abordagem recomendada quando retomar
1. **Tokenizar cores primeiro** (dívida técnica): substituir as 248 cores hardcoded por variáveis semânticas (`--bg`, `--surface`, `--text`, `--accent`, `--accent-on-bg`, `--veil`, `--border`…). Sem isso, qualquer tema novo é frágil.
2. Criar o **Modo Dia** re-derivando a paleta:
   - Fundo: creme/pergaminho (`--cream` #FBF7E6 / um sépia).
   - Texto: tinta escura (`--ink` #1A160F).
   - Acento: **`--gold-on-light` (#9C7320)** no lugar do dourado claro para textos/ícones.
   - Vidros/sombras/bordas recalibrados para claro.
3. Trocar o toggle atual (que hoje é escuro→escuro) por **3 estados** ou 2 temas: **Dia (claro)** ↔ **Madrugada (escuro)**, persistido (já existe `nightMode` no store + `night_mode_preference` no perfil).
4. Variantes de asset para claro onde necessário (emblema com contorno, telas de auth).
5. QA das duas versões em TODAS as telas.

## Alternativa contida (sem re-tematizar tudo)
Se a meta for só **leitura confortável**, dá pra fazer uma **"página pergaminho"** apenas no conteúdo de leitura do devocional (superfície creme + `--ink`), mantendo o app escuro. Baixo risco, on-brand (a serifa Cormorant foi escolhida pra "ler como página impressa").

## Esforço estimado
Tema completo: **dias de trabalho + QA** (tokenização + re-derivação + auditoria dos 27 arquivos). Não recomendado colar no lançamento.

## Já melhorado (sem virar tema)
- Fonte de leitura do devocional aumentada.
- Variável `--reading` (leitura mais clara no tradicional, suave no madrugada).
