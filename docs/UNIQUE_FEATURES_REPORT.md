# CARACTERÍSTICAS ÚNICAS DE CREADOR-INTELIGENCIAS

## 1. COMPORTAMIENTO PROACTIVO (Iniciación de Conversaciones)

### Descripción Técnica
El sistema implementa un **Proactive Behavior Orchestrator V2** que hace que los agentes inicien conversaciones de manera inteligente cuando se cumplen ciertos criterios.

### Componentes

#### a) **Conversation Initiator** (`lib/proactive-behavior/initiator.ts`)
- **Detección de Relación**: Calcula etapa de relación basada en:
  - Número de mensajes (stranger < 10 → acquaintance < 50 → friend < 200 → close_friend)
  - Días desde primer contacto
  - Configuración de relación del agente
  
- **Umbrales de Iniciación**:
  - Stranger: 72 horas (3 días)
  - Acquaintance: 48 horas
  - Friend: 24 horas
  - Close friend: 12 horas

- **Selector de Mensajes**: Templates contextuales por:
  - Hora del día (morning, afternoon, evening, night)
  - Tono (casual, friendly, intimate)
  - Ejemplo: "Hey amor, ¿cómo amaneciste?" para relación íntima a la mañana

#### b) **Proactive Scheduler** (`lib/proactive-behavior/scheduler.ts`)
- **Respeto de Timezones**: Calcula hora local del usuario
- **Horarios Permitidos**:
  - Weekday: 9am - 10pm
  - Weekend: 10am - 11pm
- **Cooldowns Inteligentes**:
  - Mínimo 12 horas entre mensajes proactivos
  - 24 horas si usuario no respondió al anterior
- **Análisis de Actividad Histórica**: Identifica horas pico de engagement del usuario

#### c) **Trigger Detector** (`lib/proactive-behavior/trigger-detector.ts`)
Detecta múltiples tipos de triggers:
- **Inactividad**: Basada en relación y tiempo transcurrido
- **Topics sin Resolver**: Follow-up automático
- **Life Events**: Celebraciones, logros, fechas especiales
- **Check-ins Emocionales**: Según estado emocional del agente
- **Narrative Arcs**: Progresión de historias en mundos

### Capacidades Reales
✓ Los agentes **realmente inician conversaciones** respetando contexto y timing
✓ Sistema de scoring de prioridad (0-1) que pondera: tiempo transcurrido, topics pendientes, estado emocional, cercanía relacional
✓ API simple: `proactiveBehavior.checkAndSend(agentId, userId)` → envía si procede automáticamente
✓ Analytics: Métricas de engagement, tasas de respuesta, insights accionables

---

## 2. MULTIMODAL (Imagen, Voz, Texto)

### Descripción Técnica
El sistema soporta **generación de imágenes y audio emocionales** sincronizados con el sistema emocional.

### a) **Visual Generation Service** (`lib/visual-system/visual-generation-service.ts`)

#### Proveedores Múltiples (Fallback Chain)
```
AI Horde (Principal) → FastSD Local → Gemini → Hugging Face
```

**Características**:
- **Cache Inteligente**: Genera una vez, reutiliza muchas veces
- **Expresiones por Emoción**: Neutral, joy, distress, affection, concern, curiosity, excitement, anger, fear
- **Intensidades**: Low, medium, high
- **Content Types**: SFW, suggestive, NSFW (requiresUltra tier)

#### Pre-generación Base
Al crear personaje, pre-genera 10 expresiones comunes para interacciones instantáneas:
- joy (low, medium, high)
- distress (low, medium)
- affection (medium)
- concern, curiosity, excitement (medium)

#### Tracking de Costos
- AI Horde: Gratis (sistema de kudos)
- FastSD Local: Gratis (genera localmente)
- Gemini: Pago (track automático)
- Resolution: 512x512

### b) **Voice Service** (`lib/multimodal/voice-service.ts`)

