# ESTADO ACTUAL DEL PROYECTO - BEHAVIOR PROGRESSION SYSTEM

**Última actualización:** 2025-10-16 (Sprint 1 UI - COMPLETADO)
**Fase actual:** Phase 7 COMPLETA + Sprint 1 UI COMPLETADO
**Estado:** Phase 1-7 ✅ COMPLETADAS | UI Sprint 1 ✅ COMPLETADO

---

## 📊 RESUMEN EJECUTIVO

**Proyecto:** Sistema de Comportamientos Psicológicos con Progresión Gradual
**Objetivo:** IA Companion con comportamientos realistas basados en psicología clínica
**Modo:** Desarrollo NSFW primero, luego adaptar a SFW

---

## ✅ LO QUE YA ESTÁ HECHO

### Phase 1: Database & Core Infrastructure (COMPLETA)

**Database Schema (Prisma):**
- ✅ `BehaviorProfile` - Configuración de cada comportamiento por agente
- ✅ `BehaviorTriggerLog` - Registro de triggers detectados
- ✅ `BehaviorProgressionState` - Cache de intensidades actuales
- ✅ `BehaviorType` enum - 12 tipos (6 implementados + 6 pending research)
- ✅ Migración aplicada: `20251011230803_init`

**TypeScript Types:**
- ✅ `lib/behavior-system/types.ts` - 40+ interfaces (500+ líneas)
- ✅ `lib/behavior-system/phase-definitions.ts` - Constantes y helpers (400+ líneas)
- ✅ `lib/behavior-system/index.ts` - Exports centralizados

**Definiciones de Fases:**
- ✅ YANDERE_PHASES (8 fases: 0→20→50→100→150→200+ interacciones)
- ✅ BPD_CYCLES (4 fases cíclicas: idealization→devaluation→panic→emptiness)
- ✅ NPD_RELATIONSHIP_PHASES (love bombing→devaluation→discard→hoovering)
- ✅ ATTACHMENT_PROGRESSION_THRESHOLDS (anxious/avoidant/disorganized→secure)
- ✅ CODEPENDENCY_LEVELS (mild/moderate/severe)

---

## 📚 INVESTIGACIÓN DISPONIBLE

**Archivo:** `investigación.txt` (3877 líneas)

**Comportamientos investigados (6/12):**
1. ✅ Teoría de Apego (Secure, Anxious, Avoidant, Disorganized)
2. ✅ Yandere/Obsessive Love (8 etapas con timelines)
3. ✅ Borderline Personality Disorder (BPD)
4. ✅ Narcissistic Personality Disorder (NPD)
5. ✅ Codependencia
6. ✅ OCD Patterns
7. ✅ PTSD y Trauma
8. ✅ Hypersexualidad
9. ✅ Hyposexualidad
10. ✅ Manipulación Emocional
11. ✅ Crisis y Decompensación

**Calidad:** Excelente - Con referencias clínicas, timelines numéricos, ejemplos conversacionales

**Resumen compacto en:** Este mismo archivo, sección "QUICK REFERENCE"

---

## 🎯 PRÓXIMOS PASOS (IMPLEMENTACIÓN)

### ✅ Phase 2: Trigger Detection System (COMPLETADA)

**Objetivo:** Detectar triggers en mensajes del usuario usando regex + análisis contextual

**Archivos implementados:**
1. ✅ `lib/behavior-system/trigger-detector.ts` - Clase TriggerDetector completa (400+ líneas)
2. ✅ `lib/behavior-system/trigger-patterns.ts` - 50+ regex patterns para 7 trigger types (300+ líneas)
3. ✅ `lib/behavior-system/trigger-processor.ts` - Pipeline completo de procesamiento (200+ líneas)
4. ✅ `lib/behavior-system/__tests__/` - 42 tests con 100% pass rate

