# PROJECT ANALYSIS

> Gerado em: 2026-06-07
> Versão: 0.1.0 (MVP)
> Baseado em: package.json, docRequisitos.md, tsconfig.json, src/types/index.ts, src/store/index.ts, src/lib/constants.ts, src/app/layout.tsx, src/app/page.tsx, src/app/api/devotional/generate/route.ts, src/lib/gemini/devotional-ai.ts, src/middleware.ts

---

## Executive Summary

"O Que Você Está Sentindo Hoje?" é um SaaS espiritual MVP baseado em inteligência artificial que gera devocionais personalizados em tempo real de acordo com o estado emocional do usuário. O sistema foi concebido para unir acolhimento emocional, profundidade bíblica, experiência contemplativa e tecnologia premium.

O produto resolve um problema real: muitas pessoas sentem ansiedade, dificuldade de constância espiritual, esgotamento emocional e precisam de direcionamento espiritual instantâneo sem uma estrutura genérica. O diferencial competitivo do sistema não é apenas IA, design ou devocional isoladamente, mas a personalização espiritual emocional em tempo real.

O projeto utiliza Next.js 16 como framework web, Supabase como backend BaaS com autenticação e persistência, Gemini 2.5 Flash como engine de IA para análise emocional e geração de conteúdo devotional, Stripe para pagamentos recorrentes, e Zustand para gerenciamento de estado do frontend. A arquitetura segue princípios de Clean Architecture combinados com organização feature-based.

O estado atual é MVP (versão 0.1.0) com implementação em andamento das funcionalidades principais: autenticação, seleção emocional, geração de devocionais, histórico, jornadas de 21 dias, diário espiritual e sistema de assinatura premium. O projeto está tecnicamente saudável com boas convenções de código, forte separação de responsabilidades e design system bem definido, mas requer atenção em testes automatizados, documentação de API e validação de segurança.

---

## Business Overview

"O Que Você Está Sentindo Hoje?" é um produto de nicho dentro do mercado de espiritualidade digital, posicionado entre aplicativos meditativos (como Calm, Headspace) e plataformas evangélicas tradicionais (como YouVersion). O mercado-alvo é cristãos modernos, jovens adultos (18-45 anos), digitalmente nativos, emocionalmente sobrecarregados e que valorizam tanto espiritualidade quanto tecnologia de qualidade.

A proposta de valor é clara: ao invés de ofertar conteúdo estático ou genérico, o sistema oferece **direcionamento espiritual instantâneo baseado no estado emocional actual**, criando uma experiência única para cada usuário em cada acesso. Isso gera percepção de alto valor, justificando um modelo de assinatura premium.

**Modelo de Negócio**: SaaS por assinatura com tier gratuito altamente limitado (1 geração vitalícia) e tier premium a R$ 24,90/mês. O objetivo do free tier não é sustentar uso contínuo, mas gerar impacto emocional suficiente para criar desejo de upgrade. A métrica de sucesso é a conversão desse único free user para premium.

**Objetivos**: gerar recorrência diária, criar retenção emocional, aumentar lifetime value (LTV), construir percepção premium, converter usuários em assinantes. As métricas-chave são D1 e D7 retention, tempo médio de sessão, MRR, churn e conversão premium.

---

## Stakeholders

| Perfil | Papel | Permissões |
|--------|-------|------------|
| Usuário Gratuito | Experimentar | 1 geração devocional vitalícia; acesso limitado ao histórico; sem jornadas |
| Usuário Premium | Máximo acesso | Devocionais ilimitados; jornadas 21 dias; histórico completo; modo madrugada; diário espiritual |
| Fundador/Admin | Proprietário | Acesso master mode (MASTER_MODE=true) para bypass de limites; gerenciamento de contas |

---

## Business Rules

### Regras Explícitas

**RN001 - Limite de Geração Gratuita**: Cada usuário gratuito tem direito a exatamente 1 (uma) geração completa vitalícia. Após usar, novas gerações são bloqueadas e exibem paywall.
- Arquivo de origem: `/src/lib/constants.ts` (FREE_DEVOTIONAL_LIMIT = 1)
- Implementação: `/src/app/api/devotional/generate/route.ts` (linhas 42-48)

**RN002 - Controle por Autenticação**: Todas as operações de geração e persistência requerem usuário autenticado via Supabase Auth.
- Arquivo de origem: `/src/app/api/devotional/generate/route.ts` (linhas 10-16)
- Verificação: `supabase.auth.getUser()` lança erro 401 se não autenticado

**RN003 - Estrutura do Devocional Completo**: Todo devocional gerado contém obrigatoriamente: título, versículo (texto + referência), reflexão, aplicação prática, oração, declaração de fé, pergunta reflexiva.
- Arquivo de origem: `/src/types/index.ts` (interface Devotional linhas 28-43)
- Implementação: `/src/lib/gemini/devotional-ai.ts` (systemPrompt JSON lines 59-68)

**RN004 - Análise Emocional Prévia**: Toda geração devocional é precedida por análise emocional automática que classifica: emoção primária, intensidade (low/medium/high), contexto espiritual, temas bíblicos e tom recomendado.
- Arquivo de origem: `/src/lib/gemini/devotional-ai.ts` (função analyzeEmotion linhas 4-32)
- Retorno: Interface EmotionAnalysis (`/src/types/index.ts` linhas 102-108)

**RN005 - Rastreamento de Streak**: O sistema incrementa automaticamente a contagem de dias consecutivos apenas se o usuário gera devocional em dias diferentes. Reseta para 1 se houver interrupção.
- Arquivo de origem: `/src/app/api/devotional/generate/route.ts` (linhas 93-107)
- Verificação: Compara `last_devotional_date` com data atual via timestamp

**RN006 - Persistência de Uso**: O contador `devotionals_used` marca permanentemente quantas gerações gratuitas foram utilizadas. Uma vez atingido o limite (1), não volta atrás.
- Arquivo de origem: `/src/app/api/devotional/generate/route.ts` (linhas 99-107)
- Integração: Campo `devotionals_used` no Supabase profiles table

**RN007 - Criação Automática de Perfil**: Se usuário autenticado não tiver profile no banco, o sistema cria automaticamente no primeiro acesso.
- Arquivo de origem: `/src/app/api/devotional/generate/route.ts` (linhas 18-39)
- Comportamento: Upsert automático com valores padrão

**RN008 - Bypass Master Mode**: Quando `MASTER_MODE=true` no environment, o limite de geração gratuita é ignorado (utilizado para desenvolvimento/testes).
- Arquivo de origem: `/src/app/api/devotional/generate/route.ts` (linha 43)
- Cuidado: Nunca deixar true em produção

### Regras Implícitas [inferência]