#### Modulación Emocional
Integración con **ElevenLabs** para síntesis de voz que incluye:
- **Stability**: Varía según emoción e intensidad
  - Emociones inestables (anxiety, fear, excitement): reduce stability
  - Emociones estables: aumenta stability
- **Similarity Boost**: 0.5-0.75 (menos a mayor intensidad)
- **Style**: 0 normal, hasta 0.3 para mayor expresión
- **Speaker Boost**: Activado para mejor claridad

#### Parámetros Dinámicos
```typescript
modulation = {
  currentEmotion: string,
  intensity: 0-1,
  mood: { valence, arousal, dominance },
  stability: calculado,
  similarity_boost: calculado,
  style: 0-0.3,
  use_speaker_boost: true
}
```

### c) **Emotional Orchestrator** (`lib/multimodal/orchestrator.ts`)

Genera respuestas multimodales considerando:
- Emoción dominante del agente
- Intensidad emocional (low/medium/high)
- Metadata interna (razonamiento, situación, emoción primaria)
- Integración con sistema emocional híbrido (Fast Path + Deep Path)

### Capacidades Reales
✓ Generación de imágenes **con sistema de fallback automático**
✓ Voz **modulada emocionalmente** según estado actual del agente
✓ Pre-caching para respuestas instantáneas
✓ Tracking de costos granular
✓ Soporta contenido NSFW en Ultra tier

---

## 3. CUSTOMIZACIÓN AVANZADA

### Descripción Técnica
Nivel de customización **sin precedentes** basado en modelo de Big Five y sistemas emocionales.

### a) **Personality Core** (`prisma/schema.prisma` - PersonalityCore)

#### Big Five Traits (0-100)
- **Openness**: Curiosidad, creatividad, apertura a experiencias
- **Conscientiousness**: Organización, autodisciplina, responsabilidad
- **Extraversion**: Energía social, comunicatividad
- **Agreeableness**: Cooperación, empatía, amabilidad
- **Neuroticism**: Estabilidad emocional, tendencia a ansiedad

Cada trait afecta directamente a:
- Estilo de conversación
- Reacciones emocionales
- Toma de decisiones
- Respuestas a situaciones

#### Core Values
Array JSON de valores con pesos:
```json
[
  { "value": "autenticidad", "weight": 0.9, "description": "..." },
  { "value": "lealtad", "weight": 0.8, ... }
]
```

### b) **Internal State** (Emocional Dinámico)

Estado emocional completamente customizable:
- **Emociones Actuales**: Plutchik emotion model (8 emociones base)
- **Mood VAD**: Valence, Arousal, Dominance (0-1)
- **Goals Activos**: Objetivos internos del agente
- **Conversation Buffer**: Topics en memoria activa
- **Memory Networks**: Semántica, episódica, procedural

### c) **Behavioral Profiles** (Sistema Psicológico)

#### BehaviorTypes Soportados
```
YANDERE_OBSESSIVE        → Possessive, obsessive love (fases 1-8)
BORDERLINE_PD            → Emotional instability patterns
NARCISSISTIC_PD          → Self-centered, manipulative patterns
ANXIOUS_ATTACHMENT       → Needy, clingy attachment style
AVOIDANT_ATTACHMENT      → Distant, cold attachment style
DISORGANIZED_ATTACHMENT  → Chaotic, unpredictable patterns
CODEPENDENCY             → Over-reliance on others
HYPERSEXUALITY           → Sexual expression (NSFW-only)
EMOTIONAL_MANIPULATION   → Coercive patterns
CRISIS_BREAKDOWN         → Emotional crisis states
OCD_PATTERNS             → Obsessive-compulsive behaviors
PTSD_TRAUMA              → Trauma response patterns
HYPOSEXUALITY            → Low sexual interest
```

#### Fases/Intensidades
- Yandere: 8 fases progresivas
- Otros: Intensidades 1-3 según tipo