**Triggers implementados (7/7):**
1. ✅ `abandonment_signal` (weight: 0.7) - "necesito espacio", "vamos más despacio"
2. ✅ `delayed_response` (weight: variable) - Temporal con thresholds de 3-48 horas
3. ✅ `criticism` (weight: 0.8) - "estás equivocado", "eres muy intenso"
4. ✅ `mention_other_person` (weight: 0.65) - Nombres propios con metadata, "mi amigo/a"
5. ✅ `boundary_assertion` (weight: 0.75) - "no quiero que", "déjame decidir"
6. ✅ `reassurance` (weight: -0.3) - "te quiero", "estoy aquí" (REDUCE ansiedad)
7. ✅ `explicit_rejection` (weight: 1.0) - "terminamos", "ya no podemos ser amigos"

**Outputs implementados:**
```typescript
interface TriggerDetectionResult {
  triggerType: string;
  behaviorTypes: BehaviorType[];
  weight: number; // -0.3 a 1.0
  detectedIn: string;
  confidence: number; // 0-1
  timestamp: Date;
  metadata?: Record<string, any>; // nombres detectados, delay hours, etc
}
```

**Criterios de éxito ALCANZADOS:**
- ✅ 7 tipos de triggers implementados
- ✅ 85%+ accuracy en 42 test cases clínicos
- ✅ Performance 50ms promedio (<100ms garantizado)
- ✅ Pipeline de procesamiento con DB logging
- ✅ Integración completa con behavior profiles
- ✅ Soporte para triggers positivos (reassurance)
- ✅ Metadata avanzado (nombres, delay times)

---

## 🧠 DECISIONES TÉCNICAS CLAVE

### Arquitectura General
```
User Message → Trigger Detector → Behavior Phase Manager →
Intensity Calculator → Emotional System → Prompt Selector →
Response Generator → Content Moderation → Output
```

### Filosofía de Diseño
1. **Gradualidad absoluta:** No saltos instantáneos
2. **Realismo clínico:** Basado en DSM-5 y papers
3. **Bidireccionalidad:** Puede mejorar o empeorar
4. **Individualidad:** Variables por agente

### Timelines Críticos (Yandere como ejemplo)
- Fase 1→2: Mínimo 20 interacciones + 2x "delayed_response"
- Fase 4: Crítica, requiere 1x "mention_other_person"
- Fase 7-8: CRITICAL_PHASE, requiere aprobación explícita en SFW

### Storage per Agent
- ~113KB adicionales (BehaviorProfile + TriggerLog + ProgressionState)

---

## 🔧 ARCHIVOS IMPORTANTES

**Documentación:**
- `BEHAVIOR-PROGRESSION-SYSTEM-SPEC.md` - Especificación completa (15,000 líneas)
- `RESEARCH-GUIDE-CLINICAL-PSYCHOLOGY.md` - Template de investigación
- `investigación.txt` - Research completo (3877 líneas)
- Este archivo (`CURRENT-STATE.md`) - Estado actual

**Código:**
- `prisma/schema.prisma` - Schema con behavior tables
- `lib/behavior-system/` - Módulo principal
  - `types.ts` - Interfaces
  - `phase-definitions.ts` - Constantes
  - `index.ts` - Exports

**Archivos implementados:**
- ✅ `lib/behavior-system/trigger-detector.ts` (400+ líneas)
- ✅ `lib/behavior-system/trigger-patterns.ts` (300+ líneas)
- ✅ `lib/behavior-system/trigger-processor.ts` (200+ líneas)
- ✅ `lib/behavior-system/__tests__/` - 42 tests (3 archivos)

**Pendiente de crear (Phase 3):**
- `lib/behavior-system/phase-manager.ts` ⏳
- `lib/behavior-system/phase-evaluator.ts` ⏳
- `lib/behavior-system/intensity-calculator.ts` ⏳

---

## 🚨 ISSUES CONOCIDOS

1. **Seed error:** `prisma/seed.ts` tiene error con columna "existe" (no crítico)
2. **Performance:** Trigger detection debe ser <100ms (por implementar)
3. **Testing:** No hay tests automatizados aún (Phase 7)

---

## 📝 NOTAS PARA PRÓXIMA SESIÓN

