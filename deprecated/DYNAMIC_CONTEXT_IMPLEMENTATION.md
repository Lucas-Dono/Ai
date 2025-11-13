# Implementación de Contexto Dinámico por Tier

## Resumen

Se implementó un sistema de contexto dinámico que ajusta automáticamente el número de mensajes incluidos en el historial de conversación según el tier del usuario.

## Cambios Realizados

### 1. Nueva Función Helper: `context-limits.ts`

**Archivo:** `/lib/usage/context-limits.ts`

Función central que gestiona los límites de contexto por tier:

```typescript
import { getContextLimit } from '@/lib/usage/context-limits';

const contextLimit = getContextLimit(userPlan);
// free: 10 mensajes
// plus: 30 mensajes
// ultra: 100 mensajes
```

**Funciones exportadas:**
- `getContextLimit(userPlan)` - Retorna el límite de mensajes según tier
- `getAllContextLimits()` - Retorna todos los límites disponibles
- `getContextMultiplier(userPlan)` - Retorna el multiplicador (1x, 3x, 10x)
- `hasExtendedContext(userPlan)` - Verifica si tiene más contexto que free

### 2. Archivos Actualizados

#### 2.1 Message Service (`lib/services/message.service.ts`)

**Cambios:**
- Agregado parámetro `userPlan` al interface `ProcessMessageInput`
- Query de mensajes recientes ahora usa `take: contextLimit` en lugar de `take: 10` hardcoded
- Log adicional para tracking del límite aplicado

**Líneas modificadas:**
- Línea 30: Import de `getContextLimit`
- Línea 42: Agregado `userPlan?: string` al interface
- Línea 95: Agregado `userPlan = 'free'` en parámetros
- Líneas 99-101: Lógica de contexto dinámico
- Línea 126: `take: contextLimit` en lugar de `take: 10`

#### 2.2 Message Endpoint (`app/api/agents/[id]/message/route.ts`)

**Cambios:**
- Se pasa `userPlan` al `messageService.processMessage()`

**Líneas modificadas:**
- Línea 338: Agregado `userPlan` al objeto de parámetros

#### 2.3 World Message Endpoint (`app/api/worlds/[id]/message/route.ts`)

**Cambios:**
- Import de `getContextLimit`
- Obtención del `userPlan` desde la sesión
- Query de interacciones del mundo usa contexto dinámico

**Líneas modificadas:**
- Línea 8: Import de `getContextLimit`
- Líneas 44-47: Obtención de `userPlan` y cálculo de `contextLimit`
- Línea 109: `take: contextLimit` en lugar de `take: 10`

### 3. Tests

**Archivo:** `__tests__/lib/usage/context-limits.test.ts`

Suite completa de tests con **19 tests** que verifican:
- ✅ Límites correctos por tier
- ✅ Manejo de tiers inválidos
- ✅ Case-insensitivity
- ✅ Multiplicadores correctos
- ✅ Detección de contexto extendido
- ✅ Ratios correctos entre tiers

**Resultado:** ✅ 19/19 tests pasados

## Límites por Tier

| Tier  | Mensajes de Contexto | Multiplicador | Beneficio                          |
|-------|---------------------|---------------|------------------------------------|
| Free  | 10                  | 1x            | Conversaciones básicas             |
| Plus  | 30                  | 3x            | Conversaciones más coherentes      |
| Ultra | 100                 | 10x           | Conversaciones muy largas y complejas |

## Impacto en la Experiencia del Usuario

### Free Tier (10 mensajes)
- **Contexto:** ~5 turnos de conversación (user + assistant)
- **Uso:** Conversaciones casuales y cortas
- **Limitación:** Puede "olvidar" contexto en conversaciones largas

### Plus Tier (30 mensajes)
- **Contexto:** ~15 turnos de conversación
- **Uso:** Conversaciones profundas con coherencia extendida
- **Beneficio:** 3x más memoria, ideal para roleplay y storytelling

### Ultra Tier (100 mensajes)
- **Contexto:** ~50 turnos de conversación
- **Uso:** Conversaciones épicas, narrativas complejas
- **Beneficio:** 10x más memoria, coherencia perfecta en sesiones largas