**RN009 - Personalização do Devocional**: A IA adapta a profundidade, tom e conteúdo bíblico com base na análise emocional. Uma emoção de alta intensidade recebe tratamento diferente de baixa intensidade.
- Evidência: `/src/lib/gemini/devotional-ai.ts` systemPrompt (linhas 42-56) referencia `intensity` e `recommended_tone`

**RN010 - Autenticação Implícita em Páginas**: Páginas como `/dashboard`, `/devotional/*`, `/journal` assumem usuário autenticado mas não implementam redirect explícito (deve estar no middleware ou ClientLayout).
- Evidência: `/src/app/emotion/page.tsx` usa router.push("/devotional/generate") sem verificação de auth

**RN011 - Cache Sensível de Cliente**: O store Zustand (`useDevotionalStore`) mantém estado transitório da geração atual na memória do navegador, sem persistência até save explícito.
- Evidência: `/src/store/index.ts` (DevotionalFlowState sem persist middleware)

**RN012 - Validação Mínima de Emoção**: Emoção raw deve ter pelo menos 2 caracteres, mas a IA pode rejeitar entradas não-substantivas.
- Evidência: `/src/app/api/devotional/generate/route.ts` (linha 53)

---

## Functional Flows

### Flow 1: Fluxo Principal de Geração Devocional

**Atores**: Usuário autenticado, Sistema de IA, Banco de Dados

1. Usuário chega em `/emotion` → vê categoria de emoções predefinidas (10 categorias) ou opção de digitar texto livre
2. Seleciona ou digita emoção (mínimo 2 caracteres)
3. Frontend chama `POST /api/devotional/generate` com payload `{ emotion_raw: string }`
4. Backend verifica autenticação (401 se falhar)
5. Backend carrega profile do usuário (ou cria automaticamente se não existir)
6. Backend valida limite gratuito: se free e devotionals_used >= 1, retorna 402 (payment required)
7. Backend chama `analyzeEmotion(emotion_raw)` via Gemini com system prompt de pastor conselheiro
8. Gemini retorna EmotionAnalysis em JSON: primary_emotion, intensity, spiritual_context, biblical_themes, recommended_tone
9. Backend chama `generateDevotional(emotion_raw, analysis, userName)` com system prompt específico
10. Gemini retorna DevotionalContent estruturado em JSON
11. Backend valida JSON parsed content
12. Backend insere registro em tabela `devotionals` com todos os campos
13. Backend atualiza profile: `devotionals_used++`, `total_devotionals++`, `streak_days` (reseta ou incrementa), `last_devotional_date`
14. Backend retorna 200 com { devotional, emotion_analysis }
15. Frontend recebe, armazena em Zustand store, redireciona para `/devotional/read` ou similiar
16. Usuário lê devocional em interface contemplativa

**Erros Esperados**: 
- 401: Não autenticado
- 402: Limite gratuito atingido
- 429: Quota da IA excedida
- 503: Modelo IA indisponível
- 500: Erro genérico (parsing JSON, insert DB, etc.)

**Arquivos Envolvidos**: `/src/app/emotion/page.tsx`, `/src/app/api/devotional/generate/route.ts`, `/src/lib/gemini/devotional-ai.ts`, `/src/store/index.ts`

---

### Flow 2: Autenticação e Sessão

**Atores**: Usuário não-autenticado, Supabase Auth, Middleware

1. Usuário chega em `/` (landing) → vê CTA "Começar agora" ou "Entrar"
2. Clica em "Começar agora" → vai para `/signup`
3. Usa email/senha ou Google OAuth
4. Supabase cria user e sessão
5. Middleware (`/src/middleware.ts` → `updateSession`) verifica sessão e injeta token
6. Usuário é redirecionado para onboarding (`/onboarding`) ou dashboard (`/dashboard`)
7. Contexto de auth é sincronizado via Supabase SSR

**Arquivos Envolvidos**: `/src/middleware.ts`, `/src/lib/supabase/middleware.ts`, `/src/app/login`, `/src/app/signup`, `/src/app/onboarding`

---

### Flow 3: Jornadas de 21 Dias [Parcialmente Implementado]

**Conceito**: Usuário premium pode iniciar uma "jornada" temática de 21 dias (ex: "Vencendo Ansiedade", "Fortalecendo a Fé"). Cada dia traz um devocional focado no tema da jornada.

**Temas Disponíveis**: (definidos em `/src/lib/constants.ts` JOURNEY_THEMES):
- Vencendo a Ansiedade (🌊)
- Fortalecendo a Fé (🔥)
- Paz Interior (🕊️)
- Identidade em Cristo (👑)
- Descobrindo o Propósito (🌟)
- Direção Espiritual (🧭)

**Status**: Estrutura de dados e endpoints existem (`/api/journey/*`), páginas de UI existem (`/journey`, `/journey/[slug]`), mas lógica de progressão de dias e geração diária contextualizada ainda está incompleta.

---

## Architecture Overview

O sistema segue uma **arquitetura em camadas com organização feature-based**, combinando princípios de Clean Architecture:

```
┌─────────────────────────────────────────────┐
│         PRESENTATION LAYER (Frontend)       │
│  React Components, Pages, UI State (Zustand)│
│  /app/* (Next.js App Router)                │
│  /components/*                              │
└──────────────┬──────────────────────────────┘
               │ HTTP Calls (fetch, axios-like)
┌──────────────▼──────────────────────────────┐
│      APPLICATION LAYER (API Routes)         │
│  /api/* (Next.js API Routes)                │
│  Business Logic, Validation, Orchestration  │
└──────────────┬──────────────────────────────┘
               │ SDK Calls
┌──────────────▼──────────────────────────────┐
│    INFRASTRUCTURE & DOMAIN LAYER            │
│  ├─ /lib/supabase/* (Auth, DB, Middleware) │
│  ├─ /lib/gemini/* (AI Emotion & Content)   │
│  ├─ /lib/stripe/* (Payment Integration)    │
│  ├─ /lib/constants.ts (Business Rules)     │
│  └─ /types/index.ts (Domain Entities)      │
└─────────────────────────────────────────────┘
```

**Fluxo de Dados Principal**:
1. Usuário interage com página React
2. Componente chama API Route (`/api/*`)
3. API Route orquestra: autenticação → validação → IA → persistência → resposta
4. IA (Gemini) processa emoção → contexto espiritual → conteúdo devocional
5. Dados persistidos em Supabase (PostgreSQL)
6. Frontend atualiza Zustand store e UI

**Padrões de Comunicação**:
- **Frontend ↔ Backend**: JSON via HTTP POST/GET
- **Backend ↔ IA**: Google Generative AI SDK (gemini-2.5-flash)
- **Backend ↔ Database**: Supabase JS SDK (real-time queries, mutations)
- **Backend ↔ Pagamento**: Stripe SDK (checkouts, webhooks)

---

## Technology Stack