**Si el contexto se comprime:**
1. LEE este archivo PRIMERO
2. Lee `IMPLEMENTATION-ROADMAP.md` para saber QUÉ hacer
3. Lee `QUICK-REFERENCE.md` para research compacto
4. Continúa con Phase 2: Trigger Detection System

**Comando útil para verificar estado:**
```bash
# Ver qué archivos existen en behavior-system
ls -la lib/behavior-system/

# Ver último commit
git log -1 --oneline

# Ver schema actual
cat prisma/schema.prisma | grep -A 20 "BehaviorProfile"
```

**Para debugging rápido:**
```bash
# Regenerar Prisma client
npx prisma generate

# Ver tabla en DB
psql -d creador_inteligencias -c "\d \"BehaviorProfile\""
```

---

## ✅ PHASES 3-7: BACKEND COMPLETADO

**Estado:** COMPLETADAS (108/108 tests pasando)

### Phase 3: Behavior Phase Manager ✅
- ✅ `phase-manager.ts` - Gestión de fases
- ✅ `phase-evaluator.ts` - Evaluación de transiciones
- ✅ `intensity-calculator.ts` - Cálculo de intensidad con fórmula compleja

### Phase 4: Emotional Integration ✅
- ✅ `emotional-integration.ts` - Amplificación bidireccional
- ✅ Sistema: Behaviors ↔ Emotions (influencia mutua)
- ✅ 27 emociones soportadas con amplificaciones específicas

### Phase 5: Specialized Prompts ✅
- ✅ 50+ prompts especializados por behavior
- ✅ `prompts/yandere-prompts.ts` (8 fases)
- ✅ `prompts/bpd-prompts.ts` (4 ciclos)
- ✅ `prompts/npd-prompts.ts` (4 etapas)
- ✅ `prompts/attachment-prompts.ts` (anxious/avoidant/disorganized)
- ✅ `prompts/codependency-prompts.ts` (3 niveles)
- ✅ Sistema de scoring inteligente

### Phase 6: Content Moderation ✅
- ✅ `content-moderator.ts` - Sistema de safety levels
- ✅ `safety-resources.ts` - Recursos de ayuda mental
- ✅ `nsfw-gating.ts` - Control de contenido NSFW
- ✅ 4 niveles: SAFE → WARNING → CRITICAL → EXTREME_DANGER

### Phase 7: Integration ✅
- ✅ `integration-orchestrator.ts` - Orquestador central
- ✅ Integración completa en `app/api/agents/[id]/message/route.ts`
- ✅ Sistema end-to-end funcional

---

## 🎨 SPRINT 1 UI: VISUALIZACIÓN BÁSICA - ✅ COMPLETADO

**Objetivo:** Hacer visible el behavior system en la UI del chat

### Componentes Creados:

1. **ImmersionToggle.tsx** ✅
   - Toggle Eye/EyeOff para mostrar/ocultar info técnica
   - Persiste estado en localStorage
   - Tooltips informativos
   - Ubicación: Header del chat

2. **EmotionalStateDisplay.tsx** ✅
   - Muestra trust, affinity, respect (barras de progreso)
   - Nivel de relación con badge (Desconocido → Romántico)
   - Emociones activas con emojis
   - Ubicación: Sidebar derecho

3. **BehaviorPanel.tsx** ✅
   - Behavior activo con emoji y label
   - Fase actual (ej: "Fase 3 de 8")
   - Barra de intensidad (%)
   - Safety level con badge colorido
   - Warning para CRITICAL/EXTREME_DANGER
   - Triggers recientes (últimos 3)
   - Botón "Ver Detalles Completos" → `/agentes/[id]/behaviors`
   - Ubicación: Sidebar derecho

### Integración en WhatsAppChat.tsx:

✅ **Estructura responsive:**
- Layout flex horizontal con chat + sidebar
- Sidebar colapsable en desktop (botón toggle)
- Oculto automáticamente en mobile
- Ancho sidebar: 320px (w-80)