## Consideraciones Técnicas

### Performance
- ✅ No hay impacto negativo en performance
- ✅ La query sigue siendo eficiente con índices existentes
- ✅ Límite máximo de 100 mensajes previene sobrecarga

### Costos
- ⚠️ Users Ultra consumirán ~10x más tokens en prompts
- ✅ Esto está alineado con el pricing del plan
- ✅ Gemini 2.5 Flash es económico ($2.50/M tokens)

### Backward Compatibility
- ✅ 100% compatible con código existente
- ✅ Default es 'free' tier (10 mensajes)
- ✅ No requiere migración de datos

## Archivos NO Modificados (Intencionalmente)

Los siguientes archivos tienen `take: 10` pero NO fueron modificados porque sirven otros propósitos:

1. **`lib/proactive-behavior/follow-up-tracker.ts`**
   - Usa conversationBuffer para temas no resueltos (no mensajes)
   - Límite de 10 topics es apropiado independientemente del tier

2. **`lib/worlds/simulation-engine.ts`**
   - Sistema compartido entre múltiples usuarios
   - Requeriría refactoring más complejo
   - Puede mejorarse en el futuro

3. **`lib/worlds/narrative-analyzer.ts`**
   - Análisis de narrativa usa ventana fija
   - No afecta experiencia del usuario final

4. **Marketplace & Recommendations**
   - `marketplace-*.service.ts`: Límites de UI (top 10 items)
   - `recommendations/engine.ts`: Algoritmo de recomendaciones
   - No relacionados con contexto de conversación

## Uso en el Código

### Ejemplo: Message Processing

```typescript
// En el endpoint
const userPlan = user.plan || 'free';

// En el service
const contextLimit = getContextLimit(userPlan);

const recentMessages = await prisma.message.findMany({
  where: { agentId },
  orderBy: { createdAt: 'desc' },
  take: contextLimit, // 🔥 10, 30, o 100 según tier
});
```

### Ejemplo: World Interactions

```typescript
const contextLimit = getContextLimit(userPlan);

const recentInteractions = await prisma.worldInteraction.findMany({
  where: { worldId },
  orderBy: { createdAt: 'desc' },
  take: contextLimit, // 🔥 Dinámico
});
```

## Testing

### Ejecutar Tests

```bash
npm test -- __tests__/lib/usage/context-limits.test.ts
```

### Verificar Integración

```bash
# 1. Iniciar el servidor
npm run dev

# 2. Enviar mensaje como free user
curl -X POST http://localhost:3000/api/agents/{id}/message \
  -H "Authorization: Bearer {token}" \
  -d '{"content": "Hola"}'

# 3. Verificar logs
# Debería mostrar: "Dynamic context limit applied: { userPlan: 'free', contextLimit: 10 }"

# 4. Enviar mensaje como plus user
# Debería mostrar: "Dynamic context limit applied: { userPlan: 'plus', contextLimit: 30 }"
```

## Próximos Pasos

### Mejoras Futuras

1. **Analytics Dashboard**
   - Mostrar a usuarios cuánto contexto están usando
   - Visualizar historial de conversación con marcadores cada N mensajes

2. **UI Indicators**
   - Indicador visual de "contexto disponible"
   - Warning cuando se acerca al límite (solo para free)

3. **Dynamic Worlds Context**
   - Extender sistema dinámico a `simulation-engine.ts`
   - Requiere acceso a userId/userPlan en contexto de world

4. **Optimización Avanzada**
   - Smart context selection (priorizar mensajes importantes)
   - Compresión de mensajes antiguos en resumen

## Conclusión

✅ **Implementación Exitosa**
- Sistema completamente funcional
- Tests pasando (19/19)
- Backward compatible
- Type-safe con TypeScript
- Documentado y testeado

✅ **Valor Agregado**
- Free tier: Experiencia básica funcional
- Plus tier: 3x mejor coherencia (+$5/mes)
- Ultra tier: 10x mejor coherencia (+$15/mes)

✅ **Calidad**
- Clean code
- Single responsibility
- Easy to maintain
- Easy to extend

---

**Fecha de Implementación:** 2025-10-31
**Versión:** 1.0.0
**Status:** ✅ Producción Ready