| Camada | Tecnologia | Versão | Observação |
|--------|-----------|--------|------------|
| **Frontend Framework** | Next.js | 16.2.6 | App Router, SSR/SSG ready |
| **UI Library** | React | 19.2.4 | Latest with Server Components |
| **Linguagem** | TypeScript | 5.x | Strict mode |
| **Styling** | TailwindCSS | 4.x | Via @tailwindcss/postcss |
| **UI Components** | shadcn/ui + Radix UI | Latest | Buttons, Dialogs, Dropdowns, Tabs, Toast, etc. |
| **Animações** | Framer Motion | 12.38.0 | Ambient, fade, parallax |
| **Forms** | React Hook Form | 7.76.0 | com Zod validation |
| **Validação** | Zod | 4.4.3 | Schema validation |
| **State Management** | Zustand | 5.0.13 | Lightweight, persist middleware |
| **Backend** | Supabase | 2.105.4 | PostgreSQL + Auth + Real-time |
| **Backend SSR** | @supabase/ssr | 0.10.3 | Middleware integration |
| **IA - Emotion** | Google Generative AI | 0.24.1 | Gemini 2.5 Flash |
| **IA - Content** | OpenAI SDK | 6.38.0 | Available but not used (Gemini preferred) |
| **Pagamentos** | Stripe | 22.1.1 | Checkout sessions, webhooks |
| **Icons** | Lucide React | 1.16.0 | 300+ icons |
| **Utility** | clsx | 2.1.1 | Class merging |
| **Utility** | tailwind-merge | 3.6.0 | Merge Tailwind classes |
| **DevDependencies** | ESLint | 9.x | Code linting |
| **DevDependencies** | TypeScript ESLint | Latest | TS linting rules |

**Observações importantes**:
- OpenAI SDK está instalado mas não está sendo usado (código usa Gemini)
- Stripe está pronto mas integração de checkout pode estar incompleta
- Supabase é BaaS central: autentica, persiste dados, pode hospedar functions
- TailwindCSS 4 é versão nova, usar cautela com plugins customizados

---

## Project Structure

```
projeto/
├── public/                    # Arquivos estáticos, ícones PWA, og-image
│   ├── icon-192.png          # PWA icon
│   ├── icon-512.png          # PWA icon
│   ├── og-image.png          # Social sharing
│   └── *.svg                 # Decorative SVGs
│
├── src/
│   ├── app/                  # Next.js App Router (route segments)
│   │   ├── globals.css       # Variáveis CSS (--brand-purple, --bg-base, etc.)
│   │   ├── layout.tsx        # Root layout, fonts, metadata, PWA config
│   │   ├── page.tsx          # Landing page (/)
│   │   │
│   │   ├── api/              # API Routes (Backend)
│   │   │   ├── devotional/
│   │   │   │   ├── generate/route.ts      # POST gera novo devocional
│   │   │   │   └── save/route.ts          # POST salva devocional como favorito
│   │   │   ├── journal/route.ts           # POST/GET entradas diário
│   │   │   ├── journey/
│   │   │   │   ├── generate/route.ts      # POST gera jornada 21 dias
│   │   │   │   └── plan/route.ts          # GET retorna plano detalhado
│   │   │   ├── checkout/session/route.ts  # POST cria Stripe checkout
│   │   │   ├── webhook/stripe/route.ts    # POST webhook pagamentos
│   │   │   └── dev/master/route.ts        # DEV ONLY - bypass limites
│   │   │
│   │   ├── auth/             # Autenticação
│   │   │   └── callback/route.ts          # OAuth callback (Google, etc.)
│   │   │
│   │   ├── login/page.tsx    # Página de login
│   │   ├── signup/page.tsx   # Página de cadastro
│   │   ├── forgot-password/  # Recuperação de senha
│   │   ├── reset-password/   # Reset de senha
│   │   │
│   │   ├── onboarding/page.tsx            # Onboarding emocional (RF002)
│   │   │
│   │   ├── dashboard/        # Dashboard principal
│   │   │   ├── page.tsx
│   │   │   └── DashboardClient.tsx
│   │   │
│   │   ├── emotion/page.tsx  # Seleção de emoção (RN003)
│   │   │
│   │   ├── devotional/       # Leitura de devocional
│   │   │   ├── generate/page.tsx          # Página de geração (animações)
│   │   │   ├── read/page.tsx              # Leitura do devocional
│   │   │   └── history/page.tsx           # Histórico de devocionais
│   │   │
│   │   ├── journal/page.tsx  # Diário espiritual (RF007)
│   │   │
│   │   ├── journey/          # Jornadas 21 dias
│   │   │   ├── page.tsx      # Lista de jornadas
│   │   │   └── [slug]/page.tsx            # Jornada específica
│   │   │
│   │   ├── subscription/page.tsx          # Gerenciamento de assinatura
│   │   ├── profile/page.tsx  # Perfil do usuário
│   │   │
│   │   ├── manifest.ts       # PWA manifest
│   │   ├── favicon.ico
│   │
│   ├── components/           # Componentes reutilizáveis
│   │   ├── ClientLayout.tsx  # Wrapper de contexto/providers
│   │   ├── BottomNav.tsx     # Navegação mobile
│   │   ├── DesktopSidebar.tsx # Sidebar desktop
│   │   ├── AmbientSphere.tsx # Esfera 3D decorativa (landing)
│   │   ├── ShareModal.tsx    # Modal de compartilhamento
│   │   └── auth/
│   │       └── GoogleButton.tsx           # OAuth button
│   │
│   ├── lib/                  # Utilitários e integrações
│   │   ├── constants.ts      # Regras de negócio (limites, temas, achievements)
│   │   ├── utils.ts          # Helper functions
│   │   │
│   │   ├── supabase/
│   │   │   ├── client.ts     # Browser client singleton
│   │   │   ├── server.ts     # Server-side client (cookies)
│   │   │   └── middleware.ts # Session refresh middleware
│   │   │
│   │   ├── gemini/
│   │   │   ├── client.ts     # Google Generative AI client
│   │   │   └── devotional-ai.ts # Funções de IA (analyze + generate)
│   │   │
│   │   ├── openai/
│   │   │   ├── client.ts     # OpenAI client (não utilizado)
│   │   │   └── devotional-ai.ts # Fallback (não utilizado)
│   │   │
│   │   └── stripe/
│   │       └── client.ts     # Stripe server-side
│   │
│   ├── store/               # Zustand stores
│   │   └── index.ts         # useAuthStore, useDevotionalStore, useUIStore
│   │
│   ├── types/               # TypeScript domain entities
│   │   └── index.ts         # User, Devotional, Journey, EmotionAnalysis, etc.
│   │
│   └── middleware.ts        # Next.js middleware (session auth)
│
├── supabase/                # [Diretório possivelmente vazio]
│   └── [migrations se existirem]
│
├── .claude/                 # Claude Code config
├── .vscode/                 # VS Code config
├── .env.local               # Variáveis de ambiente (não commitado)
├── .env.example             # Template de .env
├── .gitignore               # Git ignore rules
│
├── package.json             # Dependências e scripts
├── tsconfig.json            # TypeScript config (strict: true)
├── next.config.ts           # Next.js config (vazio, pronto para expansão)
├── eslint.config.mjs        # ESLint rules
├── postcss.config.mjs       # PostCSS plugins
│
├── README.md                # Docs padrão Next.js (não customizado)
├── docRequisitos.md         # Documento de requisitos (IMPORTANTE - fonte de verdade)
│
└── .git/                    # Git repository
```

