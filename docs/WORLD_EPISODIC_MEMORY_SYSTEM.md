# Sistema de Memoria Episódica para Mundos Virtuales

## Descripción General

El sistema de memoria episódica para mundos permite que cada agente recuerde eventos específicos que le ocurrieron, logrando coherencia narrativa de largo plazo (1000+ turnos) y relaciones que evolucionan de manera realista.

## Características Principales

### 1. Memoria Episódica por Agente
- **Eventos específicos**: "El día que María me confesó su secreto"
- **Contexto temporal**: Asociado a turnos específicos
- **Emociones asociadas**: Estado emocional durante el evento
- **Agentes involucrados**: Quién participó en el episodio

### 2. Búsqueda Semántica
- **Embeddings**: Usa Qwen3-Embedding-0.6B para búsqueda vectorial
- **Fallback keyword**: Si los embeddings fallan, usa matching de palabras clave
- **Scoring híbrido**: Combina relevancia semántica + importancia + recency

### 3. Decay Temporal
- **Eventos recientes**: Mayor peso en el retrieval
- **Eventos importantes**: Decaen más lentamente
- **Acceso frecuente**: Memorias recordadas más a menudo permanecen accesibles

### 4. Consolidación Automática
- **Mundos largos**: Agrupa memorias similares después de 1000+ turnos
- **Reduce redundancia**: Combina eventos de baja importancia
- **Mantiene importantes**: Eventos críticos nunca se consolidan

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────┐
│         WorldSimulationEngine                   │
│  (Guarda episodios automáticamente)             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      WorldAgentMemoryService                    │
│  - saveEpisode()                                │
│  - retrieveRelevantEpisodes()                   │
│  - consolidateMemories()                        │
│  - getMemoryStats()                             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      WorldEpisodicMemory (Prisma Model)         │
│  - event, turnNumber, importance                │
│  - emotionalArousal, emotionalValence           │
│  - embedding, keywords                          │
│  - decayFactor, accessCount                     │
└─────────────────────────────────────────────────┘
```

## Modelo de Datos

### WorldEpisodicMemory

```typescript
{
  id: string
  worldId: string
  agentId: string

  // Contenido
  event: string // "María me confesó que tiene miedo de perderse"
  summary?: string // Resumen consolidado (opcional)

  // Contexto
  turnNumber: number // Turno en que ocurrió
  involvedAgentIds: string[] // Otros agentes en el evento
  location?: string // Ubicación del evento

  // Importancia
  importance: number // 0-1 (qué tan memorable)
  emotionalArousal: number // 0-1 (intensidad emocional)
  emotionalValence: number // -1 a 1 (negativo a positivo)
  dominantEmotion?: string // Emoción dominante

  // Búsqueda
  embedding?: number[] // Vector para búsqueda semántica
  keywords?: string[] // Keywords extraídas

  // Decay y acceso
  decayFactor: number // Disminuye con el tiempo
  lastAccessed: Date // Última vez recuperado
  accessCount: number // Veces recuperado

  // Consolidación
  isConsolidated: boolean
  consolidatedFrom?: string[] // IDs de memorias consolidadas

  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}
```

## Uso del Sistema

### 1. Guardar un Episodio Manualmente

```typescript
import { WorldAgentMemoryService } from '@/lib/worlds/world-agent-memory.service';

const memoryService = new WorldAgentMemoryService(worldId);

await memoryService.saveEpisode({
  agentId: 'agent-1',
  event: 'María me confesó su secreto sobre el incidente del laboratorio',
  involvedAgentIds: ['agent-2'], // María
  turnNumber: 142,

  // Importancia y emociones
  importance: 0.9, // Muy importante
  emotionalArousal: 0.8, // Alta intensidad emocional
  emotionalValence: -0.3, // Ligeramente negativo (secreto preocupante)
  dominantEmotion: 'concern',

  // Contexto adicional
  location: 'Laboratorio, tarde',
  agentEmotions: {
    'agent-1': { concern: 0.8, curiosity: 0.6 },
    'agent-2': { anxiety: 0.7, trust: 0.5 }
  },

  metadata: {
    conversationTopic: 'secretos',
    privacyLevel: 'high'
  }
});
```

### 2. Recuperar Memorias Relevantes

```typescript
const memories = await memoryService.retrieveRelevantEpisodes({
  agentId: 'agent-1',
  query: 'María secreto laboratorio', // Búsqueda semántica
  limit: 5, // Top 5 memorias
  minImportance: 0.5, // Filtrar poco importantes

  // Contexto emocional actual (opcional)
  emotionalContext: {
    currentEmotion: 'concern',
    currentValence: -0.2
  }
});

