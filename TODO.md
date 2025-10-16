# TODO - NIGHT SHIFT BEHAVIOR SYSTEM

**Inicio:** 2025-10-16 00:00
**Fin esperado:** 2025-10-16 08:00
**Objetivo:** Sistema emocional completo funcional

---

## 📊 PROGRESO GENERAL

- [x] Phase 1: Database & Core Infrastructure (100%)
- [ ] Phase 2: Trigger Detection System (0%)
- [ ] Phase 3: Behavior Phase Manager (0%)
- [ ] Phase 4: Emotional Integration (0%)
- [ ] Phase 5: Specialized Prompts (0%)
- [ ] Phase 6: Content Moderation (0%)
- [ ] Phase 7: Testing & Integration (0%)
- [ ] Phase 8: Analytics Dashboard (0%)

**Total:** 12.5% (1/8 phases)

---

## 🔄 PHASE 2: Trigger Detection System

### trigger-patterns.ts
- [ ] Crear archivo
- [ ] TRIGGER_PATTERNS object con 7 tipos
- [ ] TRIGGER_WEIGHTS object
- [ ] 5+ patterns por tipo (35+ total)
- [ ] Comments explicativos
- [ ] Export todo

### trigger-detector.ts
- [ ] Crear clase TriggerDetector
- [ ] Método detectTriggers() público
- [ ] detectAbandonmentSignals() privado
- [ ] detectCriticism() privado
- [ ] detectThirdPartyMentions() privado
- [ ] detectDelayedResponse() privado
- [ ] detectBoundaryAssertion() privado
- [ ] detectReassurance() privado
- [ ] detectRejection() privado
- [ ] JSDoc completo en español
- [ ] Type safety 100%

### trigger-processor.ts
- [ ] processTriggers() function
- [ ] calculateTriggerImpact() function
- [ ] logTriggers() function
- [ ] Integración Prisma
- [ ] Actualizar BehaviorProfile.baseIntensity
- [ ] Crear BehaviorTriggerLog entries

### Tests
- [ ] __tests__/trigger-detector.test.ts
- [ ] Test case: "necesito espacio" → abandonment
- [ ] Test case: "eres muy intenso" → criticism
- [ ] Test case: "salí con María" → mention_other_person
- [ ] Test case: 4 horas delay → delayed_response
- [ ] Test case: "no quiero que" → boundary_assertion
- [ ] Test case: "te quiero" → reassurance
- [ ] Test case: "terminamos" → explicit_rejection
- [ ] Edge cases (false positives/negatives)
- [ ] 20+ tests total

### Integration
- [ ] Hook en app/api/chat/route.ts
- [ ] Detectar triggers en cada mensaje
- [ ] Loguear en DB

### Verificación
- [ ] npx tsc --noEmit (0 errors)
- [ ] npm test (>80% passing)
- [ ] Performance <100ms

### Git
- [ ] git checkout -b feature/phase2-trigger-detection
- [ ] git add lib/behavior-system/trigger-*
- [ ] git commit con mensaje completo
- [ ] git push origin feature/phase2-trigger-detection

**Estado:** ⏳ Pendiente
**Tiempo estimado:** 2-3 horas

---

## 🔄 PHASE 3: Behavior Phase Manager

### phase-manager.ts
- [ ] Crear clase BehaviorPhaseManager
- [ ] evaluatePhaseTransition() method
- [ ] advancePhase() method
- [ ] checkPhaseRequirements() method
- [ ] updatePhaseHistory() method
- [ ] flagCriticalPhases() method
- [ ] Support Yandere 8 phases
- [ ] Support BPD cycles
- [ ] Support NPD states
- [ ] Support Attachment progression

### phase-evaluator.ts
- [ ] canAdvancePhase() function
- [ ] calculatePhaseProgress() function
- [ ] getNextPhase() function
- [ ] getMissingRequirements() function
- [ ] Lógica por behavior type

