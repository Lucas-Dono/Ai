# Sistema de Eventos Aplicados - Guía Completa

## Descripción General

El sistema de eventos aplicados permite que los eventos emergentes tengan **impacto real y persistente** en los agentes de un mundo. Los agentes ahora tienen:

- **Estado físico**: health (salud), energy (energía)
- **Estado emocional persistente**: efectos con duración y decay
- **Relaciones**: alianzas, conflictos, reconciliaciones
- **Capacidades**: skills que se aprenden, mejoran u olvidan
- **Inventario**: items que se obtienen, pierden o usan

## Arquitectura

```
Evento Emergente → EventApplicationService → Estado Persistente → Afecta Comportamiento
```

### Componentes Principales

1. **event-types.ts**: Definiciones de tipos de eventos (32 tipos)
2. **event-application.service.ts**: Servicio que aplica eventos a agentes
3. **emergent-events.ts**: Generador de eventos con integración de estado
4. **simulation-engine.ts**: Motor que incluye estado en el contexto del agente
5. **schema.prisma**: Modelo WorldAgent extendido con campos de estado

## Tipos de Eventos Soportados

### 1. HEALTH (Salud)
- `ILLNESS`: Enfermedad (gripe, resfriado)
- `INJURY`: Lesión física
- `RECOVERY`: Recuperación
- `EXHAUSTION`: Agotamiento extremo
- `ENERGIZED`: Energía renovada

### 2. EMOTION (Emocionales)
- `TRAUMA`: Trauma psicológico (30 días con decay)
- `HAPPINESS`: Felicidad prolongada (7 días)
- `DEPRESSION`: Depresión (14 días)
- `ANXIETY`: Ansiedad (7 días)
- `RELIEF`: Alivio emocional (3 días)
- `INFATUATION`: Enamoramiento (14 días)
- `HEARTBREAK`: Ruptura amorosa (21 días)
- `GRIEF`: Duelo (30 días)

### 3. RELATIONSHIP (Relaciones)
- `CONFLICT`: Conflicto con otro agente
- `ALLIANCE`: Alianza formada
- `BETRAYAL`: Traición
- `RECONCILIATION`: Reconciliación

### 4. SKILL (Habilidades)
- `SKILL_LEARNED`: Aprendió nueva skill
- `SKILL_IMPROVED`: Mejoró skill existente
- `SKILL_FORGOTTEN`: Olvidó habilidad

### 5. INVENTORY (Inventario)
- `ITEM_ACQUIRED`: Obtuvo item
- `ITEM_LOST`: Perdió item
- `ITEM_USED`: Usó item

### 6. STATUS (Estados especiales)
- `PREGNANCY`: Embarazo (270 días)
- `IMPRISONMENT`: Prisión/arresto
- `TRAVEL`: Viaje
- `PROMOTION`: Promoción/ascenso
- `DEMOTION`: Degradación
- `CURSE`: Maldición (narrativa)
- `BLESSING`: Bendición (narrativa)

## Uso Básico

### 1. Aplicar un Evento Manualmente

```typescript
import { getEventApplicationService } from '@/lib/worlds/event-application.service';
import { EventType } from '@/lib/worlds/event-types';

// Obtener servicio para un mundo
const eventService = getEventApplicationService(worldId);

// Aplicar evento de enfermedad
const result = await eventService.applyEvent({
  worldId: 'world_123',
  agentId: 'agent_456',
  eventType: EventType.ILLNESS,
  eventData: {
    healthDelta: -0.3,  // Reduce 30% health
    energyDelta: -0.4,  // Reduce 40% energy
    duration: 5,        // 5 días
    description: 'María se enfermó con gripe',
  },
  reason: 'Evento narrativo: Epidemia en la escuela',
});

console.log(result);
// {
//   success: true,
//   agentId: 'agent_456',
//   eventType: 'ILLNESS',
//   stateChanges: {
//     health: { before: 1.0, after: 0.7 },
//     energy: { before: 1.0, after: 0.6 },
//     effectsAdded: [...]
//   },
//   message: 'El agente está enfermo. Efectos aplicados: 1',
//   timestamp: 2025-10-31T...
// }
```

### 2. Aplicar Evento de Skill

```typescript
// Agente aprende una nueva habilidad
await eventService.applyEvent({
  worldId: 'world_123',
  agentId: 'agent_456',
  eventType: EventType.SKILL_LEARNED,
  eventData: {
    skillName: 'Programación',
    skillLevel: 20,  // Nivel inicial
    category: 'intellectual',
    description: 'Aprendió a programar en Python',
  },
  reason: 'Completó curso de programación',
});
```

### 3. Aplicar Evento de Relación

```typescript
// Conflicto entre dos agentes
await eventService.applyEvent({
  worldId: 'world_123',
  agentId: 'agent_456',
  eventType: EventType.CONFLICT,
  eventData: {
    targetAgentId: 'agent_789',
    relationshipDelta: -0.3,  // Reduce trust/affinity 30%
    description: 'Discutió fuertemente con John',
  },
  reason: 'Desacuerdo sobre proyecto',
});
```