// Resultado
memories.forEach(({ memory, score, relevanceReason }) => {
  console.log(`[Score: ${score.toFixed(2)}] ${memory.event}`);
  console.log(`  Razón: ${relevanceReason}`);
  console.log(`  Turno: ${memory.turnNumber}`);
  console.log(`  Emoción: ${memory.dominantEmotion}`);
});
```

**Ejemplo de salida:**
```
[Score: 0.89] María me confesó su secreto sobre el incidente del laboratorio
  Razón: alta relevancia, evento muy importante, semánticamente similar
  Turno: 142
  Emoción: concern

[Score: 0.72] Estuvimos investigando en el laboratorio juntos
  Razón: relevante, reciente, semánticamente similar
  Turno: 138
  Emoción: curiosity

[Score: 0.65] María parecía preocupada por algo
  Razón: relevante, emocionalmente similar
  Turno: 135
  Emoción: concern
```

### 3. Consolidar Memorias (Mundos Largos)

```typescript
// Ejecutar periódicamente para mundos con 1000+ turnos
const result = await memoryService.consolidateMemories('agent-1');

console.log(`Consolidadas: ${result.memoriesConsolidated}`);
console.log(`Nuevas creadas: ${result.newMemoriesCreated}`);
```

### 4. Estadísticas de Memoria

```typescript
const stats = await memoryService.getMemoryStats('agent-1');

console.log(`Total memorias: ${stats.totalMemories}`);
console.log(`Consolidadas: ${stats.consolidatedMemories}`);
console.log(`Importancia promedio: ${stats.averageImportance.toFixed(2)}`);
console.log(`Memorias recientes (7d): ${stats.recentMemories}`);
```

## Integración Automática

### Guardar Automático en Simulación

El sistema guarda automáticamente episodios importantes durante la simulación. Criterios:

#### ✅ Se Guarda Automáticamente:

1. **Eventos emergentes** (siempre)
   - Bump-into scenes
   - Interrupciones
   - Coincidencias narrativas

2. **Alta importancia** (importance > 0.7)
   - Momentos clave de la historia
   - Inicio y final de actos narrativos
   - Eventos con alto impacto

3. **Alto arousal emocional** (arousal > 0.8)
   - Momentos emocionalmente intensos
   - Conflictos fuertes
   - Revelaciones importantes

4. **Interacciones sociales significativas**
   - Múltiples agentes involucrados (2+)
   - Importancia moderada (> 0.5)
   - Menciones explícitas de otros agentes

#### ❌ No Se Guarda:

- Interacciones triviales (importance < 0.5)
- Bajo arousal emocional (< 0.5)
- Conversación genérica sin menciones

### Retrieval Automático en Contexto

Las memorias se recuperan automáticamente cuando un agente va a hablar:

```typescript
// En simulation-engine.ts - buildGroupContextPrompt()

=== MEMORIAS RELEVANTES ===

