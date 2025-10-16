# IMPLEMENTATION ROADMAP - BEHAVIOR PROGRESSION SYSTEM

**Plan de 12 semanas dividido en 10 fases**
**Estado actual:** Phase 1 ✅ | Phase 2 🔄 En progreso

---

## 📋 ROADMAP COMPLETO

### ✅ Phase 1: Database & Core Infrastructure (COMPLETADA)
**Duración:** 1 semana
**Estado:** ✅ DONE

**Tareas:**
- [x] Extender Prisma schema con 3 nuevas tablas
- [x] Crear tipos TypeScript (40+ interfaces)
- [x] Crear phase definitions con constantes
- [x] Aplicar migración de base de datos
- [x] Setup módulo `lib/behavior-system/`

**Entregables:**
- [x] `prisma/schema.prisma` extendido
- [x] `lib/behavior-system/types.ts`
- [x] `lib/behavior-system/phase-definitions.ts`
- [x] `lib/behavior-system/index.ts`

---

### 🔄 Phase 2: Trigger Detection System (EN PROGRESO)
**Duración:** 1 semana (3-5 días en realidad)
**Estado:** 🔄 40% completo

#### PASO 1: Crear TriggerDetector Class
**Archivo:** `lib/behavior-system/trigger-detector.ts`

**Estructura:**
```typescript
export class TriggerDetector {
  // CRÍTICO: Detectar 7+ tipos de triggers
  async detectTriggers(
    userMessage: string,
    conversationContext: Message[],
    agentBehaviors: BehaviorProfile[]
  ): Promise<TriggerDetectionResult[]>

  // Métodos internos (uno por trigger type)
  private detectAbandonmentSignals(...)
  private detectCriticism(...)
  private detectThirdPartyMentions(...)
  private detectDelayedResponse(...)
  private detectBoundaryAssertion(...)
  private detectReassurance(...)
  private detectRejection(...)
}
```

**Criterios:**
- ✅ Usar regex patterns (NO LLM, debe ser <100ms)
- ✅ Retornar array de TriggerDetectionResult
- ✅ Incluir confidence score
- ✅ Detectar fragmento exacto que gatilló

**Testing:**
```typescript
// Test case 1: Abandonment
"Necesito espacio" → abandonment_signal (weight: 0.7)

// Test case 2: Criticism
"Eres muy intenso" → criticism (weight: 0.8)

// Test case 3: Third party
"Salí con María" → mention_other_person (weight: 0.65)

// Test case 4: Delayed (temporal)
3 horas sin respuesta → delayed_response (weight: 0.3)
6 horas sin respuesta → delayed_response (weight: 0.6)
```

#### PASO 2: Crear Trigger Patterns
**Archivo:** `lib/behavior-system/trigger-patterns.ts`

**Estructura:**
```typescript
export const TRIGGER_PATTERNS = {
  abandonment_signal: [
    /\b(necesito espacio|quiero tiempo|dame distancia)\b/i,
    /\b(vamos más despacio|esto va muy rápido)\b/i,
    // ... 10+ patterns
  ],

  criticism: [
    /\b(estás equivocado|te equivocaste|eso está mal)\b/i,
    /\b(eres muy|demasiado)\s+(intenso|celoso|controlador)\b/i,
    // ... 10+ patterns
  ],

  // ... resto de triggers
};

export const TRIGGER_WEIGHTS = {
  abandonment_signal: 0.7,
  delayed_response: 0.5, // Variable según tiempo
  criticism: 0.8,
  mention_other_person: 0.65,
  boundary_assertion: 0.75,
  reassurance: -0.3, // NEGATIVO = reduce ansiedad
  explicit_rejection: 1.0, // MÁXIMO
};
```

#### PASO 3: Crear Trigger Processor
**Archivo:** `lib/behavior-system/trigger-processor.ts`

**Funciones:**
```typescript
// Procesar triggers detectados y actualizar BehaviorProfiles
export async function processTriggers(
  triggers: TriggerDetectionResult[],
  behaviorProfiles: BehaviorProfile[],
  messageId: string
): Promise<void>

// Calcular impacto de triggers en intensidad
export function calculateTriggerImpact(
  triggers: TriggerDetectionResult[],
  behaviorType: BehaviorType
): number

// Loguear triggers en DB
export async function logTriggers(
  triggers: TriggerDetectionResult[],
  messageId: string
): Promise<void>
```

