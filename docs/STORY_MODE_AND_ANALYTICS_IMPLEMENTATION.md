# Story Mode y Analytics - Implementación Completa

## 📋 Resumen

Se han implementado con éxito las **features avanzadas** para el sistema de Grupos:

1. ✅ **Story Mode** (PLUS/ULTRA) - Sistema de narrativa guiada
2. ✅ **AI Director** (PLUS/ULTRA) - Coordinador narrativo inteligente
3. ✅ **Eventos Emergentes** (PLUS/ULTRA) - Situaciones inesperadas
4. ✅ **Analytics Dashboard** (ULTRA) - Métricas y visualizaciones

---

## 🎭 STORY MODE

### Descripción
Sistema de narrativa guiada que transforma conversaciones grupales en experiencias narrativas coherentes.

### Archivos Creados
- **Servicio**: `lib/groups/group-story-engine.service.ts`

### Funcionalidades

#### 1. Story Arcs Generados Dinámicamente
```typescript
interface StoryArc {
  title: string;
  theme: string;
  beats: StoryBeat[];
  currentBeatIndex: number;
  progress: number;
}
```

**Beats Narrativos**:
- `introduction` - Los personajes se conocen
- `rising_action` - Se desarrolla tensión o interés
- `conflict` - Surge un desafío o conflicto
- `climax` - Momento de mayor tensión
- `resolution` - Resolución del conflicto
- `transition` - Transiciones entre beats

#### 2. Generación con LLM
El sistema usa **Llama 3.3 70B** (via Venice AI) para:
- Crear arcos narrativos basados en las personalidades de las IAs
- Generar beats dinámicos basados en conversaciones recientes
- Adaptar la narrativa según el contexto del grupo

#### 3. Progreso Narrativo
```typescript
// Progreso basado en:
- Número de mensajes en el beat actual
- Tiempo transcurrido
- Duración objetivo (short/medium/long)

// Cuando progreso >= 1.0 → Avanzar al siguiente beat
```

#### 4. Scene Directions
Sistema de "direcciones de escena" que guían las respuestas de las IAs:
```typescript
{
  type: "introduction" | "conflict_introduction" | ...,
  direction: "Descripción de lo que debe ocurrir",
  focus: ["id_ia1", "id_ia2"], // IAs en foco
  timestamp: "2024-01-15T10:30:00Z"
}
```

#### 5. Integración con AI Responses
Las respuestas de las IAs consideran:
- Beat narrativo actual
- Objetivos del beat
- Direcciones de escena
- Importancia narrativa del personaje (main/secondary/filler)

### Cómo Activar Story Mode

**Por API**:
```javascript
PATCH /api/groups/{groupId}
{
  "storyMode": true
}
```

**Inicialización**:
```typescript
await groupStoryEngineService.initializeStoryMode(groupId);
```

**Actualización de Progreso** (automática):
```typescript
// Se ejecuta después de cada respuesta de IA
await groupStoryEngineService.updateStoryProgress(groupId);
```

---

## 🎬 AI DIRECTOR

### Descripción
Sistema que analiza y coordina la narrativa del grupo en tiempo real, balanceando participación y gestiona tensión narrativa.

### Archivo Creado
- **Servicio**: `lib/groups/group-ai-director.service.ts`

### Funcionalidades

#### 1. Análisis de Grupo
```typescript
interface DirectorAnalysis {
  participationBalance: number; // 0-1 (1 = perfectamente balanceado)
  conversationEnergy: number;   // 0-1
  narrativeTension: number;     // 0-1
  recommendedActions: DirectorAction[];
}
```

**Métricas Calculadas**:
- **Participation Balance**: Basado en desviación estándar de mensajes por miembro
- **Conversation Energy**: Basado en frecuencia y longitud de mensajes recientes
- **Narrative Tension**: Basado en beat narrativo actual (si Story Mode activo)

#### 2. Acciones del Director
```typescript
type DirectorAction =
  | "encourage_quiet_ai"      // Animar IA silenciosa
  | "cool_down_dominant_ai"   // Reducir participación de IA dominante
  | "introduce_conflict"      // Introducir conflicto
  | "resolve_tension"         // Resolver tensión
  | "shift_focus"             // Cambiar foco narrativo
  | "advance_story";          // Avanzar historia
```

