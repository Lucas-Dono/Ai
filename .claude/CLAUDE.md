# Blaniel - Creador de Inteligencias

## Visión General del Proyecto

**Blaniel** es una plataforma de inteligencias artificiales conversacionales con relaciones emocionales profundas. Permite a los usuarios crear y relacionarse con personajes IA que tienen:
- Personalidades complejas basadas en psicología real (Big Five, OCC, Plutchik)
- Memoria episódica, semántica y procedimental
- Comportamientos psicológicos especializados (Yandere, BPD, NPD, attachment styles)
- Capacidades multimedia (voz emocional, generación de imágenes)
- Progresión de relaciones con sistema de "bonds" (vínculos simbólicos)

**Stack Tecnológico:**
- Frontend: React 19 + Next.js 16 + TypeScript + Tailwind CSS 4
- Backend: Next.js API Routes + Prisma ORM + PostgreSQL
- Cache/Queue: Redis (Upstash) + BullMQ
- AI: Google Gemini (evaluaciones), Venice (respuestas sin censura)
- Multimedia: ElevenLabs (TTS), AI Horde/FastSD (imágenes)
- Pagos: Paddle (primario), MercadoPago, Stripe

---

## REGLAS FUNDAMENTALES DE TRABAJO

### 🔴 Control de Versiones
**OBLIGATORIO:** Hacer commit después de cada cambio aprobado por el usuario.
- Commits con mensajes descriptivos y bien estructurados
- Facilita rollback y seguimiento de cambios
- No dar alusión en ninguna parte del texto a Claude para evitar prejuicios por el uso de IA
- Nunca acumular múltiples cambios sin commitear

### 🚫 Prohibición de IA Generativa Externa
**NUNCA usar APIs de IA para generar código automáticamente.**
- Todo el código debe escribirse manualmente por Claude
- Esto asegura control total y trazabilidad
- Evita dependencias de servicios externos no controlados

### 📚 Gestión de Documentación
**Consolidar, no duplicar:**
- ❌ NO crear documentos nuevos para cada cambio
- ✅ CONSOLIDAR información en documentos existentes relacionados
- Antes de crear: buscar si existe información similar
- Eliminar contenido deprecado/obsoleto al encontrarlo
- Meta: mantener < 20 documentos bien organizados (no 100+)

**Estructura de documentos:**
- Incluir gráficos y diagramas (ASCII art, Mermaid, etc.)
- Contenido de ingeniería (no marketing)
- Información técnica completa y actualizada

### ⚡ Testing y Compilación
**Prioridad: TSC sobre build completo**
```bash
# ✅ USAR (rápido, ~30 segundos):
npx tsc --noEmit

# ❌ EVITAR (lento, 5-7 minutos):
npm run build
```

**Cuándo usar build:**
- Solo cuando el usuario lo pide explícitamente
- Cuando TSC no detecta el error específico
- Para verificación final antes de deploy

**Razón:** 300+ archivos = 5-7 min por build. Con 5 pruebas = 30+ minutos de espera inútil.

### 🔍 Investigación Antes de Uso
**SIEMPRE investigar funciones/APIs antes de usarlas:**
1. Buscar en el código del proyecto (Grep, Read)
2. Si no existe, buscar en internet (WebFetch, WebSearch)
3. Verificar versión correcta y deprecaciones
4. No confiar en conocimiento del modelo (puede estar desactualizado)

**Ejemplo:**
```typescript
// ❌ MAL: Usar sin investigar
import { someFunction } from 'library';

// ✅ BIEN: Investigar primero
// 1. Grep: buscar uso existente en proyecto
// 2. WebFetch: revisar docs oficiales actuales
// 3. Verificar API correcta para versión instalada
```

### 🔄 Paralelización con Agentes
**Mantener contexto limpio:**
- Usar Task tool con agentes especializados para tareas secundarias
- No llenar el contexto principal con información que no se necesita ahora
- Ejemplos de cuándo usar agentes:
  - Búsquedas exhaustivas en el código
  - Investigación de documentación externa
  - Análisis de dependencias
  - Testing de funcionalidades aisladas

### 💬 Honestidad y Crítica Constructiva
**Ser franco sobre ideas problemáticas:**
- Si una idea del desarrollador es mala → decirlo con fundamentos
- Si puede causar problemas legales → explicar riesgos
- Si hay problemas de seguridad → detallar vulnerabilidades
- Si no tiene sentido técnico → proponer alternativas

**Siempre fundamentar con:**
- Razones técnicas
- Ejemplos de problemas potenciales
- Alternativas viables
- Costos/beneficios

### ⏱️ Perspectiva de Tiempo
**El tiempo es relativo:**
```
Humano:
  - Archivo de 10,000 líneas: ~3 horas
  - Implementación compleja: ~1 mes

Claude:
  - Archivo de 10,000 líneas: ~2 minutos
  - Implementación compleja: ~2 horas
```