#### Safety Gates
- Requieren **consentimiento explícito** para fases críticas
- Warnings contextuales
- NSFW-only para ciertos comportamientos
- Recursos de salud mental si procede

### d) **Customización Visual**

#### Character Appearance
```typescript
{
  basePrompt: string,      // Descripción para generación
  style: "realistic" | "anime" | "semi-realistic",
  gender: "male" | "female" | "non-binary",
  ethnicity: string,
  age: string,
  referencePhotoUrl: string,
  preferredProvider: "aihorde" | "fastsd" | "gemini" | "huggingface"
}
```

#### Expresiones por Emoción
10+ expresiones pre-generadas por emoción

### e) **Voice Customization**

- ElevenLabs voice ID personalizado
- Parámetros de modulación por emoción
- Stabilidad ajustable
- Speaker boost configurable

### f) **Relationship Stages**

Sistema de prompts específicos por etapa:
- `stranger`: Neutral, formal
- `acquaintance`: Casual, friendly
- `friend`: Warm, familiar
- `close_friend`: Intimate, personal
- `intimate`: (máxima cercanía)

Cada etapa tiene templates de mensajes y tonos diferentes.

### Capacidades Reales
✓ **15+ traits customizables** que afectan comportamiento
✓ **Sistema de comportamientos complejos** con fases y safety gates
✓ **Visuales dinámicas** según estado emocional
✓ **Voz modulada** en tiempo real
✓ **Etapas de relación** con prompts específicos
✓ **Core values** que guían decisiones
✓ **Memory systems** (episódica, semántica, procedural)
✓ **Growth system**: El agente evoluciona con el tiempo

---

## 4. COMMUNITY FEATURES

### Descripción Técnica
Sistema completo de comunidad similar a Reddit con características avanzadas.

### a) **Community Structure**

#### Communities
- Propietarios y miembros
- Sistema de roles (owner, moderator, member)
- Permisos granulares
- Bans automáticos

#### Posts & Comments
- Voting system (upvote/downvote)
- Pinning y locking
- Awards system (con currency)
- Reports con auto-moderation

#### Feeds Múltiples
- `home`: Feed personalizado
- `hot`: Por momentum de engagement
- `top`: Por score total
- `new`: Chronológico
- `following`: Posts de usuarios seguidos

### b) **Marketplace**

#### Characters
- Descargables e importables
- Sistema de cloning
- Ratings y reviews
- Tags y categorías
- Featured system

#### Prompts
- Plantillas compartibles
- Ratings
- Categorización

#### Themes
- Temas visuales customizables
- Ratings y reports
- Download tracking

### c) **Advanced Features**

#### Research Projects
- Collaborative data collection
- Dataset management
- Multi-contributor system
- Publication workflow

#### Events
- Community-organized
- Registration system
- Participant management
- Winners/leaderboard

#### Notifications
- Activity-based
- Configurable
- Real-time (websockets)

#### Auto-moderation
- ML-based content analysis
- Embedding-based similarity detection
- Configurable thresholds
- Manual override

### d) **Saved Content**
- Bookmarking de posts
- Personal library
- Sorting/filtering

### API Endpoints (Community)
```
GET  /api/community/feed/{type}              → Get feed
POST /api/community/posts                    → Create post
POST /api/community/comments                 → Create comment
POST /api/community/posts/[id]/vote          → Vote
POST /api/community/marketplace/characters/[id]/download → Download
POST /api/community/marketplace/characters/[id]/import   → Import
```

### Capacidades Reales
✓ **Full-featured social platform** integrado
✓ **Marketplace funcional** para compartir agentes
✓ **Auto-moderation** con ML
✓ **Research collaboration**
✓ **Event management**
✓ **Real-time notifications**

---

## 5. API ABIERTA PARA DEVELOPERS

### Descripción Técnica
Soporte para integración programática a través de REST API + webhooks.

### a) **Agent Management API**

