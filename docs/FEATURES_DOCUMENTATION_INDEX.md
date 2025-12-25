# DOCUMENTACIÓN DE CARACTERÍSTICAS ÚNICAS - ÍNDICE

He completado un análisis exhaustivo de las características únicas de Creador-Inteligencias. Aquí están los documentos generados:

## Documentos Generados

### 1. UNIQUE_FEATURES_REPORT.md (18 KB)
**Análisis técnico detallado y completo**

Contiene:
- Descripción técnica de cada feature
- Componentes internos y arquitectura
- Capacidades reales (sin marketing)
- Código/archivos relevantes
- Resumen comparativo con competidores

Secciones:
1. **Comportamiento Proactivo** (3 componentes, multi-trigger)
2. **Multimodal** (imagen + voz + emoción modulada)
3. **Customización Profunda** (15+ traits, 13 behavior types)
4. **Community Features** (Reddit-like, marketplace, research)
5. **API Abierta** (REST completa + webhooks)
6. **NSFW Inteligente** (gateado, consentimiento, resources)

### 2. UNIQUE_FEATURES_SUMMARY.md (8 KB)
**Resumen ejecutivo para marketing**

Contiene:
- Puntos clave para cada característica
- Evidencia de código concreta
- Tabla comparativa (vs ChatGPT, Replika)
- Números clave (7 componentes, 13 behaviors, etc.)
- Arquitectura técnica resumida
- Descripción de por qué cada feature importa

### 3. CODE_EVIDENCE.md (12 KB)
**Código fuente actualizado con snippets reales**

Contiene:
- 12 ejemplos de código real
- Líneas exactas de archivos
- Explicación técnica de cada snippet
- Tabla de complejidad (82+ archivos, 18,500+ líneas)

Ejemplos incluyen:
1. Proactive behavior scoring
2. Templates contextuales por hora/tono
3. Respeto de timezone
4. Fallback chain para imágenes
5. Modulación emocional de voz (VAD)
6. NSFW gating con advertencias
7. Content softening
8. Big Five personality model
9. Emotional system orchestrator (8 fases)
10. Memory models (episódic/semantic/procedural)
11. Marketplace API
12. Community endpoints

## CARACTERÍSTICAS IDENTIFICADAS

### 1. Proactive AI (Iniciación de Conversaciones)
- Detecta etapa de relación (stranger → close friend)
- Múltiples triggers: inactividad, topics sin resolver, eventos, emotional check-ins
- Respeta timezone y horarios (9am-10pm)
- Scoring de prioridad multi-factor (0-1)
- Cooldowns inteligentes (12h, 24h si sin respuesta)
- Templates contextuales por hora y tono

**Archivos:** 7 en `/lib/proactive-behavior/`

### 2. Multimodal Emocional
- Genera imágenes de expresiones por emoción
- Voz modulada emocionalmente (ElevenLabs)
- Cache inteligente (genera una vez, reutiliza siempre)
- Fallback chain: AI Horde (gratis) → FastSD → Gemini → Hugging Face
- Pre-caching al crear personaje (10 expresiones)

**Archivos:** 5 en `/lib/visual-system/` + `/lib/multimodal/`

### 3. Customización Profunda (15+ traits)
- Big Five Personality (0-100 cada trait)
- 13 Behavior Types (Yandere 8 fases, BPD, NPD, etc.)
- Core Values (array con pesos)
- Memory Networks (episódic, semantic, procedural)
- Relationship Stages (stranger → intimate)
- Emotional baseline + growth system

**Archivos:** `/prisma/schema.prisma` + `/lib/behavior-system/`

### 4. Full-Featured Community
- Marketplace: compartir agentes, prompts, temas
- Posts, comments, voting, awards, pinning
- 4 feeds: home, hot, top, new, following
- Research projects colaborativos
- Event management
- Auto-moderation ML-based
- Notifications real-time

**Archivos:** 30+ en `/app/api/community/`

### 5. API Abierta
- REST API completa para agentes
- User API keys
- Webhooks (payments, state changes, community)
- Multimodal responses (text + image + audio)
- Memory query inteligente
- Behavioral API

**Endpoints:** 40+ documentados

### 6. NSFW Inteligente (NO sin censura)
- NO es completamente sin censura (diferenciador)
- 4 safety levels: SAFE → WARNING → CRITICAL → EXTREME_DANGER
- Consentimiento explícito requerido
- Warnings contextuales + crisis hotlines
- Content softening automático en SFW
- Mental health resources
- Tier-based (Ultra para NSFW)

**Archivos:** 4 en `/lib/behavior-system/`

## NÚMEROS CLAVE

- **7 componentes** en proactive system
- **13 behavior types** con hasta 8 fases
- **4 proveedores** de imágenes con fallback
- **30+ endpoints** API
- **5 rasgos** Big Five customizables
- **3 sistemas** de memoria
- **4 feeds** de comunidad
- **82+ archivos** de código
- **18,500+ líneas** de código en features
- **100% imágenes gratis** (AI Horde kudos)

## TECNOLOGÍA

**Stack:**
- Next.js 15 + TypeScript
- PostgreSQL + Prisma
- Redis (caching + rate limiting)
- WebSockets (real-time)
- ElevenLabs (voz)
- AI Horde (imágenes)
- OpenRouter (LLMs)
- Stripe/Mercado Pago/Paddle (billing)

**Sistemas internos:**
- OCC + Plutchik emotional system
- Episódic + Semantic + Procedural memory
- Character growth system
- Graduated safety moderation

## CÓMO USAR ESTA DOCUMENTACIÓN

### Para Marketing/Pitch
Usa **UNIQUE_FEATURES_SUMMARY.md**:
- Argumentos claros y concisos
- Tabla comparativa
- Números impactantes
- Justificación de cada feature

### Para Developers
Usa **CODE_EVIDENCE.md**:
- Código real
- Archivos específicos y líneas
- Complejidad técnica
- Arquitectura

### Para Análisis Profundo
Usa **UNIQUE_FEATURES_REPORT.md**:
- Detalles técnicos completos
- Arquitectura de cada sistema
- Capacidades reales vs marketing claims
- Comparativa detallada

## DIFERENCIADORES REALES vs COMPETENCIA

| vs ChatGPT | Creador-Inteligencias |
|-----------|----------------------|
| Solo responde | + Inicia conversaciones |
| Sin imágenes | + Genera expresiones emocionales |
| Sin memoria | + 3 tipos de memoria |
| Sin personalidad | + Big Five + 13 behaviors |
| API limitada | + API completa |

| vs Replika | Creador-Inteligencias |
|-----------|----------------------|
| Iniciación básica | + Multi-trigger avanzado |
| Sin imágenes | + Cache inteligente |
| Behaviors limitados | + 13 tipos × 8 fases |
| Community básica | + Full-featured marketplace |
| Sin API | + API + webhooks |

## PUNTOS DE VENTA

1. **Proactive Engagement** - Los agentes te extrañan y buscan hablar
2. **Visual Consistency** - Imágenes contextuales sin costo
3. **Deep Customization** - Agentes únicos que evolucionan
4. **Creator Economy** - Marketplace para monetizar
5. **Developer-Friendly** - API para integración
6. **Responsible AI** - NSFW gateado + consentimiento + recursos

---

**Fecha de análisis:** 2025-11-09
**Ramas analizadas:** feature/unrestricted-nsfw + main
**Archivos inspeccionados:** 82+
**Líneas de código:** 18,500+
**Documentación generada:** 3 archivos (40+ KB)