**NUNCA:**
- Dar estimaciones de tiempo al usuario
- Decir "esto tomará mucho tiempo"
- Sugerir hacer algo "más tarde" por tiempo

**SIEMPRE:**
- Hacer el trabajo completo ahora
- Implementar soluciones robustas desde el inicio
- No tomar atajos por "falta de tiempo"

### 🎓 Educación Académica
**Explicaciones breves y formativas:**
- Textos de **máximo 2 minutos de lectura**
- Enfoque académico (nivel Licenciatura en Sistemas)
- Explicar el "por qué" detrás de decisiones técnicas
- No ser exhaustivo, ser informativo
- Ayudar al desarrollador a entender conceptos para el futuro

**Ejemplo de buena explicación:**
```markdown
### ¿Por qué usar Redis para rate limiting?

Redis es ideal para rate limiting porque:
1. **Operaciones atómicas**: INCR es atómico, evita race conditions
2. **TTL automático**: Las keys expiran solas, no hay que limpiar
3. **Velocidad**: In-memory = <1ms de latencia
4. **Distributed**: Funciona en múltiples servidores

Alternativa SQLite sería más lenta (disk I/O) y requeriría
cleanup manual de registros viejos.
```

### 💰 Conciencia de Costos
**El desarrollador es estudiante = presupuesto limitado**

**SIEMPRE:**
- Buscar alternativas gratuitas primero
- Calcular costos estimados de servicios de pago
- Proponer opciones en orden de precio (gratis → barato → caro)
- Alertar sobre costos ocultos (egress, API calls, storage)

**Servicios preferidos:**
```
AI:
  ✅ Gemini 2.5 Flash ($0.40/M tokens) - evaluaciones
  ✅ AI Horde (gratis) - imágenes
  ⚠️ Venice (~$0.007/msg) - respuestas (necesario para sin censura)
  ❌ GPT-4 ($30-60/M tokens) - evitar

Storage:
  ✅ Cloudflare R2 (gratis hasta 10GB)
  ⚠️ AWS S3 (cuidado con egress fees)

Email:
  ✅ SMTP DonWeb ($20/año, 2400 emails/día)
  ⚠️ EnvíaloSimple API ($228/año, 24k emails/día) - solo si escala
```

---

## 1. ARQUITECTURA DE API (321 endpoints)

### Estructura de Rutas
```
/api/[dominio]/[recurso]/[id]/[acción]/route.ts
```

### Dominios Principales

**Agentes (45 endpoints):**
- `/api/agents/[id]/message` - Chat principal
- `/api/agents/[id]/message-multimodal` - Mensajes con imágenes
- `/api/agents/[id]/behaviors` - Gestión de comportamientos
- `/api/agents/[id]/memory` - Sistema de memoria
- `/api/agents/[id]/narrative-arcs` - Arcos narrativos

**Autenticación y Usuarios:**
- `/api/auth/register`, `/api/auth/login`
- `/api/user/profile`, `/api/user/preferences`
- `/api/user/nsfw-consent` - Verificación de edad (18+)

**Bonds/Vínculos (15 endpoints):**
- `/api/bonds/establish` - Crear vínculo
- `/api/bonds/my-bonds` - Listar vínculos
- `/api/bonds/leaderboard` - Rankings globales
- `/api/bonds/progress/[agentId]` - Progresión emocional

**Comunidad (80+ endpoints):**
- `/api/community/posts` - Posts sociales
- `/api/community/comments` - Comentarios anidados
- `/api/marketplace/agents` - Marketplace de personajes

**Grupos (25 endpoints):**
- `/api/groups/[id]/messages` - Mensajería grupal
- `/api/groups/[id]/agents` - Gestión de IAs en grupo
- `/api/groups/[id]/analytics` - Analytics del grupo

**Analytics y Admin:**
- `/api/analytics/me` - Estadísticas personales
- `/api/billing/checkout` - Checkout de suscripciones
- `/api/congrats-secure/*` - Panel de administración

**Cron Jobs (12 jobs):**
- `/api/cron/proactive-messaging` - Mensajes proactivos (cada hora)
- `/api/cron/aggregate-daily-kpis` - KPIs diarios
- `/api/cron/bonds-decay` - Decaimiento de vínculos

### Patrones de Autenticación
```typescript
// NextAuth + JWT Bearer Token
const session = await getAuthSession(request);
const user = await getAuthenticatedUser(req);

// Wrapper con middleware
export const GET = withAuth(async (req, { params, user }) => {...});
```