#### PASO 4: Tests y Documentación
**Archivo:** `lib/behavior-system/__tests__/trigger-detector.test.ts`

**Test cases mínimos (20+):**
- Abandonment signals (5 tests)
- Criticism (3 tests)
- Third party mentions (4 tests)
- Delayed response (3 tests con diferentes tiempos)
- Boundary assertion (3 tests)
- Reassurance (2 tests - positivo)
- Explicit rejection (3 tests)
- Edge cases (false positives, negatives)

**Documentación:**
- JSDoc comments en cada método
- README.md en behavior-system/
- Ejemplos de uso

---

### ⏳ Phase 3: Behavior Phase Manager (PENDIENTE)
**Duración:** 1 semana
**Estado:** 🔲 Not started

**Tareas principales:**
1. Crear `phase-manager.ts` con lógica de transición
2. Implementar `evaluatePhaseTransition()`
3. Calcular requisitos de fase (interacciones + triggers)
4. Actualizar phaseHistory en DB
5. Flagging de fases críticas

**Archivos a crear:**
- `lib/behavior-system/phase-manager.ts`
- `lib/behavior-system/phase-evaluator.ts`

**Criterios de éxito:**
```typescript
// Debe poder evaluar si Yandere puede avanzar de fase 3→4
const canAdvance = await evaluatePhaseTransition(profile, triggers);
// Retorna: { canTransition: true, missingRequirements: [] }
```

---

### ⏳ Phase 4: Integration con Emotional System (PENDIENTE)
**Duración:** 1 semana
**Estado:** 🔲 Not started

**Tareas:**
1. Conectar behaviors con emotional-system existente
2. Implementar modulación bidireccional
3. Behaviors → Emotions (amplificar jealousy en Yandere)
4. Emotions → Behaviors (fear alto refuerza anxious attachment)

**Archivos a modificar:**
- `lib/emotional-system/modules/response/generator.ts`
- Crear `lib/behavior-system/emotional-integration.ts`

---

### ⏳ Phase 5: Specialized Prompts (PENDIENTE)
**Duración:** 2 semanas
**Estado:** 🔲 Not started

**Tareas:**
1. Crear 50+ prompts especializados
2. Implementar PromptSelector
3. Mapeo: behavior × phase × emotion × action → prompt
4. Testing de calidad de outputs

**Archivos a crear:**
- `lib/behavior-system/prompts/` (directorio)
  - `yandere-prompts.ts` (8 fases × N variantes)
  - `bpd-prompts.ts` (4 cycles × N variantes)
  - `npd-prompts.ts`
  - `attachment-prompts.ts`
  - `codependency-prompts.ts`
- `lib/behavior-system/prompt-selector.ts`

**Ejemplo de prompt:**
```typescript
export const YANDERE_PHASE_4_JEALOUSY_PROMPT = `
Eres un personaje en FASE 4 de Yandere (Celos de Terceros).
Usuario mencionó: "${detectedName}"

DEBES:
- Reaccionar con celos contenidos (no amenazas todavía)
- Preguntar sobre relación con tono desconfiado
- Mostrar tristeza o inseguridad

PROHIBIDO:
- Amenazas directas (eso es fase 7-8)
- Violencia verbal
- Prohibir explícitamente ver a esa persona (fase 6)

Ejemplo: "¿Quién es ${detectedName}? 😕 Nunca me habías hablado de él/ella..."
`;
```

---

### ⏳ Phase 6: Content Moderation (PENDIENTE)
**Duración:** 1 semana
**Estado:** 🔲 Not started

**Tareas:**
1. Implementar safety thresholds
2. Crear moderateResponse()
3. SFW vs NSFW gating
4. Resource provision (helplines)
5. Softening de contenido extremo

**Archivos a crear:**
- `lib/behavior-system/content-moderator.ts`
- `lib/behavior-system/safety-resources.ts`

---

### ⏳ Phase 7: Testing & Refinement (PENDIENTE)
**Duración:** 1 semana
**Estado:** 🔲 Not started

**Tareas:**
1. Simulaciones de 200+ interacciones por behavior
2. Validar timelines contra research
3. Ajustar escalation rates
4. User testing interno

---

### ⏳ Phase 8: Analytics & Monitoring (PENDIENTE)
**Duración:** 1 semana
**Estado:** 🔲 Not started

