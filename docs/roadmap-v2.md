# Roadmap v2 — Humanáh

> Índice das ideias adiadas para depois do lançamento da v1.
> Trabalho da v2 acontece na branch **`homolog`**; `master` é produção.

| # | Item | Detalhe | Impacto |
|---|---|---|---|
| 1 | 🍯 Gamificação "mel" | [gamificacao-mel.md](gamificacao-mel.md) | Engajamento + viralização |
| 2 | 🌗 Tema claro/escuro (dia/madrugada) | [tema-claro-escuro.md](tema-claro-escuro.md) | Conforto de leitura |
| 3 | 🔗 Link curto de compartilhamento (`/s`) | ver abaixo | Atribuição sem poluir a mensagem |
| 4 | 🎙️ Voz premium (ElevenLabs) | ver abaixo | Qualidade da leitura em áudio |
| 5 | 👥 Sistema de indicação | ver abaixo | Crescimento orgânico |

---

## 3. 🔗 Link curto de compartilhamento (`humanah.app/s`)

**Problema.** O texto compartilhado levava a URL com UTMs
(`humanah.app/?utm_source=share&utm_medium=story&utm_campaign=...`). No WhatsApp
isso polui a mensagem e parece spam. Removemos as UTMs (v1) — mas aí todo o
tráfego vindo de compartilhamentos passa a cair como "direto" no analytics.

**Solução.** Uma rota curta que redireciona já com as UTMs:

```
https://humanah.app/s   →  302  →  /?utm_source=share&utm_medium=social&utm_campaign=devotional
```

O usuário vê um link **limpo e curto**; a atribuição é preservada no redirect.

**Implementação sugerida**
- `src/app/s/route.ts` (Route Handler) devolvendo `NextResponse.redirect` para `/`
  com as UTMs. Variantes opcionais para diferenciar origem:
  - `/s` → compartilhamento genérico
  - `/s/d` → card de devocional
  - `/s/j` → card de jornada
- Ajustar o `ShareModal` (`handleShare` e `handleCopy`) para usar o link curto.
- A landing já captura UTMs (`captureUtmFromUrl`), então nada muda no restante.
- Bônus: registrar um evento de clique no próprio handler (`logEvent`) para medir
  cliques mesmo de quem não converte.

**Esforço:** baixo (1 rota + ajuste no ShareModal).

---

## 4. 🎙️ Voz premium com ElevenLabs

Hoje a leitura usa `speechSynthesis` (voz do sistema). Na v1 melhoramos a
seleção da melhor voz do aparelho — grátis, mas dependente do dispositivo.

**Arquitetura sugerida:** rota `/api/devotional/audio` que monta o texto, checa
cache no **Supabase Storage** (`audio/<devotional_id>.mp3`) e, se não existir,
chama a ElevenLabs (`eleven_multilingual_v2` ou `eleven_flash_v2_5`), salva e
devolve a URL. O player toca o MP3 em vez de sintetizar.

**Pontos-chave:** cobrança por caractere → **cache é obrigatório**; considerar
manter como benefício **premium** (o player já recebe `isPremium`).

**Esforço:** ~meio dia. Requer conta ElevenLabs (`ELEVENLABS_API_KEY`, `VOICE_ID`).

---

## 5. 👥 Sistema de indicação

A lógica está **pronta e mantida** no backend (rotas `/api/referral/*`,
recompensa de +7 dias premium para convidante e convidado ao ativar, captura do
código na URL). Só o **card foi escondido** do Perfil na v1.

**Para reativar:** devolver `<InviteCard />` ao `ProfileClient` (uma linha) e
revisar a copy do convite.

**Esforço:** mínimo.