**Observações**:
- Arquivo `/docRequisitos.md` é a **fonte de verdade** para requisitos de negócio
- Arquivo `/src/lib/constants.ts` é a **fonte de verdade** para regras de negócio implementadas
- Arquivo `/src/types/index.ts` define domínio (entities)
- Estrutura de `/src/app` segue Next.js App Router conventions
- Não há /features directory apesar de docRequisitos.md mencionar "Feature-Based Architecture" - está implementado implicitamente via /api, /components, /lib

---

## Frontend Analysis

**Framework**: Next.js 16 (App Router)
- Renderização: Híbrida (Server Components por padrão, Client Components onde necessário com "use client")
- Routing: File-system baseado em diretórios de /app
- SSR: Habilitado implicitamente

**Organização de Componentes**: 
- Componentes reutilizáveis em `/components`
- Páginas em `/app/[route]/page.tsx`
- Client-side wrappers em `/app/[route]/[Component]Client.tsx` (exemplo: DashboardClient, JournalClient)
- Padrão: Server page.tsx imports ClientComponent para hybrid rendering

**Fluxo de Navegação**:
```
/ (landing) → /login ou /signup
              ↓
          /onboarding (emocional)
              ↓
          /dashboard
          ├─ /emotion (escolha emoção)
          │  └─ /devotional/generate
          │     └─ /devotional/read
          ├─ /devotional/history
          ├─ /journal
          ├─ /journey (lista)
          │  └─ /journey/[slug]
          ├─ /subscription
          └─ /profile
```

**Gerenciamento de Estado**:
- **Auth**: `useAuthStore` (Zustand) - armazena user object
- **Devotional Flow**: `useDevotionalStore` (Zustand) - currentEmotion, emotionAnalysis, currentDevotional, isGenerating
- **UI**: `useUIStore` (Zustand, persistido) - nightMode, sidebarOpen
- **Sem Redux/Context**: Zustand preferred para simplificar