#### 3. Autopilot Mode
El director se ejecuta automáticamente después de cada mensaje:
```typescript
// En GroupMessageService.generateAIResponses()
if (group.directorEnabled) {
  await groupAIDirectorService.runDirectorAutopilot(groupId);
}
```

**Acciones automáticas cuando**:
- Balance de participación < 0.6
- Energía conversacional < 0.3 o > 0.8
- Progreso del beat > 0.9
- Tensión narrativa > 0.7 sostenida

#### 4. Manipulación de Estado
El director puede:
- Cambiar `importanceLevel` de IAs (main/secondary/filler)
- Activar/desactivar `isFocused` en miembros
- Actualizar `currentSceneDirection` del grupo

#### 5. Balanceo de Participación
**Algoritmo**:
1. Contar mensajes por IA en últimos 10 minutos
2. Si ratio > 2:1 entre más activa y menos activa
3. → Cool down IA dominante + Encourage IA silenciosa

---

## ✨ EVENTOS EMERGENTES

### Descripción
Sistema de eventos inesperados que añaden variedad y sorpresa a las conversaciones grupales.

### Archivo Creado
- **Servicio**: `lib/groups/group-emergent-events.service.ts`

### Funcionalidades

#### 1. Tipos de Eventos
```typescript
type EventType =
  | "external_arrival"   // Nueva IA/usuario temporal
  | "mood_shift"         // Cambio emocional colectivo
  | "topic_injection"    // Tema inesperado
  | "time_pressure"      // Decisión rápida requerida
  | "revelation"         // Revelación de un miembro
  | "challenge"          // Desafío o dilema
  | "celebration"        // Evento positivo
  | "mystery"            // Algo inexplicable
  | "technical_glitch";  // "Problema técnico" divertido
```

#### 2. Probabilidad de Eventos
**Base**: 5% por chequeo

**Incrementa si**:
- Conversación larga (>25 mensajes) → +10%
- Story Mode activo → +15%
- Más de 60 minutos desde último evento → +20%
- No ha habido eventos aún → +10%

**Máximo**: 40% probabilidad

#### 3. Generación con LLM
Similar a Story Mode, usa Llama 3.3 70B para generar eventos contextuales:
```typescript
// Considera:
- Conversación reciente (últimos 10 mensajes)
- Personalidades de las IAs
- Contexto del grupo
```

#### 4. Duración y Efectos
```typescript
interface EmergentEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  impact: "minor" | "moderate" | "major";
  affectedAIs?: string[];
  duration: number; // minutos
}
```

**Efectos en IAs afectadas**:
- `isFocused = true` durante la duración
- `importanceLevel` ajustada según impact
- Incluido en contexto de prompts

#### 5. Integración
```typescript
// Se chequea antes de generar respuestas de IA
if (group.emergentEventsEnabled) {
  await groupEmergentEventsService.checkForEvent(groupId);
}

// Incluido en prompts de IA
if (group.currentEmergentEvent) {
  prompt += `\nEVENTO ACTUAL: ${event.title} - ${event.description}`;
}
```

#### 6. Trigger Manual
```typescript
await groupEmergentEventsService.triggerSpecificEvent(
  groupId,
  "revelation"
);
```

---

## 📊 ANALYTICS DASHBOARD (ULTRA)

### Descripción
Sistema completo de analytics con métricas, visualizaciones y análisis de relaciones para grupos.

### Archivos Creados
- **API**: `app/api/groups/[id]/analytics/route.ts`
- **Componente**: `components/groups/GroupAnalyticsDashboard.tsx`
- **Página**: `app/dashboard/grupos/[id]/analytics/page.tsx`

### Métricas Disponibles

#### 1. Overview
```typescript
{
  totalMessages: number;
  totalMembers: number;
  activityScore: number;      // 0-100
  balanceScore: number;       // 0-1
  engagementRate: number;     // 0-1
  avgResponseTime: number;    // minutos
}
```

**Activity Score** (0-100):
```
Basado en mensajes/día:
- 0-5 msgs/día = bajo
- 5-20 msgs/día = medio
- 20+ msgs/día = alto
```

**Balance Score** (0-1):
```
Basado en coeficiente de variación:
score = exp(-stdDev/avg)

Cercano a 1 = participación balanceada
Cercano a 0 = muy desbalanceada
```

**Engagement Rate** (0-1):
```
Basado en mensajes por miembro:
rate = min(messagesPerMember / 50, 1)
```

