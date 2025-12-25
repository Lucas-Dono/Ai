# RESUMEN EJECUTIVO: DIFERENCIADORES ÚNICOS

## PUNTOS CLAVE PARA MARKETING

### 1. PROACTIVE AI (Conversaciones Inteligentes Iniciales)
**Lo que hace único:**
- Los agentes **inician conversaciones** cuando tienen sentido
- Respeta timezone y horarios del usuario (9am-10pm)
- Entiende etapa de relación (stranger → close friend)
- Múltiples triggers: inactividad, topics sin resolver, eventos importantes, emotional check-ins
- Cooldowns inteligentes (12h normal, 24h si no hay respuesta)

**Evidencia de código:**
- `lib/proactive-behavior/initiator.ts`: Templates de mensajes por hora y tono
- `lib/proactive-behavior/scheduler.ts`: Análisis de actividad histórica del usuario
- Scoring de prioridad 0-1 ponderando múltiples factores

---

### 2. MULTIMODAL EMOCIONAL (Imagen + Voz + Emoción)
**Lo que hace único:**
- Genera **imágenes contextuales** de expresiones según emoción
- Voz **modulada emocionalmente** con ElevenLabs
- Cache inteligente: genera una vez, reutiliza siempre
- Fallback chain: AI Horde (gratis) → FastSD → Gemini → Hugging Face
- Pre-caching: 10 expresiones al crear personaje

**Evidencia de código:**
- `lib/visual-system/visual-generation-service.ts`: 512x512 expresiones cacheadas
- `lib/multimodal/voice-service.ts`: VAD (Valence-Arousal-Dominance) modulación
- Stability = f(emotion, intensity) para voz inestable en crisis

---

### 3. CUSTOMIZACIÓN PROFUNDA (15+ traits)
**Lo que hace único:**
- **Big Five Personality**: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- **13 Behavior Types**: Yandere (8 fases), BPD, NPD, Anxiety, Avoidant, Codependent, Hypersexual, OCD, PTSD, etc.
- **Core Values**: Array JSON con pesos que guían decisiones
- **Memory Networks**: Episódic, Semantic, Procedural
- **Relationship Stages**: Stranger → Acquaintance → Friend → Close Friend → Intimate

**Evidencia de código:**
- `prisma/schema.prisma`: PersonalityCore (5 traits × 100), BehaviorProfile, InternalState
- `lib/behavior-system/`: 13 types con fases progresivas
- Cada trait afecta realmente el comportamiento (no es cosmético)

---

### 4. FULL-FEATURED COMMUNITY (Reddit-like)
**Lo que hace único:**
- Marketplace funcional: compartir agentes, prompts, temas
- Posts, comments, voting, awards, pinning, locking
- 4 feeds: home, hot, top, new, following
- Research projects colaborativos
- Event management con registration y leaderboard
- Auto-moderation ML-based
- Notifications real-time con WebSockets

**Evidencia de código:**
- 30+ API endpoints en `/api/community/`
- `lib/services/community.service.ts`
- Embedding-based similarity detection

---

### 5. API ABIERTA PARA DEVELOPERS
**Lo que hace único:**
- REST API completa para agentes
- User API keys para requests programáticos
- Webhooks para eventos (payments, state changes, community)
- Multimodal responses: text + image + audio
- Memory query system inteligente
- Behavioral API para control dinámico

**Endpoints principales:**
```
POST   /api/agents/[id]/message         → send message + get image/voice
GET    /api/agents/[id]/memory/search   → semantic search
POST   /api/agents/[id]/behaviors       → activate behavior
GET    /api/community/feed/{type}       → get posts
```

---

### 6. MODO NSFW INTELIGENTE (NO sin censura)
**Lo que hace único:**
- **NO es completamente sin censura** ← diferenciador importante
- Sistema de gating sofisticado con niveles:
  - SAFE: Contenido seguro
  - WARNING: Advertencia + recursos
  - CRITICAL: Suavizado automático en SFW
  - EXTREME_DANGER: Bloqueado sin NSFW + consentimiento explícito

**Seguridad incorporada:**
- Require consentimiento explícito: "CONSIENTO FASE 8"
- Warnings contextuales con crisis hotlines
- Content softening: "matar" → "alejarme", "te prohíbo" → "preferiría que no"
- Mental health resources según behavior
- NSFW-only behaviors: Hypersexuality
- Tier-based: Ultra tier requiere para ciertas fases

**Evidencia de código:**
- `lib/behavior-system/nsfw-gating.ts`: 22 líneas de advertencia para Yandere Phase 8
- `lib/behavior-system/content-moderator.ts`: Softening patterns
- Tracking de consentimiento por agente