### 4. Aplicar Evento de Inventario

```typescript
// Agente obtiene un item
await eventService.applyEvent({
  worldId: 'world_123',
  agentId: 'agent_456',
  eventType: EventType.ITEM_ACQUIRED,
  eventData: {
    itemName: 'Espada mágica',
    quantity: 1,
    category: 'weapon',
    description: 'Encontró una espada mágica en el bosque',
  },
  reason: 'Exploración del bosque',
});
```

## Integración con Eventos Emergentes

Los eventos emergentes pueden tener efectos automáticos en los agentes:

```typescript
// En emergent-events.ts - definir template con efectos
{
  type: 'surprise',
  name: 'Accidente en el Laboratorio',
  description: 'Explosión en el laboratorio de química',
  requiredConditions: {
    narrativeMetrics: {
      maxRepetition: 0.6,
    },
  },
  involvedCharactersCount: 2,
  prompt: `Ha ocurrido un accidente en el laboratorio...`,
  priority: 0.8,
  // ✨ EFECTOS DE ESTADO
  stateEffects: {
    eventType: EventType.INJURY,
    applyToAll: true,  // Aplica a todos los involucrados
  },
}
```

Cuando este evento se dispara, automáticamente:
1. Se genera el evento narrativo
2. Se aplica `INJURY` a todos los agentes involucrados
3. Los agentes quedan con health y energy reducidos
4. El efecto persiste por 10 días (default de INJURY)
5. Su comportamiento cambia según su estado

## Consultar Estado de Agentes

### Obtener Efectos Activos

```typescript
const activeEffects = await eventService.getActiveEffects('agent_456');

console.log(activeEffects);
// [
//   {
//     type: 'ILLNESS',
//     severity: 0.6,
//     duration: 5,
//     appliedAt: Date,
//     expiresAt: Date,
//     metadata: { description: 'Enfermo con gripe' }
//   }
// ]
```

### Obtener Descripción Narrativa del Estado

```typescript
const description = await eventService.getAgentStateDescription('agent_456');

console.log(description);
// "María - salud débil (70%), algo cansada (60% energía), está enferma,
//  habilidades: Programación (nivel 20), 3 items en inventario."
```

## Sistema de Duración y Decay

### Efectos Temporales

Los efectos tienen duración en días:

```typescript
duration: 5  // Expira en 5 días
```

### Efectos Permanentes

```typescript
duration: null  // Nunca expira (ej: skills aprendidas)
```

### Decay Gradual

Algunos efectos (trauma, grief) decaen gradualmente:

```typescript
{
  type: EventType.TRAUMA,
  severity: 0.9,
  duration: 30,  // 30 días
  decay: {
    enabled: true,
    rate: 1/30,  // Decae linealmente a 0 en 30 días
    currentSeverity: 0.9  // Va disminuyendo cada turno
  }
}
```

## Mantenimiento de Efectos

### Remover Efectos Expirados

```typescript
// Remover automáticamente efectos que ya expiraron
const removed = await eventService.removeExpiredEffects('agent_456');

console.log(removed);
// ['ILLNESS', 'EXHAUSTION'] - tipos de efectos removidos
```

### Aplicar Decay

```typescript
// Aplicar decay a todos los efectos con decay habilitado
await eventService.applyDecayToEffects('agent_456');
```

## Impacto en Comportamiento

El estado del agente se incluye automáticamente en el prompt durante simulación:

```
=== TU ESTADO ACTUAL ===
Estado emocional: joy (70%), trust (60%), anticipation (50%)

Estado físico: María - salud débil (70%), algo cansada (60% energía), está enferma.

Efectos activos:
  - Enfermó durante el evento: Epidemia en la escuela (severidad: 60%)
  - Quedó exhausto tras el evento: Estudio nocturno (severidad: 50%)
```

Esto hace que el agente:
- Mencione estar enfermo en sus respuestas
- Hable con menos energía
- No pueda realizar esfuerzos físicos
- Muestre síntomas apropiados

## Validaciones

El sistema incluye validaciones automáticas:

```typescript
// Health y energy siempre en rango [0, 1]
state.health = clamp(state.health + delta, 0, 1);

// Severity en rango [0, 1]
effect.severity = clamp(severity, 0, 1);

// Skills level en rango [0, 100]
skill.level = Math.min(100, skill.level + improvement);
```

## Logging

Todos los eventos se loggean con detalles:

```
[EventApplicationService] INFO: 🎯 Applying event to agent
  worldId: 'world_123'
  agentId: 'agent_456'
  eventType: 'ILLNESS'
  reason: 'Evento narrativo: Epidemia'

[EventApplicationService] INFO: ✅ Event applied successfully
  duration: 8ms
  stateChanges: {
    health: { before: 1.0, after: 0.7 },
    energy: { before: 1.0, after: 0.6 },
    effectsAdded: 1
  }
```

## Performance

- Aplicación de evento: **< 10ms**
- Consulta de efectos: **< 5ms**
- Integración en simulación: **sin overhead perceptible**

## Ejemplos de Flujo Completo