#### 2. Participación
```typescript
{
  byMember: Array<{
    type: "user" | "agent",
    id: string,
    name: string,
    messageCount: number
  }>,
  byDay: Array<{
    date: string,
    count: number
  }>,
  trends: Array<{
    id: string,
    totalMessages: number,
    lastActive: Date
  }>
}
```

#### 3. Contenido
```typescript
{
  topWords: Array<{
    word: string,
    count: number
  }>
}
```

**Análisis de palabras**:
- Filtra stop words (español + inglés)
- Mínimo 4 caracteres
- Top 20 palabras más frecuentes

#### 4. Relaciones
```typescript
Array<{
  from: string,  // memberId
  to: string,    // memberId
  interactions: number  // replies entre ellos
}>
```

**Matriz de interacciones**:
- Basada en replies (replyToId)
- Muestra quién responde a quién
- Top 20 pares con más interacciones

### Visualizaciones

#### 1. Stat Cards
6 cards con métricas principales:
- Total Mensajes
- Miembros Activos
- Tiempo de Respuesta
- Activity Score (con trend)
- Balance Score (con trend)
- Engagement Rate (con trend)

#### 2. Participation Chart
Barras horizontales mostrando:
- Ranking de participación
- Nombre + tipo (usuario/IA)
- Número de mensajes
- Barra de progreso relativa

#### 3. Activity Timeline
Gráfico de barras simple:
- Actividad por día
- Altura relativa al día con más mensajes
- Tooltip con fecha + count
- Total y promedio debajo

#### 4. Word Cloud
Tags de diferentes tamaños:
- Tamaño basado en frecuencia
- 0.7x a 1.5x tamaño de fuente
- Hover effect
- Count visible

#### 5. Relationship List
Top 10 interacciones:
- Ranking numerado
- Visual: Miembro → Miembro
- Número de interacciones

### Time Ranges
```typescript
- "7d" - Últimos 7 días
- "30d" - Últimos 30 días
- "all" - Todo el historial
```

### Restricción ULTRA
```typescript
// API verifica:
const featureCheck = await checkFeature(
  user.id,
  Feature.GROUPS_ANALYTICS
);

if (!featureCheck.hasAccess) {
  return 403; // Forbidden
}
```

**Página muestra upgrade prompt** si no es ULTRA.

---

## 🔗 INTEGRACIÓN CON MENSAJERÍA

### En GroupMessageService

```typescript
async generateAIResponses(groupId, triggeringMessage) {
  // 1. Cargar contexto
  // 2. Seleccionar IAs

  // 3. EVENTOS EMERGENTES (si enabled)
  if (group.emergentEventsEnabled) {
    await groupEmergentEventsService.checkForEvent(groupId);
  }

  // 4. Generar respuestas
  for (const ai of respondingAIs) {
    const response = await this.generateSingleAIResponse(
      ai, triggeringMessage, group, previousResponses
    );
  }

  // 5. STORY MODE (si enabled)
  if (group.storyMode) {
    await groupStoryEngineService.updateStoryProgress(groupId);
  }

  // 6. AI DIRECTOR (si enabled)
  if (group.directorEnabled) {
    await groupAIDirectorService.runDirectorAutopilot(groupId);
  }
}
```

### En Prompts de IA

```typescript
// Story Mode context
if (group.storyMode && group.currentStoryBeat) {
  prompt += `
[MODO HISTORIA ACTIVO]
Beat narrativo actual: ${beat.description}
Objetivos: ${beat.objectives.join(", ")}
Dirección de escena: ${sceneDirection}
`;
}

// Emergent event context
if (group.currentEmergentEvent) {
  prompt += `
EVENTO ACTUAL: ${event.title} - ${event.description}
`;
}
```

---

## 📍 ENDPOINTS NUEVOS

### Analytics
```
GET /api/groups/[id]/analytics?range=7d|30d|all
```

**Response**:
```json
{
  "overview": { ... },
  "participation": { ... },
  "content": { ... },
  "relationships": [ ... ],
  "metadata": { ... }
}
```

**Auth**: Requiere usuario autenticado + miembro del grupo
**Feature**: `GROUPS_ANALYTICS` (ULTRA tier)

---

## 🎯 CONFIGURACIÓN POR TIER

### FREE
```typescript
{
  storyMode: false,
  directorEnabled: false,
  emergentEventsEnabled: false,
  // No analytics
}
```