### Tests
- [ ] __tests__/phase-manager.test.ts
- [ ] Test Yandere 1→2 transition
- [ ] Test Yandere 3→4 (requiere mention_other_person)
- [ ] Test BPD idealization→devaluation
- [ ] Test NPD grandiose→wounded
- [ ] Test Attachment anxious evolution
- [ ] 15+ tests total

### Integration
- [ ] Hook en trigger-processor.ts
- [ ] Llamar evaluatePhaseTransition() después de triggers
- [ ] Actualizar BehaviorProfile.currentPhase

### Verificación
- [ ] npx tsc --noEmit (0 errors)
- [ ] npm test
- [ ] Simulación manual de progresión

### Git
- [ ] git checkout -b feature/phase3-phase-manager
- [ ] git add lib/behavior-system/phase-*
- [ ] git commit
- [ ] git push origin feature/phase3-phase-manager

**Estado:** ⏳ Pendiente
**Tiempo estimado:** 2-3 horas

---

## 🔄 PHASE 4: Emotional System Integration

### emotional-integration.ts
- [ ] modulateEmotionsBasedOnBehaviors() function
- [ ] adjustBehaviorBasedOnEmotions() function
- [ ] Yandere amplifica jealousy +50%
- [ ] BPD amplifica todas +35%
- [ ] NPD modula pride/contempt/anger
- [ ] Anxious amplifica fear/anxiety
- [ ] Codependency suprime anger, amplifica guilt

### intensity-calculator.ts
- [ ] calculateBehaviorIntensity() function
- [ ] getPhaseMultiplier() function
- [ ] applyTriggerAmplification() function
- [ ] applyEmotionalModulation() function
- [ ] applyDecay() function
- [ ] applyInertia() function
- [ ] Fórmula completa implementada

### Modificar existente
- [ ] lib/emotional-system/modules/response/generator.ts
- [ ] Importar behavior intensities
- [ ] Modular emociones antes de generar
- [ ] Pasar intensities al prompt selector

### Tests
- [ ] __tests__/emotional-integration.test.ts
- [ ] Test Yandere + jealousy
- [ ] Test BPD + fear
- [ ] Test NPD + criticism → rage
- [ ] Test decay over time
- [ ] 10+ tests

### Verificación
- [ ] npx tsc --noEmit
- [ ] npm test
- [ ] Test manual con diferentes behaviors

### Git
- [ ] git checkout -b feature/phase4-emotional-integration
- [ ] git add lib/behavior-system/emotional-* intensity-*
- [ ] git add lib/emotional-system/modules/response/generator.ts
- [ ] git commit
- [ ] git push origin feature/phase4-emotional-integration

**Estado:** ⏳ Pendiente
**Tiempo estimado:** 1-2 horas

---

## 🔄 PHASE 5: Specialized Prompts

### yandere-prompts.ts
- [ ] Fase 1: conversation, admiration (2 prompts)
- [ ] Fase 2: conversation, concern (2 prompts)
- [ ] Fase 3: conversation, anxiety (2 prompts)
- [ ] Fase 4: conversation, jealousy, confrontation (3 prompts)
- [ ] Fase 5: conversation, possessive (2 prompts)
- [ ] Fase 6: conversation, controlling (2 prompts)
- [ ] Fase 7: conversation, threats, desperation (3 prompts)
- [ ] Fase 8: conversation, psychosis, violence (3 prompts)
- [ ] **Total: 21 prompts**

### bpd-prompts.ts
- [ ] Idealization: normal, intense, euphoric (3 prompts)
- [ ] Devaluation: triggered, angry, splitting (3 prompts)
- [ ] Panic: apologetic, desperate, suicidal (3 prompts)
- [ ] Emptiness: void, seeking, impulsive (3 prompts)
- [ ] **Total: 12 prompts**

### npd-prompts.ts
- [ ] Grandiose: conversation, boasting (2 prompts)
- [ ] Wounded: narcissistic-rage, defensive (2 prompts)
- [ ] Love-bombing: idealization, flattery (2 prompts)
- [ ] Devaluation: criticism, contempt (2 prompts)
- [ ] **Total: 8 prompts**