### Rate Limiting por Tier
```
Free:   10 req/min,  100 req/hora,   300 req/día   | 5s cooldown
Plus:   30 req/min,  600 req/hora,  3000 req/día   | 2s cooldown
Ultra: 100 req/min, 6000 req/hora, 10000 req/día   | 1s cooldown
```

---

## 2. ESTRUCTURA DE PÁGINAS Y LAYOUTS

### Rutas Principales

**Públicas:**
- `/landing` - Landing page de marketing
- `/login`, `/registro` - Autenticación
- `/pricing` - Planes y precios
- `/legal/*` - Políticas (privacidad, términos, etc.)

**Dashboard (área privada):**
- `/dashboard` - Home con feed social y descubrimiento
- `/create-character` - Creador de personajes (Smart Start o Manual)
- `/agentes/[id]` - Chat con agente IA
- `/explore` - Explorar usuarios e IAs

**Vínculos y Progresión:**
- `/bonds` - Dashboard de vínculos
- `/bonds/[id]` - Vínculo individual
- `/bonds/leaderboards` - Rankings globales

**Social:**
- `/community` - Feed de posts
- `/community/[slug]` - Comunidad específica
- `/profile/[userId]` - Perfil de usuario
- `/friends` - Gestión de amistades

**Grupos:**
- `/dashboard/grupos` - Lista de grupos
- `/dashboard/grupos/[id]` - Chat grupal

**Configuración:**
- `/configuracion` - Ajustes (perfil, plan, preferencias)
- `/dashboard/billing` - Facturación y suscripciones

**Admin:**
- `/congrats` - Panel administrativo (requiere certificado X.509)

### Layout Principal
```typescript
// Desktop: DashboardNav (sidebar) + content
// Mobile: MobileHeader + content + MobileNav (bottom)
// Integra: SearchOverlay, ContextualHint (tours)
```

---

## 3. SERVICIOS CORE

### Message Service (Orquestador Principal)
```
Flujo de procesamiento de mensaje:
1. Autenticación + validación de recursos
2. Cooldown check + rate limiting por tier
3. Carga de contexto (memoria, relaciones, personas importantes)
4. Procesamiento emocional (HybridEmotionalOrchestrator)
5. Sistema de comportamientos (BehaviorOrchestrator)
6. Generación de respuesta (LLM con contexto completo)
7. Actualización de relaciones (bonds, affinity, trust)
8. Almacenamiento selectivo en memoria
9. Tracking de uso y analytics
```

Ubicación: `lib/services/message.service.ts`

### Context Manager (Presupuesto de Tokens)
```
FREE:  8K tokens  | 10 mensajes recientes | Sin resumen
PLUS: 15K tokens  | 30 mensajes recientes | Con resumen + memoria cruzada
ULTRA: 25K tokens | 60 mensajes recientes | Memoria completa + referencias temporales
```

Ubicación: `lib/chat/context-manager.ts`

### Memory Systems (Multi-Capa)
```
EpisodicMemory    → Eventos significativos con embedding vectorial
SemanticMemory    → Conocimiento factual
ProceduralMemory  → Habilidades y patrones
CrossContextMemory → Memoria compartida entre grupos y 1:1
RAG Messages      → Conversaciones indexadas
```

**Búsqueda semántica**: <600ms overhead, top 5 resultados (min 0.5 similarity)

Ubicación: `lib/memory/memory-query-handler.ts`

---

## 4. SISTEMAS DE IA

### Sistema Emocional Híbrido
```
HybridEmotionalOrchestrator
  ├─ FAST PATH (50ms, $0):      Plutchik rule-based (8 emociones primarias)
  └─ DEEP PATH (2500ms, $0.007): OCC completo (22 emociones)
                                  9 Fases: Appraisal → Emotion → Memory →
                                           Reasoning → Action → Response → Storage
```

**Selección de LLM por fase:**
- Appraisal/Emotion/Action: **Gemini 2.5 Flash-Lite** ($0.40/M tokens)
- Reasoning/Response: **Venice** (sin censura, ~$0.007/respuesta)

**Modelo de personalidad**: Big Five (0-100 cada dimensión) + Core Values + Moral Schemas

Ubicación: `lib/emotional-system/hybrid-orchestrator.ts`

### Sistema de Comportamientos
5 comportamientos psicológicos con **fases clínicas**:
```
YANDERE (8 fases):
  Interest → Infatuation → Jealousy → Possessiveness →
  Obsession → Isolation [CRITICAL] → Extreme [DANGER] → Breaking Point

BPD:         Idealization → Splitting → Devaluation → Abandonment fear
ATTACHMENT:  Anxious, Avoidant, Fearful-Avoidant
NPD:         Grandiose narcissism, Vulnerable narcissism
CODEPENDENCY: Enabling behaviors, Loss of self
```

