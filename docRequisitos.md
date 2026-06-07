# DOCUMENTO DE REQUISITOS
# SaaS “O Que Você Está Sentindo Hoje?”

Versão: 1.0
Status: MVP
Modelo: SaaS Web App
Arquitetura: Clean Architecture + Feature-Based
Plataforma: Web App/PWA
Stack: Next.js + Supabase + OpenAI

---

# 1. VISÃO GERAL

## 1.1 Nome do Produto

# O Que Você Está Sentindo Hoje?

---

## 1.2 Descrição do Produto

“O Que Você Está Sentindo Hoje?” é um SaaS espiritual baseado em Inteligência Artificial que gera devocionais personalizados de acordo com o estado emocional do usuário.

O sistema foi concebido para unir:
- acolhimento emocional;
- profundidade bíblica;
- experiência contemplativa;
- tecnologia premium;
- IA personalizada.

O objetivo NÃO é entregar conteúdo estático.

O objetivo é entregar:
# uma experiência espiritual emocionalmente personalizada.

---

# 2. OBJETIVO DO PRODUTO

Criar um sistema capaz de:
- interpretar emoções;
- gerar devocionais contextualizados;
- promover conexão espiritual;
- criar hábito diário;
- gerar retenção emocional;
- monetizar via assinatura premium.

---

# 3. PROBLEMA QUE O PRODUTO RESOLVE

Muitas pessoas:
- sentem ansiedade;
- possuem dificuldade de constância espiritual;
- estão emocionalmente cansadas;
- precisam ouvir algo de Deus;
- não sabem por onde começar.

O produto resolve isso oferecendo:
# direcionamento espiritual instantâneo baseado no estado emocional.

---

# 4. POSICIONAMENTO

O produto deve parecer:
- premium;
- moderno;
- contemplativo;
- acolhedor;
- espiritualmente profundo;
- emocionalmente inteligente.

O produto NÃO deve parecer:
- app gospel antigo;
- blog religioso;
- rede social;
- gerador genérico de IA;
- aplicativo motivacional superficial.

---

# 5. PÚBLICO-ALVO

## 5.1 Público Primário

- cristãos modernos;
- jovens adultos;
- pessoas emocionalmente sobrecarregadas;
- usuários digitais;
- pessoas que valorizam espiritualidade e tecnologia.

---

## 5.2 Público Secundário

- usuários de apps meditativos;
- pessoas buscando conforto emocional;
- usuários interessados em reflexão diária.

---

# 6. MODELO DE NEGÓCIO

## SaaS por assinatura.

---

# 7. PLANO GRATUITO (FREE TIER)

## 7.1 Estratégia do Free Tier

O plano gratuito NÃO existe para sustentar uso contínuo.

Ele existe para:
- gerar impacto emocional;
- demonstrar valor;
- criar desejo de continuidade;
- incentivar conversão premium.

O usuário deve experimentar:
# uma única experiência emocional completa.

---

## 7.2 Limite Gratuito

Cada usuário terá direito a:

# 1 (uma) geração completa gratuita vitalícia.

---

## 7.3 O que está incluso na geração gratuita

A geração gratuita inclui:
- interpretação emocional;
- devocional completo;
- oração personalizada;
- reflexão;
- declaração de fé;
- experiência premium visual.

---

## 7.4 O que acontece após o uso gratuito

Após utilizar a geração gratuita:
- novas gerações serão bloqueadas;
- o usuário verá paywall premium;
- apenas previews limitados poderão ser exibidos.

---

## 7.5 Restrições do Plano Gratuito

Usuários gratuitos NÃO poderão:
- gerar novos devocionais;
- acessar histórico completo;
- utilizar modo madrugada;
- acessar áudio;
- iniciar jornadas de 21 dias;
- utilizar diário espiritual completo.

---

## 7.6 Controle Técnico da Gratuidade

O sistema deve implementar:
- controle por conta autenticada;
- persistência de limite;
- proteção antifraude básica;
- rate limiting;
- armazenamento do uso gratuito.

---

# 8. PLANO PREMIUM

## 8.1 Preço Inicial

# R$ 24,90/mês

---

## 8.2 Recursos Premium

Usuários premium terão acesso a:
- devocionais ilimitados;
- jornadas de 21 dias;
- histórico emocional;
- diário espiritual;
- modo madrugada;
- áudio contemplativo;
- personalização avançada;
- gamificação;
- recomendações inteligentes.

---

# 9. FUNCIONALIDADE PRINCIPAL

# “O que você está sentindo hoje?”

Essa pergunta é o centro absoluto do sistema.

---

# 10. FLUXO PRINCIPAL

Landing Page
↓
Login/Cadastro
↓
Onboarding emocional
↓
Pergunta principal
↓
Seleção emocional
↓
IA interpreta emoção
↓
Geração do devocional
↓
Experiência contemplativa
↓
Salvar/refletir
↓
Oferta de jornada
↓
Retenção diária
↓
Conversão premium

---

# 11. REQUISITOS FUNCIONAIS

# RF001 — Autenticação

O sistema deve permitir:
- login;
- cadastro;
- Google OAuth;
- recuperação de senha;
- persistência de sessão.

---

# RF002 — Onboarding Emocional

O sistema deve apresentar onboarding contendo:
- objetivos espirituais;
- sentimentos recorrentes;
- tempo disponível;
- preferências espirituais.

---

# RF003 — Entrada Emocional

O usuário poderá:
- selecionar emoções;
- digitar sentimentos personalizados.

Exemplos:
- ansiedade;
- medo;
- tristeza;
- culpa;
- esperança;
- gratidão;
- vazio;
- desânimo.

---

# RF004 — Interpretação Emocional

