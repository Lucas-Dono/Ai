# World Episodic Memory - Quick Start

Sistema de memoria episódica para mundos virtuales que permite coherencia narrativa de largo plazo (1000+ turnos).

## Instalación

El sistema ya está integrado. Solo necesitas ejecutar la migración de Prisma:

```bash
npx prisma migrate dev --name add-world-episodic-memory
```

## Uso Básico (3 pasos)

### 1. Guardar un episodio

```typescript
import { WorldAgentMemoryService } from '@/lib/worlds/world-agent-memory.service';

const memoryService = new WorldAgentMemoryService(worldId);

await memoryService.saveEpisode({
  agentId: 'agent-1',
  event: 'María me confesó su secreto',
  involvedAgentIds: ['agent-maria'],
  turnNumber: 42,
  importance: 0.9,
  emotionalArousal: 0.8,
  emotionalValence: -0.3,
});
```

### 2. Recuperar memorias

```typescript
const memories = await memoryService.retrieveRelevantEpisodes({
  agentId: 'agent-1',
  query: 'María secreto',
  limit: 5,
});

memories.forEach(({ memory, score }) => {
  console.log(`[${score}] ${memory.event}`);
});
```

### 3. Consolidar (mundos largos)

```typescript
// Ejecutar cada 500-1000 turnos
const result = await memoryService.consolidateMemories('agent-1');
console.log(`Consolidadas: ${result.memoriesConsolidated}`);
```

## Integración Automática

El sistema **ya está integrado** con `simulation-engine.ts`:

✅ **Guarda automáticamente** episodios importantes:
- Eventos emergentes (bump-into, interrupciones)
- Alta importancia (> 0.7)
- Alto arousal emocional (> 0.8)
- Interacciones sociales significativas

✅ **Recupera automáticamente** memorias relevantes en el contexto de cada agente

## Criterios de Importancia

Un episodio se guarda SI:
- `isEmergentEvent === true` (siempre)
- `importance > 0.7` (eventos importantes)
- `emotionalArousal > 0.8` (muy intenso)
- `involvedAgentsCount >= 2 && importance > 0.5` (social)

## Ejemplos de Episodios

### Momento Emocional
```typescript
{
  event: "María lloró en mis brazos y me contó todo sobre su familia",
  importance: 0.95,
  emotionalArousal: 0.90,
  emotionalValence: -0.4,
  dominantEmotion: 'sadness'
}
```

### Momento Divertido
```typescript
{
  event: "Nos reímos tanto que casi caemos de la silla",
  importance: 0.65,
  emotionalArousal: 0.75,
  emotionalValence: 0.8,
  dominantEmotion: 'joy'
}
```

### Conflicto
```typescript
{
  event: "Discusión acalorada con Daniela sobre sus decisiones",
  importance: 0.80,
  emotionalArousal: 0.90,
  emotionalValence: -0.6,
  dominantEmotion: 'anger'
}
```

## Performance

### Límites Recomendados
- **Contexto**: Max 3-5 memorias por prompt
- **Retrieval**: Pre-filtrar con `minImportance >= 0.5`
- **Consolidación**: Cada 500-1000 turnos

### Índices Optimizados
```sql
-- Ya incluidos en schema.prisma
@@index([worldId, agentId])
@@index([importance])
@@index([emotionalArousal])
@@index([createdAt])
```

## Casos de Uso

### 1. Referencias a Eventos Pasados
Los agentes pueden mencionar eventos que ocurrieron 50+ turnos atrás:

```
Carlos: "¿Recuerdan aquella vez cuando María nos contó su secreto?"
```

### 2. Evolución de Relaciones
```
Turno 50:  "Conocí a María hoy" (importance: 0.5)
Turno 150: "María es mi mejor amiga" (importance: 0.8)
Turno 300: "María me confesó que me ama" (importance: 0.95)
```

### 3. Arcos Narrativos
El sistema mantiene coherencia en arcos de 200+ turnos:
- Inicio → Desarrollo → Climax → Resolución

## Archivos Clave

### Código Principal
- `lib/worlds/world-agent-memory.service.ts` - Servicio principal
- `lib/worlds/simulation-engine.ts` - Integración automática
- `prisma/schema.prisma` - Modelo WorldEpisodicMemory

### Documentación
- `docs/WORLD_EPISODIC_MEMORY_SYSTEM.md` - Documentación completa
- `examples/world-episodic-memory-examples.ts` - 8 ejemplos prácticos

### Tests
- `__tests__/lib/worlds/world-agent-memory.test.ts` - Suite de tests

## Testing

```bash
# Ejecutar tests
npm test -- world-agent-memory.test.ts

# Ejecutar ejemplos
ts-node examples/world-episodic-memory-examples.ts
```

## Troubleshooting

### Problema: No se guardan memorias
**Solución**: Verifica que los eventos cumplan los criterios:
```typescript
import { shouldSaveEpisode } from '@/lib/worlds/world-agent-memory.service';

const should = shouldSaveEpisode({
  importance: 0.8,
  emotionalArousal: 0.7,
  involvedAgentsCount: 2,
  isEmergentEvent: false,
});
console.log('¿Debería guardar?', should); // true
```

### Problema: Embeddings fallan
**Solución**: El sistema continúa con keyword matching automáticamente. Revisa logs:
```typescript
log.warn('Failed to generate embedding, using keyword fallback');
```

### Problema: Demasiadas memorias (mundo muy largo)
**Solución**: Ejecutar consolidación manual:
```typescript
const result = await memoryService.consolidateMemories(agentId);
console.log(`Consolidadas: ${result.memoriesConsolidated}`);
```

## Próximos Pasos

1. ✅ **Básico**: Lee la documentación completa en `docs/WORLD_EPISODIC_MEMORY_SYSTEM.md`
2. 🔧 **Intermedio**: Explora los ejemplos en `examples/world-episodic-memory-examples.ts`
3. 🚀 **Avanzado**: Personaliza los criterios de importancia en `shouldSaveEpisode()`

## Migración desde Sistema Anterior

Si tienes un mundo existente sin memoria episódica:

```typescript
// 1. Ejecutar migración de DB
npx prisma migrate dev

// 2. El sistema empezará a guardar memorias automáticamente
// 3. No requiere cambios en código existente
```

## Soporte

- **Documentación completa**: `docs/WORLD_EPISODIC_MEMORY_SYSTEM.md`
- **Ejemplos prácticos**: `examples/world-episodic-memory-examples.ts`
- **Código fuente**: `lib/worlds/world-agent-memory.service.ts`

---

**Creado**: 2025
**Versión**: 1.0.0
**Estado**: ✅ Production Ready