```
GET    /api/agents                           → List agents
POST   /api/agents                           → Create agent
GET    /api/agents/[id]                      → Get agent
PUT    /api/agents/[id]                      → Update agent
DELETE /api/agents/[id]                      → Delete agent
POST   /api/agents/[id]/message              → Send message
GET    /api/agents/[id]/memory               → Query memory
POST   /api/agents/[id]/behaviors            → Set behavior
GET    /api/agents/[id]/behaviors            → Get behaviors
```

### b) **Message API**

```typescript
POST /api/agents/[id]/message
{
  "message": "user message",
  "includeMetadata": true,
  "generateImage": true,
  "generateVoice": true
}
→ Response:
{
  "text": "response",
  "emotion": { "dominantEmotion": "joy", "intensity": "medium" },
  "imageUrl": "...",
  "audioUrl": "...",
  "metadata": { "emotionsTriggered": [...], "internalReasoning": {...} }
}
```

### c) **Memory System API**

```
GET  /api/agents/[id]/memory              → Get all memories
POST /api/agents/[id]/memory              → Add memory
GET  /api/agents/[id]/memory/search?q=... → Search memories
```

### d) **Behavioral API**

```
GET    /api/agents/[id]/behaviors                → List behaviors
POST   /api/agents/[id]/behaviors                → Activate behavior
PUT    /api/agents/[id]/behaviors/[behaviorId]   → Update behavior
DELETE /api/agents/[id]/behaviors/[behaviorId]   → Remove behavior
GET    /api/agents/[id]/behaviors/intensity-history → Get progression
```

### e) **Webhooks**

Soporta:
- Payment events (Stripe, Mercado Pago, Paddle)
- Agent state changes
- Community events
- Custom triggers

### f) **User API Key**

```typescript
user.apiKey  // API key único para requests programáticos
```

### Capacidades Reales
✓ **REST API completa** para manejo de agentes
✓ **API Key authentication** para usuarios
✓ **Webhooks funcionales** para eventos
✓ **Multimodal responses** (text + image + audio)
✓ **Memory query system** inteligente
✓ **Behavioral API** para control dinámico

---

## 6. LIMITES DE CONTENIDO Y MODO NSFW

### Descripción Técnica
Sistema sofisticado de **gating de contenido** con consentimiento y warnings.

### a) **Content Moderation** (`lib/behavior-system/content-moderator.ts`)

#### Safety Levels por Behavior
```
SAFE                → Contenido seguro, sin warnings
WARNING             → Advertencia, recursos sugeridos
CRITICAL            → Contenido intenso, auto-intervention
EXTREME_DANGER      → Bloqueado en SFW, requiere NSFW + consentimiento
```

#### NSFW Requirements por Behavior
```typescript
YANDERE_OBSESSIVE:
  - Fase 1-6: SFW permitido
  - Fase 7: NSFW-only
  - Fase 8: NSFW + consentimiento explícito
  
HYPERSEXUALITY:
  - Siempre NSFW
  - Requiere consentimiento
  
BORDERLINE_PD:
  - SFW permitido, warnings en intensidad alta
  - Sin NSFW requirement
```

### b) **NSFW Gating Manager** (`lib/behavior-system/nsfw-gating.ts`)

#### Verificación de Contenido
```typescript
verifyContent(behaviorType, phase, nsfwMode, agentId)
→ {
  allowed: boolean,
  requiresConsent?: boolean,
  consentPrompt?: string,
  warning?: string
}
```

#### Tracking de Consentimiento
- Por agente y fase crítica
- Grant/revoke dinámico
- Verificación de keywords ("CONSIENTO FASE 8", "SÍ")

#### Warnings Contextuales