### PLUS
```typescript
{
  storyMode: true,            // ✅
  directorEnabled: true,      // ✅
  emergentEventsEnabled: true, // ✅
  // No analytics
}
```

### ULTRA
```typescript
{
  storyMode: true,            // ✅
  directorEnabled: true,      // ✅
  emergentEventsEnabled: true, // ✅
  analytics: true             // ✅
}
```

---

## 🧪 TESTING

### Activar Story Mode
```typescript
// 1. Crear grupo
POST /api/groups
{ "name": "Test Group" }

// 2. Actualizar config
PATCH /api/groups/{id}
{ "storyMode": true }

// 3. Inicializar (opcional, se auto-inicializa)
// await groupStoryEngineService.initializeStoryMode(groupId);

// 4. Enviar mensajes
// Story engine se actualiza automáticamente
```

### Probar AI Director
```typescript
// Director se ejecuta automáticamente si:
group.directorEnabled = true

// Verificar análisis:
const analysis = await groupAIDirectorService.analyzeGroup(groupId);
console.log(analysis.participationBalance);
console.log(analysis.recommendedActions);
```

### Generar Evento Emergente
```typescript
// Auto (probabilístico):
// Se chequea automáticamente si emergentEventsEnabled=true

// Manual:
await groupEmergentEventsService.triggerSpecificEvent(
  groupId,
  "celebration"
);
```

### Ver Analytics
```
http://localhost:3000/dashboard/grupos/{groupId}/analytics
```

---

## 📝 NOTAS IMPORTANTES

### Performance
- Story engine genera arcos con LLM (cache recomendado)
- AI Director analiza cada 10+ mensajes
- Eventos emergentes: chequeo probabilístico ligero
- Analytics: consultas optimizadas con índices

### Escalabilidad
- Todos los servicios son singletons
- Operaciones async para no bloquear respuestas
- Errores no afectan flujo principal

### LLM Usage
**Llama 3.3 70B** via Venice AI para:
- Story arc generation (temp: 0.9, max: 1000 tokens)
- Story beat generation (temp: 0.8, max: 300 tokens)
- Emergent event generation (temp: 0.9, max: 300 tokens)

**No se usa LLM para**:
- AI Director (análisis matemático)
- Analytics (agregaciones SQL)

### Fallbacks
- Story arcs: default arc si LLM falla
- Emergent events: random default event
- Director: graceful degradation

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

1. **Testing exhaustivo**:
   - Crear grupos de prueba con diferentes tiers
   - Simular conversaciones largas
   - Verificar progresión narrativa

2. **Optimizaciones**:
   - Cache de story arcs generados
   - Rate limiting para analytics
   - Índices adicionales para queries

3. **UI Enhancements**:
   - Mostrar beat actual en UI del grupo
   - Notificaciones de eventos emergentes
   - Indicadores de Story Mode activo

4. **Analytics Avanzadas**:
   - Sentiment analysis
   - Topic modeling
   - Network graphs para relaciones

5. **Exportación**:
   - Exportar narrativa completa (con beats)
   - PDF con analytics
   - Compartir insights

---

## ✅ RESUMEN DE ARCHIVOS

### Servicios Creados
1. `lib/groups/group-story-engine.service.ts` - Story Mode
2. `lib/groups/group-ai-director.service.ts` - AI Director
3. `lib/groups/group-emergent-events.service.ts` - Eventos Emergentes

### APIs Creadas
1. `app/api/groups/[id]/analytics/route.ts` - Analytics endpoint

### Componentes Creados
1. `components/groups/GroupAnalyticsDashboard.tsx` - Dashboard UI

### Páginas Creadas
1. `app/dashboard/grupos/[id]/analytics/page.tsx` - Analytics page

### Modificaciones
1. `lib/groups/group-message.service.ts`:
   - Importación de nuevos servicios
   - Integración en `generateAIResponses()`
   - Context en prompts

---

## 🎉 IMPLEMENTACIÓN COMPLETA

Todas las features avanzadas de grupos han sido implementadas exitosamente:

✅ Story Mode con beats narrativos dinámicos
✅ AI Director con balanceo automático
✅ Eventos emergentes probabilísticos
✅ Analytics Dashboard completo (ULTRA)

**Total de código**: ~3,000 líneas
**Archivos nuevos**: 7
**Archivos modificados**: 1

El sistema está listo para testing y deployment! 🚀