- (Turno 142, hace 23 turnos): María me confesó su secreto sobre el incidente [concern]
- (Turno 138, hace 27 turnos): Estuvimos investigando en el laboratorio juntos [curiosity]
- (Turno 120, hace 45 turnos): El día que llegó el nuevo médico al pueblo [interest]
```

## Ejemplos de Episodios

### Ejemplo 1: Confesión Emocional
```typescript
{
  event: "María me confesó que tiene miedo de perderse y no encontrar su camino de regreso",
  turnNumber: 142,
  involvedAgentIds: ['maria-id'],
  importance: 0.95, // Muy importante
  emotionalArousal: 0.85, // Alta intensidad
  emotionalValence: -0.4, // Negativo (miedo)
  dominantEmotion: 'fear',
  location: 'Bosque, cerca del lago',
}
```

### Ejemplo 2: Momento Divertido
```typescript
{
  event: "Carlos y yo nos reímos tanto que casi caemos de la silla cuando intentó imitar al profesor",
  turnNumber: 89,
  involvedAgentIds: ['carlos-id'],
  importance: 0.65, // Moderadamente importante
  emotionalArousal: 0.75, // Intensidad alta
  emotionalValence: 0.8, // Muy positivo (alegría)
  dominantEmotion: 'joy',
  location: 'Cafetería escolar',
}
```

### Ejemplo 3: Conflicto
```typescript
{
  event: "Tuve una discusión acalorada con Daniela sobre sus decisiones irresponsables",
  turnNumber: 201,
  involvedAgentIds: ['daniela-id'],
  importance: 0.80, // Importante
  emotionalArousal: 0.90, // Muy intenso
  emotionalValence: -0.6, // Negativo (enojo)
  dominantEmotion: 'anger',
  location: 'Oficina del director',
}
```

### Ejemplo 4: Evento Consolidado
```typescript
{
  event: "Serie de eventos (turnos 45-52): Clases normales con el grupo; Almorzamos juntos como siempre; Conversación casual sobre el fin de semana",
  summary: "Rutina escolar regular durante una semana tranquila",
  turnNumber: 45,
  involvedAgentIds: ['carlos-id', 'maria-id', 'daniela-id'],
  importance: 0.35, // Baja (consolidado)
  emotionalArousal: 0.40,
  emotionalValence: 0.2, // Ligeramente positivo
  isConsolidated: true,
  consolidatedFrom: ['mem-1', 'mem-2', 'mem-3', 'mem-4'],
}
```

## Performance y Optimizaciones

### Estrategias de Performance

1. **Límite de Memorias en Contexto**
   - Máximo 3-5 memorias por prompt
   - Evita saturar el contexto del LLM
   - Selecciona solo las más relevantes

2. **Pre-filtrado en DB**
   - Filtro por `minImportance` antes de scoring
   - Ordenamiento por importance + createdAt
   - LIMIT 50 antes de processing

3. **Batch Operations**
   - `updateMany` para actualizar accessCount
   - Consolidación en batch
   - Índices optimizados en Prisma

4. **Caching (Futuro)**
   - Redis para memorias frecuentemente accedidas
   - Invalidación basada en nuevos eventos
   - TTL configurable

### Índices de Base de Datos

```prisma
@@index([worldId, agentId])  // Búsqueda por agente en mundo
@@index([worldId, turnNumber]) // Consultas temporales
@@index([importance])          // Filtrado por importancia
@@index([emotionalArousal])    // Eventos intensos
@@index([createdAt])           // Orden temporal
@@index([lastAccessed])        // Tracking de acceso
```

## Mantenimiento y Limpieza

### Consolidación Periódica

**Recomendación**: Ejecutar cada 500-1000 turnos

```typescript
// Ejemplo: En un cron job o al final de sesiones largas
if (world.simulationState.totalInteractions % 500 === 0) {
  for (const agent of activeAgents) {
    await memoryService.consolidateMemories(agent.id);
  }
}
```

### Limpieza de Memorias Antiguas

Para mundos muy largos (5000+ turnos), considerar:

```typescript
// Eliminar memorias consolidadas de muy baja importancia y muy antiguas
await prisma.worldEpisodicMemory.deleteMany({
  where: {
    worldId,
    isConsolidated: true,
    importance: { lt: 0.3 },
    createdAt: {
      lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 días
    }
  }
});
```

## Casos de Uso Narrativos

### 1. Referencias a Eventos Pasados

**Turno 200:**
```
Carlos: "¿Recuerdan aquella vez en el laboratorio cuando María nos contó su secreto?"
```

El sistema permite que Carlos haga referencias coherentes a eventos que ocurrieron 50+ turnos atrás.

### 2. Evolución de Relaciones

**Turno 50:** Primera interacción
```
event: "Conocí a María hoy, parece tímida"
importance: 0.5
emotionalValence: 0.1
```

**Turno 150:** Amistad desarrollada
```
event: "María y yo nos quedamos hablando hasta tarde sobre nuestros sueños"
importance: 0.8
emotionalValence: 0.7
```

**Turno 300:** Vínculo profundo
```
event: "María me confesó que me considera su mejor amiga"
importance: 0.95
emotionalValence: 0.9
```

### 3. Arcos Narrativos Largos

El sistema permite que los agentes recuerden:
- **Inicio del arco**: "El día que llegó el misterioso profesor"
- **Desarrollo**: "Cuando descubrimos su secreto"
- **Climax**: "La confrontación final en la biblioteca"
- **Resolución**: "Todo volvió a la normalidad, pero ya no éramos los mismos"

## Testing

### Ejecutar Tests

```bash
npm test -- world-agent-memory.test.ts
```

### Tests Incluidos

1. **saveEpisode**: Guardar episodios con embeddings
2. **retrieveRelevantEpisodes**: Búsqueda semántica y keyword
3. **consolidateMemories**: Consolidación de memorias
4. **getMemoryStats**: Estadísticas correctas
5. **shouldSaveEpisode**: Lógica de criterios

## Roadmap Futuro

### Fase 1 (Actual) ✅
- [x] Modelo de datos WorldEpisodicMemory
- [x] Servicio básico de save/retrieve
- [x] Integración con simulation-engine
- [x] Búsqueda semántica con embeddings
- [x] Decay temporal y consolidación

### Fase 2 (Próxima)
- [ ] Migrar embeddings a pgvector (más eficiente)
- [ ] Clustering semántico avanzado
- [ ] Resúmenes inteligentes con LLM
- [ ] Memoria compartida entre agentes

### Fase 3 (Futura)
- [ ] Visualización de timeline de memorias
- [ ] Exportar memoria como historia
- [ ] Análisis de arcos narrativos
- [ ] Memoria emocional diferenciada

## Soporte

Para preguntas o issues:
1. Revisa la documentación de `lib/worlds/world-agent-memory.service.ts`
2. Consulta los tests en `__tests__/lib/worlds/world-agent-memory.test.ts`
3. Revisa el código de integración en `lib/worlds/simulation-engine.ts`

## Licencia

Parte del sistema Circuit Prompt AI - 2025