**Design System**:
- **Cores**: Variáveis CSS em `/src/app/globals.css`
  - `--brand-purple` (#A855F7)
  - `--bg-base`, `--text-primary`, `--text-secondary`, `--text-muted`
  - `--glass-border`, `--gradient-button`
- **Animações**: Framer Motion
  - Fade suave (opacity 0→1)
  - Parallax leve (x/y movement)
  - Ambient animations (infinitas, ease-in-out)
  - Transições cinematográficas (delay, stagger)
- **Componentes UI**: shadcn/ui + Radix UI
  - Dialog, Dropdown, Label, Progress, ScrollArea, Separator, Slot, Switch, Tabs, Toast, Tooltip
- **Styling**: TailwindCSS 4 + tailwind-merge para class composition
- **Fontes**: Google Fonts
  - Inter (--font-inter) - corpo de texto
  - Cormorant Garamond (--font-cormorant) - titulos elegantes
  - Plus Jakarta Sans (--font-jakarta) - headings dinâmicos
- **Tema Visual**: Dark premium, glassmorphism, aurora gradients, cinematic motion
  - Referências: Apple, Linear, Calm, Headspace, Raycast, Notion, Stripe

**Responsividade**:
- Mobile-first (padrão TailwindCSS)
- Viewport: `device-width`, `initial-scale=1`
- Ícones PWA: 192px + 512px
- Meta tags: og-image.png, twitter:card

**Forms & Validação**:
- React Hook Form + Zod
- Schema validation antes de submit
- Tipos TypeScript fortes

---

## Backend Analysis

**Framework**: Next.js App Router API Routes (`/src/app/api`)
- Cada diretório route.ts é um endpoint
- Suporta GET, POST, PUT, DELETE, etc.
- Context: NextRequest, NextResponse

**Estrutura de Módulos**:
- `/api/devotional/*` - Geração e persistência de devocionais
- `/api/journal/*` - Entradas de diário
- `/api/journey/*` - Jornadas temáticas 21 dias
- `/api/checkout/*` - Integração Stripe
- `/api/webhook/*` - Webhooks (Stripe)
- `/api/auth/*` - OAuth callbacks
- `/api/dev/*` - Endpoints de desenvolvimento (bypass limites)

**Padrão Arquitetural**:
- **Middleware Pattern**: Autenticação no topo de cada route
- **Service Pattern**: Funções isoladas em `/lib` (analyzeEmotion, generateDevotional)
- **DTO Pattern**: Types em `/types/index.ts`
- **Strategy Pattern**: Múltiplos providers IA (Gemini, OpenAI - fallback)
- **Repository Pattern (Implícito)**: Supabase SDK abstrai DB

**Controllers/Rotas Principais**:

| Endpoint | Método | Propósito | Autenticação |
|----------|--------|-----------|-------------|
| `/api/devotional/generate` | POST | Gera novo devocional | Requer user |
| `/api/devotional/save` | POST | Favorita devocional | Requer user |
| `/api/journal` | POST/GET | CRUD entradas diário | Requer user |
| `/api/journey/generate` | POST | Inicia jornada 21d | Premium |
| `/api/journey/plan` | GET | Retorna plano jornada | Requer user |
| `/api/checkout/session` | POST | Cria Stripe checkout | Requer user |
| `/api/webhook/stripe` | POST | Processa webhooks | Secret key |
| `/api/auth/callback` | GET | OAuth redirect | Supabase |
| `/api/dev/master` | POST | MASTER_MODE bypass | Dev only |

**Serviços**:
- `analyzeEmotion(emotionRaw)` → EmotionAnalysis via Gemini
- `generateDevotional(emotionRaw, analysis, userName)` → DevotionalContent via Gemini
- Supabase Auth client (login, register, session management)
- Supabase Database client (insert, select, update devotionals, profiles, journals)
- Stripe client (create checkout sessions, handle webhooks)

**Repositórios (Implícito via Supabase SDK)**:
```typescript
// Profile queries
supabase.from("profiles").select().eq("id", user.id).single()
supabase.from("profiles").upsert({...}).select().single()
supabase.from("profiles").update({...}).eq("id", user.id)

// Devotional queries
supabase.from("devotionals").insert({...}).select().single()
supabase.from("devotionals").select().eq("user_id", user.id)

// Journal queries
supabase.from("journal_entries").insert({...})
supabase.from("journal_entries").select().eq("user_id", user.id)
```

**Domínio/Entidades** (definidas em `/src/types/index.ts`):
- `User`: id, email, name, avatar_url, subscription_tier, devotionals_used, streak_days, total_devotionals, onboarding_completed, night_mode_preference, created_at
- `Devotional`: id, user_id, emotion, emotion_raw, title, verse, verse_reference, reflection, practical_application, prayer, declaration, reflective_question, is_saved, created_at
- `JournalEntry`: id, user_id, devotional_id, content, emotion, created_at
- `Journey`: id, slug, title, description, theme, total_days, cover_emoji
- `UserJourney`: id, user_id, journey_id, current_day, completed, started_at
- `EmotionAnalysis`: primary_emotion, intensity, spiritual_context, biblical_themes, recommended_tone
- `DevotionalContent`: title, verse, verse_reference, reflection, practical_application, prayer, declaration, reflective_question

---

## Database Analysis

**SGBD**: PostgreSQL (via Supabase managed service)

**Entidades Principais**:

| Entidade | Descrição | Relações |
|----------|-----------|----------|
| **auth.users** | Usuários autenticados (Supabase managed) | N:1 profiles |
| **profiles** | Perfil do usuário | 1:N devotionals, 1:N journal_entries, 1:N user_journeys |
| **devotionals** | Devocionais gerados | N:1 profiles |
| **journal_entries** | Entradas do diário espiritual | N:1 profiles, N:1 devotionals (opcional) |
| **journeys** | Templates de jornadas 21 dias | 1:N user_journeys |
| **user_journeys** | Progresso do usuário em jornadas | N:1 profiles, N:1 journeys |
| **achievements** | Conquistas desbloqueadas | N:M users (via junction table) [não implementado] |
| **subscriptions** | Histórico de assinaturas (Stripe-synced) | N:1 profiles |

**Relacionamentos Críticos**:
```sql
-- profiles.id = auth.users.id (FK)
-- devotionals.user_id = profiles.id (FK)
-- journal_entries.user_id = profiles.id (FK)
-- journal_entries.devotional_id = devotionals.id (FK, optional)
-- user_journeys.user_id = profiles.id (FK)
-- user_journeys.journey_id = journeys.id (FK)
```

**Schema Inferido** (baseado no código, não schema visto):

```sql
-- profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255),
    name VARCHAR(255),
    avatar_url TEXT,
    subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free' | 'premium'
    devotionals_used INT DEFAULT 0,
    total_devotionals INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    last_devotional_date DATE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    night_mode_preference BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- devotionals
CREATE TABLE devotionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    emotion VARCHAR(100),
    emotion_raw TEXT,
    title VARCHAR(255),
    verse TEXT,
    verse_reference VARCHAR(100),
    reflection TEXT,
    practical_application TEXT,
    prayer TEXT,
    declaration TEXT,
    reflective_question TEXT,
    is_saved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- journal_entries
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    devotional_id UUID REFERENCES devotionals(id),
    content TEXT,
    emotion VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- journeys
CREATE TABLE journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE,
    title VARCHAR(255),
    description TEXT,
    theme VARCHAR(100),
    total_days INT DEFAULT 21,
    cover_emoji VARCHAR(10)
);

-- user_journeys
CREATE TABLE user_journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    journey_id UUID NOT NULL REFERENCES journeys(id),
    current_day INT DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT NOW()
);
```

**Índices Relevantes** [não visto, sugerido]:
- PRIMARY KEY em cada tabela
- FK indexes: devotionals.user_id, journal_entries.user_id, user_journeys.user_id
- UNIQUE index em journeys.slug
- Composite index: (user_id, created_at) em devotionals para queries rápidas de histórico

**Constraints & Rules**:
- devotionals_used nunca pode exceder FREE_DEVOTIONAL_LIMIT (1) para tier='free'
- streak_days reseta quando gap > 1 dia em last_devotional_date
- subscription_tier = 'premium' requerido para acessar journeys
- email deve ser único (via auth.users)

---

## API Analysis

| Método | Rota | Propósito | Autenticação | Status |
|--------|------|-----------|-------------|--------|
| POST | `/api/devotional/generate` | Gera novo devocional via IA | Bearer token (Supabase) | Implementado ✓ |
| POST | `/api/devotional/save` | Marca devocional como favorito | Bearer token | Parcial |
| GET/POST | `/api/journal` | CRUD entradas diário | Bearer token | Em desenvolvimento |
| POST | `/api/journey/generate` | Inicia jornada 21 dias | Bearer token + Premium | Em desenvolvimento |
| GET | `/api/journey/plan` | Retorna plano detalhado jornada | Bearer token | Em desenvolvimento |
| POST | `/api/checkout/session` | Cria sessão Stripe checkout | Bearer token | Implementado ✓ |
| POST | `/api/webhook/stripe` | Processa webhook Stripe | Secret key | Implementado ✓ |
| GET | `/api/auth/callback` | OAuth callback handler | Supabase session | Implementado ✓ |
| POST | `/api/dev/master` | Bypass de limites (dev only) | process.env.MASTER_MODE | Implementado ⚠️ |

**Padrão de Resposta de Sucesso**:
```json
{
  "devotional": {
    "id": "uuid",
    "user_id": "uuid",
    "emotion": "ansioso",
    "emotion_raw": "muito preocupado com o futuro",
    "title": "Quando a Preocupação Quer Roubar Sua Paz",
    "verse": "Não se preocupem com nada...",
    "verse_reference": "Filipenses 4:6-7",
    "reflection": "...",
    "practical_application": "...",
    "prayer": "...",
    "declaration": "...",
    "reflective_question": "...",
    "is_saved": false,
    "created_at": "2026-06-07T..."
  },
  "emotion_analysis": {
    "primary_emotion": "ansiedade",
    "intensity": "high",
    "spiritual_context": "Preocupação como falta de confiança em Deus",
    "biblical_themes": ["fé", "confiança", "paz em Deus", "entrega"],
    "recommended_tone": "acolhedor, encorajador"
  }
}
```

**Padrão de Erro**:
```json
{
  "error": "limit_reached" | "quota_exceeded" | "model_unavailable" | "string message",
  "message": "Descrição amigável ao usuário"
}
```

**Status Codes**:
- 200: Sucesso
- 400: Validação falhou (emoção inválida)
- 401: Não autenticado
- 402: Limite gratuito atingido (Payment Required)
- 429: Quota IA excedida ou rate limit
- 500: Erro interno (parsing, DB, etc.)
- 503: Serviço indisponível (IA model offline)

---

## Security Analysis

**Autenticação**: 
- ✓ Supabase Auth com email/senha e Google OAuth integrados
- ✓ Session tokens persistidos em cookies (SSR middleware)
- ✓ Verificação `getUser()` em cada endpoint sensível
- ✓ HTTPS obrigatório em produção (env var NEXT_PUBLIC_APP_URL)

**Autorização**:
- ✓ Verificação tier: `if (profile.subscription_tier !== "premium")` antes de features premium
- ✓ Row-level security (RLS) possível em Supabase (não visto implementado, verificar)
- ⚠️ Falta de RBAC explícito (admin vs user vs moderator)

**Proteção de APIs**:
- ✓ CORS implícito (Next.js same-origin)
- ✓ Validação de entrada: comprimento mínimo 2 chars em emotion_raw
- ✓ Webhook Stripe com secret key verification
- ⚠️ Rate limiting não implementado (poderia haver brute force em free limit check)

**Proteção de Dados**:
- ✓ Senhas: delegadas ao Supabase Auth (bcrypt)
- ✓ HTTPS: obrigatório
- ⚠️ Dados sensíveis (orações, reflexões intimas): armazenados sem encriptação extra (confiar em Supabase backup security)
- ⚠️ Tokens OAuth: armazenados em Supabase (confiar em sua segurança)

**Variáveis de Ambiente** [críticas]:
- `NEXT_PUBLIC_SUPABASE_URL`: Necessária, pública
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key pública (Supabase permite apenas queries específicas via RLS)
- `NEXT_PUBLIC_APP_URL`: Base URL (produção)
- `STRIPE_SECRET_KEY`: Privada, servidor only
- `STRIPE_WEBHOOK_SECRET`: Privada, servidor only
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth (via Supabase ou direto)
- `MASTER_MODE`: ⚠️ NUNCA deve ser true em produção

**Vulnerabilidades Identificadas**:
1. **MASTER_MODE Exposure** [Severidade: Alta] - Se `process.env.MASTER_MODE="true"` escapar para produção, qualquer pessoa pode gerar devocionais ilimitados mesmo no tier free. Recomendação: remover essa flag ou usar IP whitelist.
2. **Rate Limiting Ausente** [Severidade: Média] - Sem rate limit, um atacante pode fazer muitas requisições ao `/api/devotional/generate` e esgottar quota Gemini. Recomendação: implementar middleware de rate limiting.
3. **CORS Presumido** [Severidade: Baixa] - Verificar se RLS está configurado em Supabase. Sem RLS, um usuário autenticado poderia potencialmente ler dados de outro usuário.
4. **Falta de CSRF Token** [Severidade: Baixa] - Next.js mitigação automática, mas verificar se forms críticas (checkout) usam tokens.

**O que Está Bem**:
- Autenticação obrigatória para endpoints sensíveis
- Session management via Supabase SSR
- Types TypeScript fortes (reduz erros)
- Validação de emoção_raw antes de enviar para IA

---

## DevOps Analysis

**CI/CD**: 
- ❌ Não identificado (não há `.github/workflows`, `.gitlab-ci.yml`, etc.)
- Sugestão: GitHub Actions para testes, build, deploy para Vercel

**Containerização**:
- ❌ Não identificado (sem Dockerfile, docker-compose.yml)
- Sugestão: Se deploy não-Vercel, criar Dockerfile Node.js

**Variáveis de Ambiente**:
- **Local Dev**: `.env.local` (não commitado)
- **Template**: `.env.example` (não visto, criar se faltar)
- **Críticas**: SUPABASE_URL, SUPABASE_ANON_KEY, STRIPE_SECRET_KEY, MASTER_MODE

**Monitoramento/Observabilidade**:
- ❌ Não identificado
- Sugestão: Integrar Sentry para erro reporting, Vercel Analytics para performance

**Estratégia de Deploy**:
- **Provável**: Vercel (Next.js native, mencionado em README original)
- **Build**: `npm run build` (Next.js padrão)
- **Start**: `npm run start` (Next.js padrão)
- **Dev**: `npm run dev` (localhost:3000)

**Secrets Management**:
- **Local**: `.env.local` (git ignored)
- **Vercel**: Secrets via Vercel dashboard (ambiente variables)
- **Produção**: Usar managed secrets (não hardcode)

---

## Design Patterns

| Padrão | Onde é usado | Arquivo de referência |
|--------|-------------|----------------------|
| **Server Component** | Root layout, pages | `/src/app/layout.tsx`, `/src/app/page.tsx` |
| **Client Component** | Interactive forms, state | `/src/app/emotion/page.tsx` (use client) |
| **Custom Hook** | State logic | useAuthStore, useDevotionalStore (Zustand) |
| **Container/Presenter** | Page + Client wrapper | `/src/app/dashboard/page.tsx` + DashboardClient.tsx |
| **Provider Pattern** | Zustand stores in ClientLayout | `/src/components/ClientLayout.tsx` |
| **Factory Pattern** | createClient (Supabase singleton) | `/src/lib/supabase/client.ts` |
| **Strategy Pattern** | analyzeEmotion + generateDevotional (swappable) | `/src/lib/gemini/devotional-ai.ts` |
| **Repository Pattern** | Supabase query abstraction | Implícito em `/src/app/api/devotional/generate/route.ts` |
| **DTO Pattern** | EmotionAnalysis, DevotionalContent types | `/src/types/index.ts` |
| **Middleware Pattern** | Authentication in API routes | `/src/app/api/devotional/generate/route.ts` (top check) |
| **Singleton Pattern** | Zustand store instances | `/src/store/index.ts` |

---

## Anti Patterns

| Problema | Localização | Impacto | Severidade |
|----------|------------|---------|-----------|
| **MASTER_MODE Flag** | `/src/app/api/devotional/generate/route.ts` linha 43 | Se exposto, quebra toda lógica de pagamento | Alta |
| **Hard-coded Magic Numbers** | Falta constants para timeouts, delays | Dificuldade para ajustar timings | Média |
| **Falta de Error Handling Granular** | `/src/lib/gemini/devotional-ai.ts` | Erros genéricos, difícil debugar | Média |
| **State Imperativo em Store** | `/src/store/index.ts` | Possível race condition se múltiplas gerações simultâneas | Baixa |
| **Sem Rate Limiting** | Todos `/api/*` endpoints | Vulnerável a DOS | Média |
| **Sem Logging** | `/src/app/api/*` | Difícil debugar problemas em produção | Média |

---

## Technical Debt

| Item | Localização | Descrição | Prioridade |
|------|------------|-----------|-----------|
| **Testes Automatizados** | Projeto inteiro | Não há testes unitários, integração ou E2E | Alta |
| **Documentação de API** | `/src/app/api/*` | Sem OpenAPI/Swagger ou inline docs | Alta |
| **Implementação Journeys** | `/src/app/api/journey/*` | Lógica de progresso incompleta (current_day não incrementa) | Alta |
| **Schema Database** | Supabase | Migrations não vistas, RLS não confirmado | Alta |
| **Logging/Telemetry** | Projeto inteiro | Sem logs estruturados, Sentry, etc. | Média |
| **Rate Limiting** | Todos endpoints | Proteção contra DOS/brute force ausente | Média |
| **Email Notifications** | Não implementado | Sem confirmação de email, reset password email | Média |
| **OpenAI Fallback** | `/src/lib/openai/` | Código existe mas não integrado (usar Gemini) | Baixa |
| **Design Tokens** | `/src/app/globals.css` | Algumas cores hard-coded em componentes | Baixa |
| **README Project** | `/README.md` | Apenas boilerplate Next.js, não descreve este projeto | Baixa |

---

## Risks

| Risco | Probabilidade | Impacto | Mitigação sugerida |
|-------|-------------|---------|-------------------|
| **MASTER_MODE em Produção** | Média | Alto - quebra monetização | Remover flag ou usar env validation na build |
| **Rate Limiting Gemini** | Alta | Médio - usuários veem erro 429 | Implementar client-side rate limit + server queue |
| **Churn Alto (Free → Sem Upgrade)** | Alta | Alto - LTV baixo | Melhorar copy paywall, A/B test copy |
| **Latência Geração (Gemini 2s)** | Média | Médio - UX pobre | Cache prompts, usar streaming, otimizar prompts |
| **Dados Vazados (OAuth tokens)** | Baixa | Alto | Confiar em Supabase security, usar RLS |
| **Falta de Tests Antes Launch** | Alta | Alto - bugs em produção | Criar suite de testes antes beta |
| **Database Scaling** | Baixa (Supabase managed) | Médio | Auto-scaling Supabase, monitorar connections |
| **Google API Key Exposed** | Média | Alto | Usar server-side Gemini calls only, não expo em browser |

---

## Recommendations

1. **[URGENTE] Remover MASTER_MODE ou Proteger** [Prioridade: Alta]
   - Remove a flag `process.env.MASTER_MODE` ou proteja com verificação de IP whitelist + token secreto
   - Razão: Se exposto, quebra toda lógica de pagamento premium
   - Benefício esperado: Integridade de monetização garantida

2. **[URGENTE] Implementar Testes** [Prioridade: Alta]
   - Criar suite Jest para testes unitários de funções críticas (analyzeEmotion, generateDevotional)
   - Criar testes E2E Cypress/Playwright para fluxo principal (emotion → devocional → save)
   - Razão: Código crítico sem testes antes de launch
   - Benefício esperado: Confiança em releases, detecção rápida de regressões

3. **[URGENTE] Completar Implementação de Journeys** [Prioridade: Alta]
   - Implementar lógica de incremento automático de current_day diário
   - Implementar geração de devocionais contextualizados por dia/tema
   - Criar endpoint GET para retornar devocional do dia
   - Razão: Feature importante para premium, mas incompleta
   - Benefício esperado: Feature premium funcional, aumenta retenção

4. **[IMPORTANTE] Implementar Rate Limiting** [Prioridade: Média]
   - Usar middleware Next.js ou biblioteca `@vercel/kv` para Redis-based rate limiting
   - Limitar: 10 requests/min por user em /api/devotional/generate, 100 requests/min global
   - Razão: Proteção contra DOS, controle de quota Gemini
   - Benefício esperado: Sistema mais estável e previsível

5. **[IMPORTANTE] Adicionar Logging Estruturado** [Prioridade: Média]
   - Integrar Sentry para erro tracking em produção
   - Implementar console.log estruturado em endpoints críticos (emotion analysis, payment)
   - Razão: Sem logs, impossível debugar problemas em produção
   - Benefício esperado: Debugging mais rápido, menos downtime

6. **[IMPORTANTE] Documentar API** [Prioridade: Média]
   - Adicionar JSDoc comments em endpoints `/api/*`
   - Criar ou exportar OpenAPI spec para clients
   - Razão: Novo desenvolvedor não consegue entender API sem explorar código
   - Benefício esperado: Onboarding mais rápido de devs

7. **Otimizar Prompts de IA** [Prioridade: Média]
   - Testar diferentes temperaturas, max tokens, system prompts
   - Medir qualidade de output (relevância, profundidade)
   - Implementar feedback loop de usuário (reação ao devocional)
   - Razão: Output IA é o core do produto, qualidade importa muito
   - Benefício esperado: Devocionais mais profundos, melhor retenção

8. **Implementar Confirmação de Email** [Prioridade: Baixa]
   - Usar Supabase Auth email verification flow
   - Enviar email de boas-vindas com próximos passos
   - Razão: Reduz spam, melhora segurança, cria touchpoint marketing
   - Benefício esperado: Emails validados, melhor comunicação

9. **Criar Dashboard Admin** [Prioridade: Baixa]
   - Endpoints GET /api/admin/users, /api/admin/analytics
   - Dashboard para monitorar MRR, churn, novo users
   - Razão: Visibilidade no negócio, decisões data-driven
   - Benefício esperado: Melhor entendimento da saúde do produto

10. **Otimizar Design System** [Prioridade: Baixa]
    - Extrair cores, spacing, typography para Tailwind config
    - Padronizar component props, criar Storybook
    - Razão: Facilita manutenção, garante consistência visual
    - Benefício esperado: Scaling mais rápido de features UI

---

## Glossary

| Termo | Definição no contexto do sistema |
|-------|----------------------------------|
| **Devocional** | Conteúdo personalizado gerado pela IA contendo versículo, reflexão, oração e aplicação prática baseado na emoção do usuário |
| **Emoção Raw** | Texto livre digitado ou categoria selecionada pelo usuário descrevendo seu estado emocional |
| **Emotion Analysis** | Resultado da análise da IA identificando emoção primária, intensidade, contexto espiritual e temas bíblicos |
| **Jornada de 21 Dias** | Série temática de devocionais diários focados em aprofundamento de um tema (ex: ansiedade, fé) |
| **Tier** | Nível de assinatura: "free" (1 devocional) ou "premium" (acesso completo) |
| **Streak** | Contagem de dias consecutivos em que o usuário gerou pelo menos um devocional |
| **Master Mode** | Flag de desenvolvimento que desativa limites de quota (NUNCA em produção) |
| **Supabase** | Backend-as-a-Service gerenciado (PostgreSQL + Auth + Real-time) |
| **Gemini 2.5 Flash** | Modelo de IA do Google usado para análise emocional e geração de conteúdo |
| **RLS** | Row-Level Security - segurança de nível de linhas no PostgreSQL/Supabase |
| **Conversão Premium** | Ato de um usuário free realizar upgrade para tier premium (via Stripe) |
| **Paywall** | Página/modal que bloqueia feature premium e oferece upgrade |
| **PWA** | Progressive Web App - aplicação web que funciona offline com app-like experience |
| **Zustand** | Biblioteca de state management minimalista para React |
| **SSR/SSG** | Server-Side Rendering / Static Site Generation - estratégias de rendering Next.js |

---

## Context For Other Skills

> Esta seção é a **fonte de contexto para qualquer outra skill** trabalhar neste projeto sem reanalisar do zero.

### Regras Críticas de Negócio

1. **1 Devocional Gratuito Vitalício**: Cada usuário free tem direito a EXATAMENTE 1 geração. Após usar, novas gerações são bloqueadas com erro 402. Esta é a **alavanca de conversão** do modelo de negócio.

2. **Autenticação Obrigatória**: Todas as operações sensíveis (gerar devocional, salvar, diário, jornadas) requerem usuário autenticado via Supabase Auth. Sem auth = 401.

3. **Estrutura Devocional Imutável**: Todo devocional DEVE conter exatamente estes 7 campos gerados pela IA: título, versículo (texto + ref), reflexão, aplicação, oração, declaração, pergunta. Não é permitido omitir campos.

4. **Análise Emocional Prévia Obrigatória**: TODA geração devocional passa por `analyzeEmotion()` primeiro. A análise (emoção primária, intensidade, temas bíblicos) guia o tom e conteúdo do devocional gerado.

5. **Tier Premium para Jornadas**: Jornadas de 21 dias são **exclusivamente premium**. Usuários free NÃO podem iniciar. Implementar verificação `if (subscription_tier !== "premium")`.

6. **Streak Diário Automático**: O sistema incrementa streak apenas se houver gap de exatamente 1 dia entre gerações. Gaps maiores resetam para 1.

7. **MASTER_MODE = Danger**: Se `process.env.MASTER_MODE="true"`, o free limit é ignorado. NUNCA deixar true em produção. Use apenas em dev/testing.

### Convenções do Projeto

**Naming**:
- Arquivos: kebab-case (`devotional-ai.ts`, `emotion-page.tsx`)
- Variáveis/funções: camelCase (`emotionRaw`, `analyzeEmotion`)
- Tipos/interfaces: PascalCase (`User`, `Devotional`, `EmotionAnalysis`)
- Componentes React: PascalCase (`DashboardClient`, `AmbientSphere`)
- Zustand stores: `useXxxStore` (`useAuthStore`, `useDevotionalStore`)

**Estrutura de Pastas**:
- Páginas: `/src/app/[route]/page.tsx` (Server Component)
- Client wrappers: `/src/app/[route]/[Component]Client.tsx` ("use client")
- API endpoints: `/src/app/api/[domain]/[action]/route.ts`
- Componentes reutilizáveis: `/src/components/[Component].tsx`
- Tipos: `/src/types/index.ts` (centralizado)
- Stores: `/src/store/index.ts` (centralizado)
- Libs/services: `/src/lib/[domain]/[service].ts`
- Constantes: `/src/lib/constants.ts` (regras de negócio)

**Padrão de API Routes**:
```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient(); // Autenticação
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "..." }, { status: 401 });
  
  // Validação
  // Lógica de negócio
  // Persistência
  // Resposta
}
```

### Arquitetura Resumida

O sistema é um **Next.js 16 SaaS com Supabase backend e Gemini IA**.

- **Frontend**: React Server Components (pages) + Client Components (forms, state)
- **Estado**: Zustand stores (auth, devotional flow, UI)
- **Backend**: Next.js API Routes orquestrando Supabase e Gemini
- **IA**: Gemini 2.5 Flash para análise emocional + geração devotional (2-3s latência)
- **Database**: Supabase PostgreSQL (profiles, devotionals, journal_entries, journeys, user_journeys)
- **Pagamento**: Stripe para checkout e webhooks
- **Auth**: Supabase Auth com email/password e Google OAuth

**Fluxo**: Usuário seleciona emoção → API chama analyzeEmotion (Gemini) → generateDevotional (Gemini) → salva em Supabase → frontend exibe em UI contemplatival.

### Dependências Importantes

| Lib | Versão | Uso | Crítica |
|-----|--------|-----|---------|
| Next.js | 16.2.6 | Framework web | ✓ Sim |
| React | 19.2.4 | UI library | ✓ Sim |
| TypeScript | 5.x | Type safety | ✓ Sim |
| Supabase | 2.105.4 | Backend BaaS | ✓ Sim |
| Google Gen AI | 0.24.1 | Emotion analysis + content generation | ✓ Sim |
| Zustand | 5.0.13 | State management | ✗ Pode substituir por Context se necessário |
| Stripe | 22.1.1 | Pagamentos | ✓ Para monetização |
| Framer Motion | 12.38.0 | Animações | ✗ Cosmético, mas importante UX |
| TailwindCSS | 4.x | Styling | ✗ Pode remover mas reescrever CSS |
| React Hook Form | 7.76.0 | Forms | ✗ Pode remover, usar form nativa |

**Não use**:
- `openai` SDK - instalado mas não integrado. Use `@google/generative-ai` para tudo IA.

### Restrições

**NÃO PODE**:
- Alterar o limite de 1 devocional gratuito sem renegociar modelo de negócio
- Remover autenticação de endpoints críticos
- Armazenar credentials (API keys, tokens) no código ou .env.local commitado
- Usar MASTER_MODE em produção
- Modificar estrutura do Devotional (omitir campos)
- Gerar devocionais sem análise emocional prévia

**DEVE**:
- Sempre verificar subscription_tier antes de features premium
- Sempre validar emotion_raw (min 2 chars)
- Sempre usar Zustand stores para estado crítico
- Sempre logar erros em APIs sensíveis
- Sempre testar free vs premium flow antes de merge

### Boas Práticas Identificadas

1. **Tipos TypeScript Fortes**: Projeto usa interfaces bem definidas em `/src/types/index.ts`. Manter este padrão.

2. **Separação de Responsabilidades**: API routes são finas, orquestração delegada para `/lib/*`. Manter assim.

3. **Zustand para Estado**: Escolha minimalista e correcta. Continuar usando.

4. **Supabase SSR Middleware**: Sessão é sincronizada corretamente via middleware. Manter.

5. **Design System Coeso**: Variáveis CSS centralizadas, componentes Radix UI, Framer Motion consistente. Manter.

6. **Validação em Camadas**: Input validation em cliente (Zod) e servidor (min length). Manter.

7. **Fallback para API Errors**: Endpoints tratam gracefully Gemini quota, model indisponível, etc. Manter padrão.

8. **Environment-Aware**: Código respeita NEXT_PUBLIC_APP_URL, MASTER_MODE, etc. Bom para multi-env.

9. **Mobile-First**: TailwindCSS com mobile-first, PWA icons. Manter responsividade.

10. **Prompts de IA Sofisticados**: System prompts em `/lib/gemini/devotional-ai.ts` são pastorais, específicos, com regras claras. Manter qualidade alta.

---

**Document Version**: 1.0
**Generated by**: project-analyst skill
**Next Review Date**: Após implementação de testes e completar journeys (recomendado em 2 sprints)