### Ejemplo 1: Enfermedad durante simulación

```
TURNO 1:
- María habla normalmente (health: 1.0, energy: 1.0)

EVENTO EMERGENTE:
- "Epidemia en la escuela"
- Aplica ILLNESS a María

TURNO 2:
- María: "Ugh... no me siento bien. Creo que me estoy enfermando..."
  (health: 0.7, energy: 0.6)

TURNO 3-7:
- María sigue enferma, respuestas más cortas y débiles

TURNO 8:
- Efecto expira automáticamente
- María se recupera gradualmente
```

### Ejemplo 2: Aprendizaje de skill

```
EVENTO:
- María completa curso de programación
- SKILL_LEARNED: "Python" (nivel 20)

SIMULACIÓN:
- María menciona su nueva habilidad en conversaciones
- Puede ayudar a otros con programación
- Su confianza aumenta (energy +10%)

PROGRESIÓN:
- Con práctica, SKILL_IMPROVED aumenta nivel a 40, 60, 80...
```

### Ejemplo 3: Conflicto y reconciliación

```
EVENTO 1: CONFLICT
- María y John discuten
- Relationship delta: -0.3
- trust: 0.8 → 0.5
- affinity: 0.7 → 0.4

SIMULACIÓN (5 turnos):
- Interacciones tensas
- Menciones del conflicto
- Evitar hablar entre sí

EVENTO 2: RECONCILIATION
- Se reconcilian
- Relationship delta: +0.4
- trust: 0.5 → 0.9
- affinity: 0.4 → 0.8
```

## Migración de Base de Datos

### Ejecutar migración

```bash
npx prisma migrate dev --name add_agent_state_system
```

### Migración aplicará:

```prisma
model WorldAgent {
  // ... campos existentes ...

  // Sistema de estado persistente
  health         Float   @default(1.0)
  energy         Float   @default(1.0)
  skills         Json    @default("[]")
  inventory      Json    @default("[]")
  statusEffects  Json    @default("[]")
  lastStateUpdate DateTime?
}
```

### Agentes existentes

Todos los agentes existentes tendrán valores por defecto:
- health: 1.0 (100% salud)
- energy: 1.0 (100% energía)
- skills: [] (sin skills)
- inventory: [] (sin items)
- statusEffects: [] (sin efectos)

## Casos de Uso Avanzados

### Combos de Eventos

```typescript
// Agente exhausto + enfermo = severidad acumulada
await eventService.applyEvent({
  eventType: EventType.EXHAUSTION,
  // ...
});

await eventService.applyEvent({
  eventType: EventType.ILLNESS,
  // ...
});

// Resultado: health muy bajo, energy crítico
// Comportamiento: casi no puede hablar
```

### Eventos Encadenados

```typescript
// Trauma lleva a depresión
await eventService.applyEvent({
  eventType: EventType.TRAUMA,
  eventData: {
    emotionType: 'fear',
    intensity: 0.9,
    duration: 30,
    // ...
  }
});

// Después de unos días...
await eventService.applyEvent({
  eventType: EventType.DEPRESSION,
  // ...
});

// Decay gradual del trauma mientras persiste depresión
```

## Mejores Prácticas

1. **Usar templates**: Para eventos comunes, usar `EVENT_TEMPLATES`
2. **Logging**: Siempre incluir `reason` para trazabilidad
3. **Validar estado**: Verificar que valores estén en rangos correctos
4. **Cleanup**: Remover efectos expirados periódicamente
5. **Balance**: No abrumar con demasiados efectos simultáneos
6. **Narrativa**: Efectos deben tener sentido narrativo

## Troubleshooting

### Efectos no aparecen en simulación

```typescript
// Verificar que el agente tenga efectos activos
const effects = await eventService.getActiveEffects(agentId);
console.log(effects);

// Verificar que no hayan expirado
const now = new Date();
const active = effects.filter(e => !e.expiresAt || e.expiresAt > now);
```

### Estado no se actualiza

```typescript
// Verificar última actualización
const worldAgent = await prisma.worldAgent.findUnique({
  where: { worldId_agentId: { worldId, agentId } }
});
console.log(worldAgent.lastStateUpdate);
```

### Performance issues

```typescript
// Limitar efectos activos por agente
const MAX_EFFECTS = 5;
if (state.statusEffects.length > MAX_EFFECTS) {
  // Remover efectos más antiguos o menos severos
  state.statusEffects = state.statusEffects
    .sort((a, b) => b.severity - a.severity)
    .slice(0, MAX_EFFECTS);
}
```

## Conclusión

El sistema de eventos aplicados transforma eventos emergentes de simples prompts narrativos a **cambios de estado reales y persistentes** que afectan profundamente el comportamiento de los agentes.

Los agentes ahora tienen:
- ✅ Memoria física (salud, energía)
- ✅ Consecuencias duraderas (efectos con duración)
- ✅ Progresión (skills que mejoran)
- ✅ Posesiones (inventario)
- ✅ Relaciones dinámicas (conflictos, alianzas)

Esto crea mundos más **realistas, consistentes e inmersivos**.