A IA deve:
- interpretar contexto emocional;
- identificar intensidade;
- entender padrões emocionais.

---

# RF005 — Geração Devocional

A IA deve gerar:
- título;
- versículo;
- reflexão;
- oração;
- aplicação prática;
- declaração de fé;
- pergunta reflexiva.

---

# RF006 — Histórico

O sistema deve armazenar:
- emoções;
- devocionais;
- datas;
- favoritos.

---

# RF007 — Diário Espiritual

O usuário poderá:
- registrar reflexões;
- escrever orações;
- registrar aprendizados.

---

# RF008 — Jornadas de 21 Dias

As jornadas devem:
- ser opcionais;
- funcionar como continuidade espiritual;
- possuir progresso visual.

---

# RF009 — Gamificação

O sistema deve possuir:
- streak diário;
- calendário espiritual;
- progresso;
- conquistas elegantes.

---

# RF010 — Áudio

O sistema deve permitir:
- leitura do devocional;
- música ambiente;
- sons contemplativos.

---

# RF011 — Compartilhamento

O sistema deve permitir:
- compartilhamento de versículos;
- compartilhamento de cards;
- compartilhamento de reflexões.

---

# RF012 — Sistema Premium

O sistema deve possuir:
- paywall premium;
- upgrade;
- downgrade;
- cancelamento;
- cobrança recorrente.

---

# RF013 — Controle Gratuito

O sistema deve:
- limitar geração gratuita;
- bloquear novas gerações;
- exibir paywall.

---

# RF014 — Modo Madrugada

O sistema deve possuir:
- visual cinematográfico;
- ambientação escura;
- música suave;
- experiência contemplativa.

---

# RF015 — Dashboard

O dashboard deve conter:
- último devocional;
- streak;
- histórico;
- atalhos;
- progresso espiritual.

---

# 12. REQUISITOS NÃO FUNCIONAIS

# RNF001 — Arquitetura

Utilizar:
# Clean Architecture + Feature-Based Architecture

---

# RNF002 — Escalabilidade

O sistema deve suportar:
- novas features;
- múltiplos providers IA;
- mobile app;
- crescimento de usuários.

---

# RNF003 — Performance

O sistema deve:
- carregar rapidamente;
- utilizar lazy loading;
- possuir animações performáticas.

---

# RNF004 — Responsividade

O sistema deve ser:
- mobile-first;
- totalmente responsivo;
- semelhante a app nativo.

---

# RNF005 — Segurança

Implementar:
- autenticação segura;
- proteção de APIs;
- validação de entradas;
- HTTPS.

---

# RNF006 — UX Premium

A experiência deve transmitir:
- paz;
- contemplação;
- profundidade;
- acolhimento.

---

# 13. STACK TECNOLÓGICA

## Frontend
- Next.js
- TypeScript
- TailwindCSS
- Framer Motion
- shadcn/ui

---

## Backend
- Supabase
- Edge Functions

---

## IA
- OpenAI API

---

## Estado
- Zustand

---

## Forms
- React Hook Form
- Zod

---

# 14. ARQUITETURA

## 14.1 Modelo Arquitetural

# Clean Architecture

Separação em:
- Presentation Layer
- Application Layer
- Domain Layer
- Infrastructure Layer

---

## 14.2 Estrutura Baseada em Features

/features
  /auth
  /devotional
  /emotion-engine
  /journal
  /journeys
  /audio
  /subscription
  /dashboard
  /notifications

---

# 15. DESIGN PATTERNS

## Frontend
- Container/Presenter
- Compound Components
- Provider Pattern
- Composition Pattern

---

## Backend
- Repository Pattern
- Service Pattern
- Factory Pattern
- DTO Pattern
- Strategy Pattern

---

## IA
- Prompt Templates
- Emotion Interpreter
- AI Orchestrator
- Context Builder

---

# 16. DESIGN SYSTEM

## Estilo Visual

- dark premium;
- glassmorphism;
- aurora gradients;
- ambient lighting;
- cinematic motion.

---

## Referências

Inspirar-se em:
- Apple
- Linear
- Calm
- Headspace
- Raycast
- Notion
- Stripe

---

# 17. MOTION DESIGN

Utilizar:
- fade suaves;
- parallax leve;
- ambient animations;
- hover premium;
- transições cinematográficas.

Evitar:
- bounce exagerado;
- motion agressivo;
- excesso de animações.

---

# 18. ESTRUTURA DE PASTAS

/app
/components
/features
/hooks
/services
/store
/lib
/styles
/types

---

# 19. FLUXO DE IA

Emoção
↓
Classificação emocional
↓
Contextualização bíblica
↓
Construção do prompt
↓
Geração da resposta
↓
Formatação contemplativa
↓
Entrega final

---

# 20. OBJETIVOS DE NEGÓCIO

O sistema deve:
- gerar recorrência;
- gerar retenção emocional;
- aumentar LTV;
- criar percepção premium;
- converter usuários em assinantes.

---

# 21. MÉTRICAS PRINCIPAIS

## Produto
- retenção D1;
- retenção D7;
- tempo médio de sessão;
- recorrência diária.

---

## Negócio
- MRR;
- churn;
- CAC;
- LTV;
- conversão premium.

---

# 22. DIFERENCIAL COMPETITIVO

O diferencial NÃO é:
- apenas IA;
- apenas design;
- apenas devocional.

O diferencial é:
# personalização espiritual emocional em tempo real.

---

# 23. OBJETIVO FINAL

Construir um SaaS espiritual premium de nível internacional que una:
- IA emocional;
- profundidade bíblica;
- UX cinematográfica;
- contemplação;
- acolhimento emocional;
- experiência premium.