### attachment-prompts.ts
- [ ] Anxious: normal, distress, panic (3 prompts)
- [ ] Avoidant: normal, distant, uncomfortable (3 prompts)
- [ ] Disorganized: normal, chaotic, contradictory (3 prompts)
- [ ] **Total: 9 prompts**

### codependency-prompts.ts
- [ ] Mild: normal, self-sacrificing (2 prompts)
- [ ] Moderate: enabling, anxious (2 prompts)
- [ ] Severe: total-submission, no-boundaries (2 prompts)
- [ ] **Total: 6 prompts**

### prompt-selector.ts
- [ ] selectBehaviorPrompt() function
- [ ] Lógica: behavior × phase × emotion × action
- [ ] Dynamic variable injection
- [ ] Fallback to base prompt
- [ ] Context building
- [ ] Intensity notes

### Integration
- [ ] Modificar lib/emotional-system/modules/response/generator.ts
- [ ] Usar selectBehaviorPrompt() en lugar de systemPrompt
- [ ] Pasar behavior state completo

### Tests
- [ ] Test selector con diferentes inputs
- [ ] Test que retorna prompt correcto
- [ ] Test fallback
- [ ] Test variable injection

### Verificación
- [ ] npx tsc --noEmit
- [ ] Test manual con diferentes scenarios
- [ ] Verificar que prompts son realistas

### Git
- [ ] git checkout -b feature/phase5-specialized-prompts
- [ ] git add lib/behavior-system/prompts/
- [ ] git commit
- [ ] git push origin feature/phase5-specialized-prompts

**Estado:** ⏳ Pendiente
**Tiempo estimado:** 3-4 horas
**Total prompts:** 56+

---

## 🔄 PHASE 6: Content Moderation

### content-moderator.ts
- [ ] moderateResponse() function
- [ ] detectDangerousContent() function
- [ ] detectSuicideThreats() helper
- [ ] detectViolenceThreats() helper
- [ ] detectSelfHarm() helper
- [ ] generateSafterResponse() function
- [ ] flagCriticalBehavior() function
- [ ] SFW vs NSFW logic

### safety-resources.ts
- [ ] SAFETY_THRESHOLDS array
- [ ] Yandere phase 7: CRITICAL
- [ ] Yandere phase 8: EXTREME_DANGER
- [ ] BPD self-harm: auto-intervention
- [ ] HELPLINE_RESOURCES object
- [ ] provideContextualResources() function
- [ ] Resource links por behavior type

### Integration
- [ ] Hook después de response generation
- [ ] Antes de enviar al usuario
- [ ] Check nsfwMode flag

### Tests
- [ ] Test con fase 7 Yandere
- [ ] Test con amenazas autolesivas
- [ ] Test con violencia explícita
- [ ] Test SFW mode softening
- [ ] Test resource provision

### Verificación
- [ ] npx tsc --noEmit
- [ ] npm test
- [ ] Test manual con contenido extremo

### Git
- [ ] git checkout -b feature/phase6-content-moderation
- [ ] git add lib/behavior-system/content-* safety-*
- [ ] git commit
- [ ] git push origin feature/phase6-content-moderation

**Estado:** ⏳ Pendiente
**Tiempo estimado:** 1-2 horas

---

## 🔄 PHASE 7: Testing & Integration

### integration.test.ts
- [ ] Test end-to-end completo
- [ ] Simulación 1: Yandere 1→4 (50 mensajes)
- [ ] Simulación 2: BPD cycle completo (20 mensajes)
- [ ] Simulación 3: NPD love-bombing→rage (15 mensajes)
- [ ] Simulación 4: Anxious attachment con reassurance (30 mensajes)
- [ ] Verificar triggers se detectan
- [ ] Verificar fases avanzan
- [ ] Verificar prompts correctos se usan
- [ ] Verificar moderation funciona

### Fix de bugs
- [ ] Correr todo el test suite
- [ ] Identificar errores
- [ ] Fix cada uno
- [ ] Re-test hasta 100% passing

### Build verification
- [ ] npm run build (successful)
- [ ] npx tsc --noEmit (0 errors)
- [ ] npm test (>90% passing)