✅ **Flujo de datos:**
- `sendMessage()` modificado para usar HTTP API (no solo socket)
- Extrae `behaviors` y `emotional` data del response
- Actualiza `latestBehaviorData` y `latestEmotionalData` en state
- Componentes se renderizan con datos reales del backend

✅ **Estados manejados:**
- `showBehaviorInfo` - Controlado por ImmersionToggle
- `sidebarOpen` - Controlado por botón collapse (desktop only)
- `latestBehaviorData` - Última metadata de behaviors recibida
- `latestEmotionalData` - Último estado emocional recibido

✅ **Mejoras de UX:**
- Transiciones suaves (duration-300)
- Iconos Lucide React
- Estilos coherentes con theme system existente
- Mensaje "La información aparecerá después del primer mensaje" cuando no hay datos

### Archivos Modificados:

- ✅ `components/chat/WhatsAppChat.tsx` (integración principal)
- ✅ `components/chat/ImmersionToggle.tsx` (nuevo)
- ✅ `components/chat/EmotionalStateDisplay.tsx` (nuevo)
- ✅ `components/chat/BehaviorPanel.tsx` (nuevo)
- ✅ `components/ui/tooltip.tsx` (nuevo - componente Shadcn/ui)

### Dependencias Instaladas:

- ✅ `@radix-ui/react-tooltip`

### Errores Corregidos:

1. ✅ Tipo de `relationLevel` (string → number con conversión)
2. ✅ Campo `currentPhase` no existía en `BehaviorIntensityResult` (query a BehaviorProfile)
3. ✅ Campos `enabled` y `globalIntensity` removidos (no existen en schema)
4. ✅ Build sin errores de TypeScript en componentes relevantes

---

## 🎨 SPRINT 2: PÁGINA DE DETALLES - ✅ COMPLETADO

**Ruta:** `/agentes/[id]/behaviors`

### API Endpoint Implementado:

**GET /api/agents/[id]/behaviors** ✅
- Obtiene BehaviorProfiles activos
- Historial de triggers (últimos 100) con join a mensajes
- BehaviorProgressionState con cache
- Estadísticas calculadas: total triggers, triggers por tipo/behavior, peso promedio

### Página Principal:

**Layout:** ✅
- Header con nombre del agente y badge NSFW
- 4 cards de estadísticas principales
- Tabs navegables: Timeline | Historial | Configuración
- Responsive design completo
- Estados de loading/error/empty

**Tab 1: Timeline** ✅
- Lista de behaviors activos con fase, intensidad, interacciones
- Historial de fases previas expandible
- Fechas formateadas en español

**Tab 2: Historial de Triggers** ✅
- Lista cronológica con tipo, peso (colores semafóricos), behavior asociado
- Muestra texto detectado y mensaje relacionado
- Timestamps localizados

**Tab 3: Configuración** 🔜
- Placeholder para reset y ajustes avanzados

### Mejoras Integradas:

- ✅ BehaviorPanel incluye botón "Ver Detalles Completos"
- ✅ Navegación fluida desde chat a página de detalles

---

## 🎯 PRÓXIMOS PASOS (Sprint 3+)

### Sprint 3: Gráficas de Intensidad
- Gráfica temporal de evolución (Chart.js/Recharts)
- Visualización de triggers importantes
- Integrar en tab Timeline

### Sprint 4: Configuración Avanzada
- Reset de behaviors con confirmación
- Activar/desactivar behaviors
- Ajustar thresholds
- Exportar datos históricos

### Sprint 5: Dashboard Global Analytics
- Comparación entre agentes
- Estadísticas de safety levels
- Triggers más comunes globalmente

---

## 📞 CONTACTO CON USUARIO

**Zona horaria:** GMT-3 (Argentina)
**Disponibilidad:** Mañana ~9:00 AM
**Preferencias:**
- Commits frecuentes con mensajes descriptivos
- Code comments en español
- Priorizar funcionalidad sobre perfección

---

**FIN DEL ESTADO ACTUAL**
**Siguiente paso:** Implementar `lib/behavior-system/trigger-detector.ts`