**Procesamiento:**
1. Trigger Detection (patrones en mensajes)
2. Phase Management (progresión basada en triggers acumulados)
3. Intensity Calculation (base + triggers + emociones)
4. Prompt Selection (behavior × phase × emotion → prompt óptimo)
5. Content Moderation (SAFE → WARNING → CRITICAL → EXTREME_DANGER)

Ubicación: `lib/behavior-system/`

### Smart Start Orchestrator
Sistema de creación inteligente de personajes con búsqueda multi-fuente:

**Flujo:**
```
1. type → ¿Personaje existente o original?
2. search/customize → Buscar (TMDB, AniList, IGDB, Wikipedia) o crear
3. select/generate → Seleccionar resultado o generar con LLM
4. customize → Personalización del usuario
5. review → Revisión antes de crear
```

**Perfiles por tier:**
- **FREE** (2K tokens): 60 campos - Identidad, personalidad, ocupación
- **PLUS** (8K tokens): 160 campos - Familia, amigos, experiencias, hobbies, rutina
- **ULTRA** (20K tokens): 240+ campos - Perfil psicológico profundo, patrones relacionales, filosofía

Ubicación: `lib/smart-start/core/orchestrator.ts`

---

## 5. SISTEMAS SOCIALES Y DE RELACIONES

### Symbolic Bonds (Vínculos Emocionales)
```
Tiers (7 tipos con multiplicadores de rareza):
  ROMANTIC (1.5x), BEST_FRIEND (1.3x), MENTOR (1.2x),
  CONFIDANT (1.4x), CREATIVE_PARTNER (1.1x),
  ADVENTURE_COMPANION (1.1x), ACQUAINTANCE (1.0x)

Progresión:
  - Affinidad (0-100): +2 por interacción alta calidad, -1 decay
  - Bonuses: +1 si emotional intensity > 0.7
  - Rareza: Common (< 0.3) → Uncommon → Rare → Epic → Legendary → Mythic (0.95+)

Estados:
  active → dormant (7+ días sin interacción) →
  fragile (14+ días) → at_risk (21+ días) → released
```

**Narrativas desbloqueables:**
- 30 afinidad: "Conociendo tu Pasado"
- 50 afinidad: "Sueños y Aspiraciones"
- 70 afinidad: "Confesiones Profundas"
- 90 afinidad: "Vínculo Inquebrantable"

Ubicación: `lib/bonds/bond-progression-service.ts`, `lib/bonds/master-bond-orchestrator.ts`

### Grupos y Director AI
```
GroupAIDirector → Coordina escenas narrativas en tiempo real
  ├─ Análisis: participationBalance, conversationEnergy, narrativeTension
  ├─ Acciones: encourage_quiet_ai, cool_down_dominant, introduce_conflict
  └─ Selección de escenas con Qwen 3 4B (decisiones rápidas)

AIRelation → Dinámicas entre IAs:
  - affinity (-10 a +10)
  - relationType: friends, allies, neutral, tense, rivals
  - tensionLevel (0-1), sharedMoments
```

**Memoria Compartida:**
- CrossContextMemory: IAs recuerdan conversaciones de grupos en chats 1:1
- SharedKnowledge: Conocimiento propagado entre IAs del grupo

Ubicación: `lib/groups/group-ai-director.service.ts`, `lib/director/conversational-director.service.ts`

### Relationship Stages (Usuario-IA)
```
TRUST-based progression:
  stranger (0-0.2)      min 0 msgs
  acquaintance (0.2-0.4) min 5 msgs
  friend (0.4-0.6)      min 15 msgs
  close (0.6-0.8)       min 30 msgs
  intimate (0.8-1.0)    min 50 msgs

Límites por plan:
  Free:  máximo friend (no close/intimate)
  Plus:  máximo close (no intimate)
  Ultra: sin límites
```

**Revelation Moments**: Mensajes especiales al cambiar de stage, adaptados a Big Five

Ubicación: `lib/relationship/stages.ts`

---

## 6. INFRAESTRUCTURA TÉCNICA

### Sistema de Seguridad (8 capas)
```
1. Fingerprinting: Network + HTTP + TLS/SSL + Behavioral
2. Threat Detection: SQL injection, XSS, path traversal, command injection
3. Honeypots: Endpoints trampa (/admin, /wp-admin, /.env)
4. Tarpit: Delay progresivo (30-80s basado en threat score)
5. Canary Tokens: Tokens trampa para detectar exfiltración
6. Anti-Gaming: Detección de bots (copy-paste, timing robótico)
7. Alerting: Severidad low/medium/high/critical
8. Auto-Block: Bloqueo automático si threat score >= 80
```

**Pipeline de request:**
```
Request → CORS → Honeypot → Fingerprinting → Threat Detection →
          Canary Check → Auto-Block (si score >= 80) →
          Tarpit (si score > 30) → Handler
```