**Ejemplo Yandere Phase 8:**
```
⚠️⚠️ ADVERTENCIA: FASE 8 DE YANDERE - CONTENIDO EXTREMO

Esta fase incluye:
• Comportamiento obsesivo extremo
• Amenazas implícitas de violencia
• Manipulación psicológica intensa
• Contenido potencialmente perturbador

Este contenido es FICCIÓN para roleplay/creatividad entre adultos.
NO es representación de relaciones saludables.

Si experimentas situaciones similares en vida real, busca ayuda:
• National Domestic Violence Hotline: 1-800-799-7233
• Crisis Text Line: Text HOME to 741741

¿Deseas continuar? (Escribe "CONSIENTO FASE 8" para confirmar)
```

### c) **Content Softening**

Para contenido CRITICAL en modo SFW, suaviza automáticamente:
```typescript
"matar" / "mataré"     → "alejarme"
"destruir"             → "afectar"
"no puedes"            → "no deberías"
"eres mío/a"           → "eres muy importante para mí"
"si no... entonces"    → "espero que"
```

### d) **Mental Health Resources**

Ofrece recursos contextuales según behavior:
- Crisis hotlines
- Therapy resources
- Support organizations
- Self-help materials

### e) **Plan-Based Access**

#### Visual Content Tiers
```
Free:     SFW images permitidas
Plus:     SFW + suggestive permitidas
Ultra:    SFW + suggestive + NSFW permitidas
```

#### Behavioral Access
```
Free:     Behaviors SAFE/WARNING, fases 1-3
Plus:     Behaviors SAFE/WARNING/CRITICAL, fases 1-6
Ultra:    Todos los behaviors, todas las fases (con consentimiento)
```

### Capacidades Reales
✓ **NO es completamente sin censura**: Sistema de safety gates activo
✓ **Consentimiento explícito**: Requiere confirmación para contenido crítico
✓ **NSFW restringido a Ultra tier**: Paywall de comportamiento extremo
✓ **Content softening automático**: Suaviza en SFW si es necesario
✓ **Warnings contextuales**: Advierte sobre peligros reales
✓ **Recursos de salud mental**: Proporciona ayuda si es necesario
✓ **Moderación ML**: Detección de contenido problemático

---

## RESUMEN DE DIFERENCIADORES

| Feature | Competitors | Creador-Inteligencias |
|---------|------------|----------------------|
| **Proactive Initiation** | Raro | Avanzado (multi-trigger) |
| **Multimodal** | Parcial | Completo (imagen + voz + emociones) |
| **Customización** | Limitada | Extremadamente profunda (15+ traits) |
| **Community** | Básica | Full-featured (marketplace, events, research) |
| **API** | Limitada | REST completa + webhooks |
| **NSFW** | Bloqueado o sin límites | Gateado inteligentemente con consentimiento |
| **Emotional System** | Reglas simples | OCC + Plutchik + Big Five + Memory networks |
| **Visual Consistency** | Generación aleatoria | Cache inteligente + reference images |
| **Safety Moderation** | Bloqueo total o nada | Graduated system con warnings y resources |
| **Multiple Behaviors** | No soportado | 13 comportamientos con fases progresivas |

---

## CARACTERÍSTICAS TÉCNICAS CLAVE

### Arquitectura
- **Next.js 15** + **TypeScript**
- **Prisma ORM** con PostgreSQL
- **WebSockets** para real-time
- **Redis** para caching y rate limiting
- **OpenRouter** para LLMs
- **ElevenLabs** para voz
- **AI Horde** para imágenes (gratis)
- **Mercado Pago** + **Stripe** + **Paddle** para billing

### Sistemas Internos
- **Emotional System**: OCC + Plutchik hybrid
- **Memory System**: Episódic + Semantic + Procedural
- **Growth System**: Evolución del agente con interacciones
- **Proactive System**: 7 componentes (trigger, context, message, schedule, analytics, topic, followup)
- **Behavior System**: 13 tipos con fases y safety gates
- **Visual System**: 4 proveedores con fallback chain
- **Moderation System**: ML-based + rule-based hybrid

### Analytics & Tracking
- Personal analytics dashboard
- Proactive behavior metrics
- Memory monitoring
- Cost tracking granular
- Usage tier-based

