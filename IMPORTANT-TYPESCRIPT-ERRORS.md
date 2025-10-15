# TypeScript Errors - Análisis y Plan de Corrección

**Fecha:** 2025-10-15
**Rama:** feature/chat-improvements-complete
**Total de errores:** 59

## Resumen por Categoría

### 1. **NextAuth Import Errors** (6 errores)
**Archivos afectados:**
- `app/api/agents/[id]/message-multimodal/route.ts`
- `app/api/agents/[id]/upload/audio/route.ts`
- `app/api/visual/fastsd/install/route.ts`
- `app/api/visual/fastsd/server/route.ts`
- `app/api/chat/voice/route.ts`

**Problema:**
- `getServerSession` no se exporta como named export en next-auth
- `authOptions` no existe en los archivos de lib

**Solución:**
```typescript
// Antes:
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Después:
import { auth } from "@/auth" // o el método correcto según tu configuración
```

---

### 2. **Módulos Faltantes** (6 errores)
**Archivos afectados:**
- `app/api/agents/[id]/message-multimodal/route.ts`
- `lib/socket/chat-events.ts`

**Módulos que faltan:**
- `@/lib/emotional-system/analyzer`
- `@/lib/voice-system/voice-service`
- `@/auth`

**Solución:** Crear estos módulos o corregir las rutas de import

---

### 3. **InternalState Model Properties** (10 errores)
**Archivos afectados:**
- `lib/emotional-system/modules/response/generator.ts`
- `lib/emotional-system/orchestrator.ts`

**Problema:** El modelo Prisma `InternalState` no tiene estas propiedades:
- `moodValence`
- `moodArousal`
- `moodDominance`
- `emotionDecayRate`
- `emotionInertia`

**Causa:** El schema de Prisma SÍ tiene estos campos, pero el cliente generado no los reconoce. Posible problema de regeneración.

**Solución:**
1. Verificar que el schema tenga los campos
2. Regenerar el cliente Prisma: `npx prisma generate`
3. Si persiste, revisar el tipo `InternalState` importado

---

### 4. **Prisma Model Issues** (8 errores)
**Archivos afectados:**
- `app/api/agents/[id]/message-multimodal/route.ts`
- `lib/socket/chat-events.ts`

**Problemas:**
- `emotionalState` no existe en `AgentInclude`
- `characterAppearance` no existe en el tipo Agent
- `conversation` no existe en PrismaClient
- `conversationId` no existe en Message
- `readAt` no existe en Message

**Solución:**
- Eliminar referencias a `conversation` (no existe en schema)
- Usar `agentId` y `worldId` en lugar de `conversationId`
- Agregar `readAt` al modelo Message si es necesario, o eliminarlo del código

---

### 5. **EmotionState Properties** (4 errores)
**Archivos afectados:**
- `lib/emotional-system/modules/response/behavioral-cues.ts`

**Problema:** Property `sadness` no existe en `EmotionState`

**Solución:** Verificar el tipo `EmotionState` y agregar `sadness` o usar la propiedad correcta

---

### 6. **JSON Type Casting** (6 errores)
**Archivos afectados:**
- `lib/emotional-system/modules/growth/character-growth.ts`
- `lib/emotional-system/modules/memory/retrieval.ts`
- `lib/emotional-system/utils/initialization.ts`

**Problema:** Prisma JSON types no aceptan `null` directo o arrays sin casting

**Solución:**
```typescript
// Antes:
conflictHistory: null

// Después:
conflictHistory: Prisma.JsonNull

// Para arrays:
coreValues: coreValues as unknown as Prisma.InputJsonValue
```

---

### 7. **Voice System Types** (5 errores)
**Archivos afectados:**
- `app/api/chat/voice/route.ts`
- `scripts/test-voice-system.ts`
- `lib/voice-system/whisper-client.ts`

**Problema:**
- `EmotionalVoiceModulation` requiere `stability` y `similarity_boost`
- `internalReasoning` no existe en el resultado
- Buffer type incompatible con BlobPart

**Solución:**
- Agregar campos faltantes a `EmotionalVoiceModulation`
- Eliminar referencias a `internalReasoning` o agregarlo al tipo de retorno
- Usar `new Uint8Array(buffer)` en lugar de Buffer directo

---

### 8. **Otros Errores Misceláneos** (14 errores)

#### a) `lib/emotional-system/modules/response/generator.ts:256`
**Problema:** Falta propiedad `be_silent` en ActionType

**Solución:** Agregar `be_silent: string` al objeto

#### b) `lib/emotional-system/utils/initialization.ts:331`
**Problema:** `"neutral"` no es válido para gender, espera `"male" | "female" | "non-binary"`

**Solución:** Mapear `"neutral"` a `"non-binary"` o cambiar el tipo

#### c) `lib/llm/provider.ts:46,102`
**Problema:**
- `model` no existe en `LLMProvider`
- `text` puede ser undefined

**Solución:**
```typescript
// Agregar verificación
if (!text) throw new Error("No text returned")
```

#### d) `lib/mercadopago/subscription.ts:63`
**Problema:** `notification_url` no existe en `PreApprovalRequest`

**Solución:** Verificar la documentación de Mercado Pago SDK o eliminar

#### e) `lib/socket/chat-events.ts:334`
**Problema:** `string | null` no asignable a `string | string[]`

**Solución:**
```typescript
socket.join(roomId ?? "")
```

#### f) `lib/socket/server.ts:101,104`
**Problema:** `SocketServer | null` no asignable

**Solución:**
```typescript
if (!socketServer) throw new Error("Socket server not initialized")
```

---

## Plan de Corrección (Orden Recomendado)

### Fase 1: Infraestructura (Crítico)
1. ✅ Regenerar Prisma Client
2. ⬜ Verificar y corregir imports de NextAuth
3. ⬜ Crear módulos faltantes o corregir rutas

### Fase 2: Sistema Emocional
4. ⬜ Fix InternalState properties (verificar regeneración Prisma)
5. ⬜ Fix EmotionState sadness property
6. ⬜ Fix JSON type casting issues
7. ⬜ Fix ActionType be_silent

### Fase 3: Prisma Models
8. ⬜ Eliminar referencias a `conversation`
9. ⬜ Cambiar `conversationId` por `agentId`/`worldId`
10. ⬜ Eliminar `readAt` o agregarlo al schema
11. ⬜ Fix characterAppearance include

### Fase 4: Voice System
12. ⬜ Fix EmotionalVoiceModulation type
13. ⬜ Fix internalReasoning references
14. ⬜ Fix Buffer to BlobPart conversion

### Fase 5: Limpieza Final
15. ⬜ Fix LLM provider issues
16. ⬜ Fix MercadoPago type
17. ⬜ Fix Socket null checks
18. ⬜ Fix gender type mapping

---

## Notas Importantes

- **NO** borrar código sin verificar primero si es usado
- **SÍ** agregar campos faltantes al schema de Prisma si son necesarios
- **SIEMPRE** regenerar el cliente Prisma después de cambios en schema
- Los archivos en `scripts/` son de testing, pueden tener menos prioridad
- Los errores de `local-ai-server` fueron excluidos del tsconfig

---

## Estado Actual

- ✅ PostgreSQL instalado y corriendo
- ✅ Base de datos creada
- ✅ Modelo Reaction agregado al schema
- ✅ Migraciones aplicadas
- ✅ Prisma Client generado
- ⬜ Errores TypeScript corregidos (0/59)

---

**Próximo paso:** Comenzar con Fase 1 - Regenerar Prisma Client y verificar tipos