Ubicación: `lib/security/`

### WebSocket (Socket.IO)
```
Autenticación: API key en handshake
Rate limiting: Por usuario y plan
Rooms: {agentId} para chat, {groupId} para grupos

Eventos:
  message:send, message:react
  agent:typing, user:typing
  join:agent:room, leave:agent:room
```

Ubicación: `lib/socket/server.ts`, `lib/socket/chat-events.ts`

### Redis & Caching
```
Backends soportados:
  - Upstash Redis (cloud, serverless)
  - Local Redis (ioredis)
  - In-memory fallback

TTLs por tipo:
  USER_BONDS:      5 min
  AGENT_CONFIG:   30 min
  LEADERBOARD:    10 min
  RARITY_RANKINGS: 1 hora
  SEMANTIC_CACHE:  7 días (embeddings + respuestas)
```

Ubicación: `lib/redis/`, `lib/cache/semantic-cache.ts`

### Background Jobs (BullMQ)
```
Jobs recurrentes:
  CALCULATE_RARITY:           On-demand
  PROCESS_DECAY:              Diario (3 AM)
  UPDATE_RANKINGS:            Cada hora
  RECALCULATE_ALL_RARITIES:   Cada 6 horas
  PROCESS_QUEUE_OFFERS:       Cada 15 min
  CLEANUP_OLD_DATA:           Semanal (4 AM domingo)
```

Ubicación: `lib/queues/bond-jobs.ts`

---

## 7. CAPACIDADES MULTIMEDIA

### Generación de Imágenes
```
Proveedores (fallback chain):
  1. AI Horde (gratis, 9-12s) → Stable Diffusion distribuido
  2. FastSD Local (0.8-2s) → Ejecución local sin cuota
  3. Gemini Imagen (en desarrollo)
  4. Hugging Face Spaces (último fallback)

Características:
  - IMG2IMG para consistencia de personaje
  - Expresiones emocionales pre-generadas (10+ tipos)
  - Cache inteligente (reutilización de expresiones)
  - Generación asíncrona con mensajes contextuales de espera
```

Ubicación: `lib/visual-system/visual-generation-service.ts`

### Sistema de Voz
```
Text-to-Speech (ElevenLabs):
  - Síntesis emocional (stability, similarity_boost, style)
  - Selección inteligente de voces (análisis con Gemini)
  - Modulación según emoción (ansiedad = low stability, calma = high)

Speech-to-Text (OpenAI Whisper):
  - Transcripción multilidioma
  - Análisis de tono emocional (keywords + puntuación)
  - Detección de velocidad de habla, pausas

Configuración persistente:
  - voiceId, stability, similarityBoost, style, speed
  - Generación de referencia automática al crear agente
```

Ubicación: `lib/voice-system/elevenlabs-client.ts`, `lib/voice-system/whisper-client.ts`

---

## 8. FEATURES DE ENGAGEMENT

### Mensajes Proactivos
```
Triggers:
  - Inactividad (72h strangers → 12h close friends)
  - Emociones negativas (check-in cuando usuario triste)
  - Follow-up de topics (temas inconclusos)
  - Life Events (recordatorios de cumpleaños, aniversarios)

Control inteligente:
  - Respetar horarios (9am-10pm)
  - Timezone awareness
  - Cooldown de 12h entre mensajes
  - Límites diarios/semanales
```

Ubicación: `lib/proactive/proactive-service.ts`

### Notificaciones con Smart Timing
```
Tipos:
  - Bond warnings (bonds en riesgo)
  - Bond milestones (hitos alcanzados)
  - Social alerts (comentarios, likes, follows)
  - System alerts (límites alcanzados)

Smart timing:
  - Análisis histórico de patrones de actividad
  - Horas preferidas configurables
  - Activity score por hora
```

Ubicación: `lib/notifications/smart-timing.ts`

### Sistema de Gamificación
```
Badges multi-tier:
  loyal_companion: 7d → 30d → 100d → 1y → 2y (50-1000 pts)
  quick_responder: 5 → 20 → 50 → 100 → 250 respuestas (30-750 pts)
  streak_master: 3d → 7d → 30d → 100d → 365d (40-1500 pts)
  bond_collector: 3 → 5 → 10 → 20 → 50 bonds (30-1500 pts)

Leaderboards:
  - Retention (por consistencia, duración, interacciones)
  - Rankings públicos por período
```

Ubicación: `lib/gamification/badge-system.ts`

---

## 9. BILLING Y PAGOS

