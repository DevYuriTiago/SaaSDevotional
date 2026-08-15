# Fatia 6 — Kit de divulgação e exportação (design)

> Programa de Embaixadores Humanáh, fase 6 de `docs/embaixadores.md`.
> Fatias 1 a 5 na `homolog`. Branch: `feature/embaixadores`. Data: 2026-08-15.

## 1. Objetivo
Duas metades independentes:
- **Kit**: tirar o atrito de divulgar. O embaixador é aprovado, recebe o link e
  trava, porque não sabe o que escrever nem tem imagem pronta. O kit entrega
  legendas e cards já com o link e o QR dele.
- **Exportação**: relatório por embaixador com a marca e CSV agregado no admin.

### Fora de escopo
Antifraude (fase 7) e painel geral de observabilidade (seção 7 do doc).

## 2. Decisões travadas

### PDF pelo navegador, sem `@react-pdf/renderer`
O doc sugeria `@react-pdf/renderer`. Escolho uma **página com estilo de
impressão** que o navegador salva como PDF (Ctrl+P, "Salvar como PDF").

Motivos: a biblioteca passa de 1 MB no bundle e exige remontar o layout numa API
própria de componentes, com sua própria fonte de bugs, enquanto a impressão
nativa produz PDF com texto selecionável e boa qualidade a partir do HTML que já
sabemos fazer. Somando: acabamos de ter uma vulnerabilidade alta entrando por uma
dependência transitiva (`qrcode` → `nanoid`), e cada dependência nova é
superfície de manutenção. Se um dia o relatório precisar ser gerado no servidor e
enviado por e-mail, aí a biblioteca se justifica.

### O card é gerado no navegador, com Canvas
Reaproveita a técnica do `ShareModal` (1080×1920, fundo `/fundo-comp.png`,
emblema e wordmark). O QR do embaixador entra desenhado no card, então a imagem
funciona sozinha: quem vê o story aponta a câmera e cai no link.

Dois formatos: **story** (1080×1920) e **feed** (1080×1080).

### Legendas são texto puro, com o link embutido
Nada de "modelo com espaço para você preencher". Cada legenda já vem com o link
do embaixador dentro, pronta para colar. Tom pessoal e de testemunho, porque é o
que converte numa audiência de fé, não linguagem de anúncio.

### LGPD na exportação
O CSV do admin leva **apenas números agregados por embaixador**. Nunca a lista de
usuários que se cadastraram, nem e-mail de quem assinou. O relatório do
embaixador segue a mesma regra: ele vê os próprios números, não as pessoas.

## 3. Componentes
| Arquivo | Responsabilidade |
|---|---|
| `src/lib/ambassadors/captions.ts` | legendas prontas, funções puras que recebem o link |
| `src/app/embaixador/KitClient.tsx` | seção do kit no portal: legendas e cards |
| `src/app/embaixador/promo-card.ts` | desenho dos cards no Canvas (story e feed) |
| `src/lib/ambassadors/csv.ts` | monta o CSV agregado (função pura) |
| `src/app/api/admin/export/route.ts` | baixa o CSV (exige cookie de admin) |
| `src/app/admin/relatorio/[id]/page.tsx` | relatório de um embaixador, com estilo de impressão |

## 4. O relatório
Uma página por embaixador com: identificação e nível, período, funil completo
(cliques, cadastros, assinantes e as taxas entre as etapas), receita gerada,
comissão acumulada, saques já pagos. Estilo de impressão em papel branco com
tinta escura, porque relatório impresso em fundo escuro gasta tinta e fica
ilegível. Botão "Imprimir ou salvar em PDF" que some na impressão.

## 5. Segurança
- A rota de exportação e o relatório exigem o cookie de admin.
- O QR é gerado no servidor (já feito na Fatia 4), sem serviço externo.