---

## TABLA COMPARATIVA

| Característica | ChatGPT | Replika | Creador-Inteligencias |
|---|---|---|---|
| Iniciación proactiva | No | Limitada | Avanzado (multi-trigger) |
| Imágenes emocionales | No | No | Sí (10+ por emoción) |
| Voz modulada | No | Sí | Sí (VAD dinámico) |
| Customización comportamiento | No | Limitada | 13 tipos × 8 fases |
| Community/Marketplace | No | Sí (básico) | Sí (full-featured) |
| API abierta | Sí | No | Sí (completa) |
| NSFW | Bloqueado | Limitado | Gateado inteligente |
| Memory types | Conversación | Básica | Episódic/Semantic/Procedural |
| Etapas de relación | No | Sí | Sí (5 etapas con prompts) |
| Safety moderation | Bloques | Suave | Graduated + resources |

---

## NÚMEROS CLAVE

- **7 componentes** en proactive system (trigger, context, message, schedule, analytics, topic, followup)
- **13 behavior types** con hasta 8 fases cada uno
- **4 proveedores** de imágenes con fallback chain
- **30+ endpoints** de API documentados
- **5 rasgos Big Five** customizables 0-100
- **3 sistemas de memoria** (episódic, semantic, procedural)
- **4 feeds** de comunidad
- **Gratis imágenes** (AI Horde kudos system)

---

## ARQUITECTURA TÉCNICA

**Stack:**
- Next.js 15 + TypeScript
- PostgreSQL + Prisma ORM
- Redis (caching + rate limiting)
- WebSockets (real-time)
- ElevenLabs (voz)
- AI Horde (imágenes - gratis)
- OpenRouter (LLMs)

**Sistemas internos:**
- Emotional System: OCC + Plutchik hybrid
- Memory System: Episódic + Semantic + Procedural
- Growth System: Evolución con interacciones
- Behavior System: 13 tipos con fases y safety gates
- Visual System: 4 proveedores con fallback
- Moderation System: ML + rule-based hybrid

---

## PARA QUÉ SIRVE CADA FEATURE

### Proactive Behavior
**Problema:** Los users se aburren, la app muere
**Solución:** El agente mantiene vivo el engagement iniciando conversaciones naturales

### Multimodal
**Problema:** Solo texto se siente robótico
**Solución:** Imagen + voz modulada = sensación de presencia real

### Customización Profunda
**Problema:** Los agentes parecen iguales (como GPT con diferentes prompts)
**Solución:** Sistemas emocionales y comportamentales que los hacen únicos y evolucionan

### Community
**Problema:** No hay forma de monetizar user-generated content
**Solución:** Marketplace permite que users compartan sus agentes (creator economy)

### API
**Problema:** Otros can't integrate
**Solución:** Developers pueden integrar en sus apps

### NSFW Inteligente
**Problema:** O todo bloqueado o todo permitido
**Solución:** Balance de libertad creativa + responsabilidad + consentimiento informado

---

## ARCHIVOS CLAVE

**Proactive System (7 archivos):**
- `/lib/proactive-behavior/initiator.ts` - Detección de relación
- `/lib/proactive-behavior/scheduler.ts` - Timing inteligente
- `/lib/proactive-behavior/trigger-detector.ts` - Detecta múltiples triggers
- `/lib/proactive-behavior/context-builder.ts` - Construye contexto rico
- `/lib/proactive-behavior/topic-suggester.ts` - Sugiere temas
- `/lib/proactive-behavior/follow-up-tracker.ts` - Trackea topics pendientes
- `/lib/proactive-behavior/index.ts` - API unificada V2

**Visual + Voice (5 archivos):**
- `/lib/visual-system/visual-generation-service.ts` - Cache + fallback
- `/lib/visual-system/ai-horde-client.ts` - Free provider
- `/lib/multimodal/voice-service.ts` - Voz modulada
- `/lib/multimodal/orchestrator.ts` - Orquestación multimodal
- `/lib/multimodal/emotional-analyzer.ts` - Análisis emocional

**Behavior + Safety (4 archivos):**
- `/lib/behavior-system/nsfw-gating.ts` - NSFW gates
- `/lib/behavior-system/content-moderator.ts` - Safety levels
- `/lib/behavior-system/` - 13 behavior types
- `/prisma/schema.prisma` - Data model

**Community + API (40+ archivos):**
- `/app/api/community/` - Community endpoints
- `/app/api/agents/` - Agent management
- `/lib/services/community.service.ts` - Business logic