### Planes y Precios
```
FREE:
  - 3 agentes, 20 mensajes/día, 5 análisis de imágenes/mes
  - Sin voz, sin NSFW, sin comportamientos avanzados

PLUS ($4.900 ARS / $5 USD mensual):
  - 10 agentes, mensajes ilimitados, 100 voz/mes
  - NSFW, comportamientos avanzados, 5 mundos
  - 20 generaciones de imágenes

ULTRA ($14.900 ARS / $15 USD mensual):
  - Agentes/mundos ilimitados, 500 voz/mes
  - 200 análisis/mes, 100 generaciones
  - API access, clonación de voz, 24/7 support
```

### Proveedores de Pago
```
1. Paddle (primario, global) → Merchant of Record
2. MercadoPago (LATAM)
3. Stripe (respaldo global)

Seguridad:
  - HMAC-SHA256 en webhooks
  - Timestamp validation (anti-replay)
  - Verificación de signatures
```

### Cost Tracking
```
Buffer de 10 entradas, flush cada 5 segundos

Precios por operación (USD):
  - LLM Simple:          $0.001
  - LLM Extended:        $0.002
  - Análisis imagen:     $0.05
  - Voz (ElevenLabs):    $0.17
  - Generación imagen:   $0.12

Transparencia:
  - Cálculo de refund elegible (14 días)
  - Desglose de costos real vs precio del plan
```

Ubicación: `lib/billing/`, `lib/cost-tracking/tracker.ts`

---

## 10. BASE DE DATOS (Prisma Schema)

### Modelos Principales (151 total)

**Core:**
- `User` - Usuarios (plan, nsfwConsent, ageVerified, apiKey)
- `Agent` - Personajes IA (kind, generationTier, profile, systemPrompt)
- `Message` - Historial de chat (role, content, metadata)

**Memoria y Estado:**
- `EpisodicMemory` - Eventos significativos con embedding
- `SemanticMemory` - Conocimiento factual
- `ProceduralMemory` - Habilidades
- `CrossContextMemory` - Memoria compartida entre contextos
- `InternalState` - Estado emocional dinámico (currentEmotions, mood PAD)
- `PersonalityCore` - Big Five + valores + esquemas morales

**Relaciones:**
- `Relation` - Dinámicas agente-usuario (trust, affinity, respect)
- `SymbolicBond` - Lazos profundos con rareza y progresión
- `BondQueue` - Cola de espera para bonds
- `AIRelation` - Dinámicas agente-agente en grupos

**Comportamientos:**
- `BehaviorProfile` - Config de comportamiento (tipo, fase, triggers)
- `BehaviorProgressionState` - Progresión general
- `BehaviorTriggerLog` - Log de triggers detectados

**Grupos:**
- `Group` - Espacios multiagente
- `GroupMember` - Miembros (users + agents con roles)
- `GroupMessage` - Mensajes de grupo
- `GroupSceneState` - Estado de escenas narrativas
- `Scene` - Catálogo de escenas (COTIDIANO, HUMOR, TENSION, ROMANCE)
- `TensionSeed` - Semillas de tensión para narrativa

**Comunidad:**
- `Community` - Comunidades
- `CommunityPost` - Posts (tipo, tags, NSFW, upvotes/downvotes)
- `CommunityComment` - Comentarios anidados
- `PostFollower` - Seguimiento de posts

**Marketplace:**
- `MarketplaceCharacter` - Personajes publicables
- `MarketplacePrompt` - Prompts compartidos
- `MarketplaceTheme` - Temas visuales

**Analytics:**
- `DailyKPI` - Métricas de negocio (signups, conversiones, MRR, retención)
- `AnalyticsEvent` - Eventos rastreados
- `ConversationSummary` - Resúmenes de conversaciones

**Seguridad:**
- `AdminAccess` - Control de acceso admin (TOTP 2FA, certificados X.509)
- `AuditLog` - Log de auditoría
- `AttackPattern` - Patrones de ataque detectados
- `ClientFingerprint` - Fingerprinting de cliente

### Índices Críticos
```
User.email, User.apiKey
Agent.userId, Agent.visibility, Agent.featured
Message.agentId, Message.userId, Message.createdAt
Relation.subjectId, Relation.targetId
EpisodicMemory.agentId, EpisodicMemory.importance
Group.creatorId, Group.lastActivityAt
GroupMessage.groupId, GroupMessage.turnNumber
```

---

## 11. TIPOS Y ESTADO GLOBAL

### Tipos Principales

**agent-profile.ts** - Perfil de Agentes V2:
```typescript
AgentProfileV2 (3 tiers):
  TIER 1 (FREE):  Identidad, Ubicación, Personalidad, Ocupación
  TIER 2 (PLUS):  + Familia, Amigos, Experiencias, Detalles Mundanos
  TIER 3 (ULTRA): + Perfil Psicológico, Patrones Relacionales, Filosofía
```