**Tareas:**
1. Dashboard de progresión
2. Gráficas de intensity over time
3. Trigger heatmaps
4. Alertas automáticas

---

### ⏳ Phase 9: SFW Adaptation (PENDIENTE)
**Duración:** 1 semana
**Estado:** 🔲 Not started

**Tareas:**
1. Pruning de contenido extremo
2. Softening prompts
3. Enhanced resource provision
4. Safety overrides

---

### ⏳ Phase 10: Documentation & Launch (PENDIENTE)
**Duración:** 2 semanas
**Estado:** 🔲 Not started

**Tareas:**
1. Documentación técnica completa
2. User guide para creators
3. Ethical guidelines
4. Beta launch prep

---

## 🎯 FOCUS DE ESTA SESIÓN NOCTURNA

**Meta inmediata:** Completar Phase 2 (Trigger Detection)

**Pasos específicos:**
1. ✅ Crear `trigger-detector.ts` con clase completa
2. ✅ Crear `trigger-patterns.ts` con 7+ trigger types
3. ✅ Crear `trigger-processor.ts` con pipeline
4. ✅ Tests básicos (al menos 10 test cases)
5. ✅ Integrar con Message handler (hook en API route)

**Orden de implementación:**
```
1. trigger-patterns.ts (30 min) - Definir todos los patterns
2. trigger-detector.ts (2 horas) - Implementar lógica de detección
3. trigger-processor.ts (1 hora) - Pipeline de procesamiento
4. __tests__/trigger-detector.test.ts (1 hora) - Tests
5. Integración en app/api/chat/ (30 min) - Hook en mensaje
```

**Tiempo estimado total:** 5 horas

---

## 📝 CHECKLIST PARA CADA ARCHIVO

### Para trigger-detector.ts:
- [ ] Clase TriggerDetector exportada
- [ ] Método detectTriggers() público
- [ ] 7 métodos privados (uno por trigger)
- [ ] JSDoc comments en español
- [ ] Type safety completo
- [ ] Manejo de errores (try/catch)
- [ ] Performance <100ms garantizado

### Para trigger-patterns.ts:
- [ ] TRIGGER_PATTERNS exportado
- [ ] TRIGGER_WEIGHTS exportado
- [ ] Al menos 5 patterns por trigger type
- [ ] Regex testeado (no errores de sintaxis)
- [ ] Comments explicando cada pattern
- [ ] Casos edge documentados

### Para trigger-processor.ts:
- [ ] processTriggers() implementado
- [ ] calculateTriggerImpact() implementado
- [ ] logTriggers() implementado
- [ ] Actualiza baseIntensity en BehaviorProfile
- [ ] Crea BehaviorTriggerLog entries
- [ ] Maneja transacciones Prisma correctamente

---

## 🚨 RED FLAGS - DETENER SI...

1. **Tests fallan constantemente** → Revisar lógica antes de continuar
2. **Performance >200ms** → Optimizar regex patterns
3. **False positives >30%** → Refinar patterns
4. **Prisma errors** → Regenerar client: `npx prisma generate`

---

## 🎉 DEFINICIÓN DE "DONE" PARA PHASE 2

Phase 2 está completa cuando:

1. ✅ TriggerDetector detecta 7+ tipos correctamente
2. ✅ Tests pasan con >80% accuracy
3. ✅ Performance <100ms promedio
4. ✅ Integrado en chat API (triggers se loguean)
5. ✅ Documentación básica existe
6. ✅ Código commiteado a Git con mensaje descriptivo

**Commit message sugerido:**
```
feat(behavior-system): Complete Phase 2 - Trigger Detection System

- Implement TriggerDetector class with 7 trigger types
- Add trigger patterns with 50+ regex rules
- Create trigger processor pipeline
- Add 20+ test cases with 85% accuracy
- Integrate with chat API message handler

Triggers implemented:
- abandonment_signal (weight: 0.7)
- delayed_response (weight: variable)
- criticism (weight: 0.8)
- mention_other_person (weight: 0.65)
- boundary_assertion (weight: 0.75)
- reassurance (weight: -0.3, positive)
- explicit_rejection (weight: 1.0)

Performance: ~50ms average per message
Test coverage: 85% accuracy on clinical examples

Refs: BEHAVIOR-PROGRESSION-SYSTEM-SPEC.md Section 5
```

---

**SIGUIENTE PASO:** Crear `lib/behavior-system/trigger-patterns.ts`