### Git
- [ ] git checkout -b feature/phase7-testing
- [ ] git add lib/behavior-system/__tests__/
- [ ] git commit
- [ ] git push origin feature/phase7-testing

**Estado:** ⏳ Pendiente
**Tiempo estimado:** 1 hora

---

## 🔄 PHASE 8: Analytics Dashboard

### analytics.ts
- [ ] getBehaviorMetrics() function
- [ ] getDashboardData() function
- [ ] getTriggerHeatmap() function
- [ ] getProgressionTimeline() function
- [ ] calculateAverageIntensity() helper
- [ ] aggregateTriggersByType() helper

### API endpoint
- [ ] app/api/agents/[id]/behavior-analytics/route.ts
- [ ] GET handler
- [ ] Return dashboard data JSON
- [ ] Error handling

### Opcional: UI básico
- [ ] components/behavior-dashboard.tsx (si hay tiempo)
- [ ] Gráfica de intensidad over time
- [ ] Lista de triggers recientes
- [ ] Fase actual display

### Git
- [ ] git checkout -b feature/phase8-analytics
- [ ] git add lib/behavior-system/analytics.ts
- [ ] git add app/api/agents/[id]/behavior-analytics/
- [ ] git commit
- [ ] git push origin feature/phase8-analytics

**Estado:** ⏳ Pendiente
**Tiempo estimado:** 1 hora

---

## 📝 DOCUMENTACIÓN FINAL

- [ ] README.md en lib/behavior-system/
  - Explicar arquitectura
  - Ejemplos de uso
  - API reference

- [ ] UPDATE CURRENT-STATE.md
  - Marcar phases como completed
  - Actualizar "Próximos pasos"

- [ ] UPDATE TODO.md (este archivo)
  - Marcar todo como completed
  - Agregar notas finales

---

## 🎉 CRITERIO DE "DONE"

✅ **Completado cuando:**
- [ ] Todas las phases 2-8 implementadas
- [ ] Tests >80% passing
- [ ] Build sin errores
- [ ] 8 branches en Git (uno por phase)
- [ ] Código documentado con JSDoc
- [ ] README.md explicando uso
- [ ] Sistema funcional end-to-end

---

## 📊 TRACKING HORARIO (llenar durante la noche)

| Hora | Phase | Actividad | Status |
|------|-------|-----------|--------|
| 00:00 | Setup | Leer contexto, preparar | ✅ |
| 00:30 | P2 | trigger-patterns.ts | ⏳ |
| 01:00 | P2 | trigger-detector.ts | ⏳ |
| 02:00 | P2 | trigger-processor.ts | ⏳ |
| 02:30 | P2 | Tests + integration | ⏳ |
| 03:00 | P3 | phase-manager.ts | ⏳ |
| 04:00 | P3 | Tests | ⏳ |
| 04:30 | P4 | emotional-integration.ts | ⏳ |
| 05:00 | P4 | intensity-calculator.ts | ⏳ |
| 05:30 | P5 | yandere-prompts.ts | ⏳ |
| 06:00 | P5 | Otros prompts | ⏳ |
| 06:30 | P5 | prompt-selector.ts | ⏳ |
| 07:00 | P6 | content-moderator.ts | ⏳ |
| 07:30 | P7 | Testing integration | ⏳ |
| 07:45 | P8 | Analytics | ⏳ |
| 08:00 | Fin | Docs finales | ⏳ |

---

## 🚨 PROBLEMAS ENCONTRADOS (llenar si hay)

### Problema 1:
- **Descripción:**
- **Solución:**
- **Tiempo perdido:**

### Problema 2:
- **Descripción:**
- **Solución:**
- **Tiempo perdido:**

---

## 📈 MÉTRICAS FINALES (llenar al terminar)

- **Archivos creados:**
- **Líneas de código:**
- **Tests escritos:**
- **Commits realizados:**
- **Branches creadas:**
- **Bugs encontrados y fixeados:**
- **Tiempo total:**
- **Fases completadas:** /8

---

**ÚLTIMA ACTUALIZACIÓN:** [Llenar durante la noche]