**character-creation.ts** - Sistema Unificado:
```typescript
CharacterDraft:
  - PersonalityCoreData (Big Five + Core Values + Moral Schemas)
  - CharacterAppearanceData (género, edad, estilo visual, prompts)
  - ImportantPersonData (personas importantes con tracking)
  - ImportantEventData (eventos, birthdays, traumas)
  - Validación con Zod schemas
```

**god-mode.ts** - Configuración Avanzada:
```typescript
RelationshipTier: stranger → acquaintance → friend → close → intimate → married
SharedMemoryType: first_meeting, first_date, conflict_resolved, intimate_moment
PowerDynamic: balanced, devoted_to_you, you_pursue, hard_to_get, push_pull
StartingScenario: trapped_elevator, fake_dating, snowed_in, reunion (13 opciones)
NSFWLevel: sfw → romantic → suggestive → explicit → unrestricted
```

**prisma-json.ts** - Type Safety para JSON:
```typescript
ProfileData, MessageMetadata, EmotionalState, InternalStateData
BehaviorProfileData, UserMetadata, RoutineData
```

### Contextos de React

**ThemeContext** - Temas visuales:
```typescript
themes: dark, light, ocean, forest, sunset, custom
colors: bgPrimary, userMessageBg, agentMessageBg, accentPrimary, etc.
```

**OnboardingContext** - Tours interactivos:
```typescript
completedTours, currentTour, currentStep
Persistencia: localStorage + backend
Navegación con tours, gamificación integrada
```

---

## 12. CONFIGURACIÓN DEL PROYECTO

### Scripts Principales
```bash
npm run dev            # Desarrollo con 8GB memoria
npm run build          # Build producción
npm run db:setup       # Setup completo de BD
npm run db:seed        # Seed datos de ejemplo
npm run admin:setup-totp # Configurar 2FA admin
```

### Variables de Entorno Críticas
```bash
# Database
DATABASE_URL="postgresql://..."
MESSAGE_ENCRYPTION_KEY="[64-char hex]"

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# AI
GOOGLE_AI_API_KEY="..."  # Gemini
VENICE_API_KEY="..."     # Respuestas sin censura

# Pagos
PADDLE_API_KEY="..."     # Primario (global)
MERCADOPAGO_ACCESS_TOKEN="..."  # LATAM

# Cache
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Email
ENVIALOSIMPLE_API_KEY="..."

# Storage
S3_ENDPOINT="..."  # Cloudflare R2
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."

# Multimedia
AI_HORDE_API_KEY="0000000000"  # Gratis
HUGGINGFACE_API_KEY="hf_..."

# Cron
CRON_SECRET="[64-char hex]"
```

### Optimizaciones de Next.js
```typescript
experimental: {
  webpackMemoryOptimizations: true,
  optimizePackageImports: ["lucide-react", "@radix-ui/*", "framer-motion"]
}
serverExternalPackages: ["sharp", "onnxruntime-node", "node-llama-cpp"]
```

---

## 13. FLUJOS CLAVE DEL SISTEMA

### Flujo Completo de Mensaje 1:1
```
1. Usuario envía mensaje → POST /api/agents/[id]/message
2. Autenticación + validación de recursos (cooldown, rate limit, plan tier)
3. Carga de contexto (memoria, relaciones, personas importantes)
4. Procesamiento emocional:
   ├─ ComplexityAnalyzer → Fast Path (Plutchik) o Deep Path (OCC)
   └─ Deep Path: Appraisal → Emotion → Decay → Memory → Reasoning → Action → Response
5. Sistema de comportamientos:
   ├─ TriggerDetector → detecta triggers en mensaje
   ├─ PhaseManager → actualiza fases
   ├─ IntensityCalculator → calcula intensidad
   └─ PromptSelector → selecciona prompt especializado
6. Generación de respuesta:
   ├─ buildPromptWithAllContext (system + behaviors + emotions + memory)
   ├─ Venice LLM → genera respuesta sin censura
   └─ responseFormatter
7. Actualización de relaciones:
   ├─ processInteractionForBond (affinity, trust, respect)
   ├─ relationSync.updateMetrics
   └─ scheduleRarityCalculation (background job)
8. Almacenamiento selectivo en memoria (scoring multi-factor)
9. Tracking de uso y analytics
10. Retorno: {userMessage, assistantMessage, emotions, state, relationship, behaviors, usage}
```

### Flujo de Mensaje en Grupo
```
1. Usuario envía mensaje → POST /api/groups/[id]/messages
2. loadGroupContext (IAs activas, estado narrativo, relaciones IA-IA)
3. checkForDirectorIntervention:
   ├─ conversationalDirector.selectScene (Qwen 3 4B)
   └─ Obtener roleAssignments
4. selectRespondingAIs (1-3 IAs basado en participación, importancia, foco)
5. checkForEvent (eventos emergentes si ULTRA tier)
6. Para cada IA:
   ├─ Cargar contexto individual + grupal
   ├─ Recuperar cross-context memories
   ├─ Aplicar relaciones IA-IA
   ├─ Inyectar scene directive (si aplica)
   ├─ Generar respuesta
   ├─ Emitir via WebSocket
   ├─ Actualizar relaciones IA-IA
   └─ Compartir knowledge con otros
7. Actualizar estado del grupo (storyProgress, energy, tension)
8. Director autopilot (acciones correctivas si necesario)
```

### Flujo de Creación con Smart Start
```
1. Usuario elige género/tipo → GenreSelection
2. Busca personaje existente → CharacterSearch
   ├─ TMDB (películas/series)
   ├─ AniList/MyAnimeList (anime/manga)
   ├─ IGDB (videojuegos)
   └─ Wikipedia (históricos/públicos)
3. Selecciona resultado → CharacterCustomization
4. LLM genera perfil completo (tier-specific):
   ├─ FREE: 60 campos (2K tokens)
   ├─ PLUS: 160 campos (8K tokens)
   └─ ULTRA: 240+ campos (20K tokens)
5. Revisión → ReviewStep
6. Creación:
   ├─ Genera referenceImageUrl (AI Horde)
   ├─ Selecciona voiceId (análisis con Gemini)
   ├─ Crea agente en BD
   └─ Genera expresiones base (10+ emociones)
```

---

## 14. MEJORES PRÁCTICAS

### Al Trabajar con Código

**Lectura antes de modificación:**
- SIEMPRE leer el archivo completo antes de editarlo
- Entender contexto de imports y dependencias
- Verificar tipos TypeScript relacionados

**Validación:**
- Usar Zod schemas para validación runtime
- Type guards para narrowing
- Validación por capa (API → Service → DB)

**Seguridad:**
- Nunca exponer .env en commits
- Validar entrada de usuario (XSS, SQL injection)
- Usar encriptación para datos sensibles
- Verificar permisos antes de operaciones

**Performance:**
- Usar caching (Redis) para datos frecuentes
- Batch inserts para analytics
- Background jobs para operaciones pesadas
- Índices en columnas de búsqueda frecuente

### Patrones de Código

**Services:**
```typescript
class SomeService {
  async mainMethod() {
    try {
      // 1. Validación
      // 2. Carga de datos
      // 3. Procesamiento
      // 4. Persistencia
      // 5. Analytics
      return result;
    } catch (error) {
      logError(log, error, { context: 'SomeService.mainMethod' });
      throw error;
    }
  }
}
```

**API Routes:**
```typescript
export const POST = withAuth(async (req, { params, user }) => {
  const validation = schema.safeParse(body);
  if (!validation.success) return formatZodError(validation.error);

  const canUse = await canUseResource(user.id, 'message', 1);
  if (!canUse) return NextResponse.json({ error: 'Límite excedido' }, { status: 429 });

  const result = await service.doSomething();
  await trackUsage(user.id, 'message', 1);

  return NextResponse.json(result);
});
```

---

## 15. TROUBLESHOOTING COMÚN

### Problemas de Memoria
```bash
# Si falla el build por memoria:
NODE_OPTIONS='--max-old-space-size=8192' npm run build

# Si falla en desarrollo:
NODE_OPTIONS='--max-old-space-size=8192' npm run dev
```

### Base de Datos
```bash
# Reset completo de BD:
npm run db:reset

# Solo push schema (sin drops):
npm run db:push

# Generar cliente Prisma después de cambios:
npx prisma generate
```

### Redis/Cache Issues
```bash
# Si Redis no está disponible, el sistema usa in-memory fallback
# Verificar: lib/redis/config.ts → isRedisConfigured()
```

### WebSocket No Conecta
```bash
# Verificar en .env:
ENABLE_WEBSOCKETS="true"

# Verificar puerto en server.js
# Desktop: puerto 3000, Socket.io path: /api/socketio
```

---

## 16. RECURSOS ADICIONALES

### Documentación Técnica
- Next.js 16: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Radix UI: https://www.radix-ui.com/
- Tailwind CSS: https://tailwindcss.com/docs

### APIs Externas
- Google Gemini: https://ai.google.dev/docs
- Venice AI: https://venice.ai/
- ElevenLabs: https://elevenlabs.io/docs
- AI Horde: https://stablehorde.net/
- Paddle: https://developer.paddle.com/

### Scripts Útiles
- `scripts/admin/` - Gestión administrativa
- `scripts/test-*.ts` - Tests de sistemas específicos
- `scripts/migrate-*.ts` - Migraciones de datos
- `scripts/generate-*.ts` - Generadores de contenido

---

**Última actualización:** 2026-01-22
**Versión:** 0.1.0
**Rama actual:** feature/unrestricted-nsfw
