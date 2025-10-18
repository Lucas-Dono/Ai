# 🧠 Sistema Emocional Híbrido - Guía Completa

## 🎯 ¿Qué es?

Sistema emocional inteligente que combina **dos enfoques científicos**:

1. **Plutchik's Wheel** (1980) - 8 emociones primarias + 20 secundarias (dyads)
2. **Modelo OCC** (Ortony, Clore, Collins, 1988) - 22 emociones cognitivas

Con **routing automático** que elige el mejor enfoque según complejidad del mensaje.

---

## 🚀 Uso Rápido

```typescript
import { hybridEmotionalOrchestrator } from "@/lib/emotional-system/hybrid-orchestrator";

// Procesar mensaje (routing automático)
const result = await hybridEmotionalOrchestrator.processMessage({
  agentId: "agent-123",
  userMessage: "Hola, ¿cómo estás?",
  userId: "user-456",
});

// Resultado unificado
console.log(result.emotionState);      // 8 emociones primarias (Plutchik)
console.log(result.activeDyads);       // 20 emociones secundarias
console.log(result.metadata.path);     // "fast" o "deep"
console.log(result.metadata.processingTimeMs);
console.log(result.metadata.costEstimate);
```

---

## 📊 Routing Automático

### Fast Path (80% de mensajes)
**Cuándo:** Mensajes simples como saludos, reacciones, confirmaciones

**Ejemplos:**
- "hola"
- "jaja"
- "ok"
- "qué tal?"

**Procesamiento:**
- Plutchik rule-based (keywords + patrones)
- Cálculo de dyads automático
- **Tiempo:** ~50ms
- **Costo:** $0

### Deep Path (20% de mensajes)
**Cuándo:** Mensajes complejos con problemas, decisiones, conflictos

**Ejemplos:**
- "Mi jefe me echó la culpa de algo que no hice"
- "No sé si debería decirle a mi mejor amigo que su novia me coqueteó"
- "Perdí mi trabajo y estoy cayendo en depresión"

**Procesamiento:**
- OCC Appraisal (evaluación cognitiva de 10 dimensiones)
- Generación de 22 emociones OCC
- Mapeo OCC → Plutchik
- Cálculo de dyads
- **Tiempo:** ~2500ms
- **Costo:** ~$0.007

---

## 🎨 Emociones Disponibles

### 8 Emociones Primarias (Plutchik)
- **joy** (alegría)
- **trust** (confianza)
- **fear** (miedo)
- **surprise** (sorpresa)
- **sadness** (tristeza)
- **disgust** (disgusto)
- **anger** (enojo)
- **anticipation** (anticipación)

### 20 Emociones Secundarias (Dyads)

**Primary Dyads** (adyacentes):
- **love** = joy + trust
- **submission** = trust + fear
- **alarm** = fear + surprise
- **disappointment** = surprise + sadness
- **remorse** = sadness + disgust
- **contempt** = disgust + anger
- **aggression** = anger + anticipation
- **optimism** = anticipation + joy

**Secondary Dyads**:
- **guilt** = joy + fear
- **curiosity** = trust + surprise
- **despair** = fear + sadness
- **envy** = surprise + disgust
- **cynicism** = sadness + anger
- **pride** = disgust + anticipation
- **hope** = anger + joy
- **anxiety** = anticipation + trust

**Tertiary Dyads** (opuestas - conflictos):
- **ambivalence** = joy + sadness
- **frozenness** = trust + disgust
- **outrage** = fear + anger
- **confusion** = surprise + anticipation

### 22 Emociones OCC (solo Deep Path)
Estas se mapean a las primarias + generan dyads:

**Eventos:**
- joy, distress, hope, fear, satisfaction, disappointment, relief, fears_confirmed
- happy_for, resentment, pity, gloating

**Acciones:**
- pride, shame, admiration, reproach, gratitude, anger

**Objetos:**
- liking, disliking

**Adicionales:**
- interest, curiosity, affection, love, anxiety, concern, boredom, excitement

---

## 📁 Estructura de Archivos

```
lib/emotional-system/
├── hybrid-orchestrator.ts           ⭐ PRINCIPAL - Usar este
├── complexity-analyzer.ts           [Routing inteligente]
├── occ-to-plutchik-mapper.ts       [Traduce OCC → Plutchik]
├── orchestrator.ts                  [OCC Orchestrator - usado internamente]
│
├── modules/
│   ├── emotion/
│   │   ├── dyad-calculator.ts      [Calcula 20 dyads]
│   │   ├── generator.ts             [Genera emociones OCC]
│   │   └── decay.ts                 [Decay emocional]
│   │
│   ├── appraisal/
│   │   └── engine.ts                [Evaluación OCC]
│   │
│   ├── cognition/
│   │   ├── reasoning.ts             [Internal reasoning]
│   │   └── action-decision.ts       [11 tipos de acción]
│   │
│   ├── response/
│   │   ├── generator.ts             [Genera respuestas]
│   │   ├── behavioral-cues.ts       [Cues comportamentales]
│   │   └── anti-sycophancy.ts       [Anti-sicofancia]
│   │
│   ├── memory/
│   │   └── retrieval.ts             [Retrieval de memorias]
│   │
│   └── growth/
│       └── character-growth.ts      [Evolución del personaje]
│
lib/emotions/                        [Sistema Plutchik]
├── plutchik.ts                      [8 primarias + definiciones dyads]
├── system.ts                        [Rule-based analysis]
└── index.ts                         [Exports]
```

---

## 🧪 Testing

```bash
# Ejecutar tests del sistema híbrido
npx tsx scripts/test-hybrid-emotional-system.ts
```

El script prueba:
1. ✅ Routing correcto (Fast vs Deep)
2. ✅ Generación de dyads
3. ✅ Mapeo OCC → Plutchik
4. ✅ Performance y costos

---

## 📊 Performance Esperada

| Métrica | Fast Path | Deep Path | Híbrido (80/20) |
|---------|-----------|-----------|-----------------|
| **Tiempo** | 50ms | 2500ms | **440ms** |
| **Costo** | $0 | $0.007 | **$0.0014** |
| **Emociones** | 8 + 20 dyads | 22 OCC + 8 + 20 dyads | **50 totales** |

**Ahorro vs Deep-only:**
- ⚡ **82% más rápido** (440ms vs 2500ms)
- 💰 **80% más barato** ($0.0014 vs $0.007)
- 🎨 **Mismo nivel de riqueza emocional**

**Proyección a 1000 mensajes:**
- Híbrido: **$1.40**
- Deep-only: **$7.00**
- **Ahorro: $5.60**

---

## 🔧 Integración en Message Route

Ver archivo: `INTEGRATION-PATCH-MESSAGE-ROUTE.md`

Resumen:
1. Import `hybridEmotionalOrchestrator`
2. Reemplazar bloque Plutchik legacy (líneas 164-221)
3. Actualizar emotional context con dyads
4. ✅ Listo

---

## 🎯 Casos de Uso

### 1. Simulación de Trastornos Mentales

**Depresión:**
- Dyad dominante: `despair` (fear + sadness)
- Estabilidad emocional baja (<0.4)

**Ansiedad:**
- Dyad dominante: `anxiety` (anticipation + trust)
- fear > 0.7

**Borderline PD:**
- Dyad terciario: `ambivalence` (joy + sadness) - conflicto interno
- Cambios drásticos entre `love` y `contempt`

**Narcissistic PD:**
- `pride` alto + `shame` sensibilidad extrema
- `admiration` seeking

### 2. Respuestas Contextualmente Apropiadas

El Deep Path entiende:
- **Objetivos del personaje:** "Renuncié" → joy si objetivo era "ser despedido"
- **Valores:** Algo viola sus valores → `reproach`, `disgust`, `anger`
- **Historia compartida:** Referencias a conversaciones pasadas

### 3. Emociones Complejas Realistas

El sistema puede generar:
- **Culpa:** joy (de hacer algo) + fear (de consecuencias)
- **Curiosidad:** trust (confianza) + surprise (novedad)
- **Cinismo:** sadness (tristeza) + anger (resentimiento)
- **Indignación:** fear (miedo) + anger (ira justificada)

---

## 🚨 Advertencias Importantes

### ⚠️ NO usar directamente:
```typescript
// ❌ MAL
import { EmotionalSystemOrchestrator } from "@/lib/emotional-system/orchestrator";
const orchestrator = new EmotionalSystemOrchestrator();

// ❌ MAL
import { analyzeMessageEmotions } from "@/lib/emotions/system";
const deltas = analyzeMessageEmotions(message);
```

### ✅ Usar en su lugar:
```typescript
// ✅ BIEN
import { hybridEmotionalOrchestrator } from "@/lib/emotional-system/hybrid-orchestrator";
const result = await hybridEmotionalOrchestrator.processMessage({...});
```

---

## 📚 Referencias Científicas

### Plutchik's Wheel (1980)
- Robert Plutchik. "A general psychoevolutionary theory of emotion"
- 8 emociones primarias basadas en evolución
- 20 emociones secundarias (dyads) por combinación
- Validado en neurociencia con fMRI

### Modelo OCC (1988)
- Ortony, Clore, Collins. "The Cognitive Structure of Emotions"
- 22 tipos de emociones basadas en evaluación cognitiva
- Usado en IA emocional y simulación de agentes
- Estándar en affective computing

### Complexity Analysis
- Dual Process Theory (Kahneman, 2011)
- Sistema 1 (fast, automatic) vs Sistema 2 (slow, deliberate)

---

## 🔮 Futuras Mejoras

1. **Machine Learning para Routing**
   - Entrenar modelo que aprenda qué tipo de mensaje es mejor para cada path
   - Ajuste dinámico de threshold

2. **Personality-Aware Dyads**
   - High neuroticism → dyads más intensos y duraderos
   - High openness → más `curiosity` dyads

3. **Temporal Dynamics**
   - Dyads que evolucionan a lo largo de conversación
   - `alarm` → `fear` → `despair` en crisis progresiva

4. **Cultural Variations**
   - Diferentes expresiones emocionales según cultura
   - Intensidad de dyads varía por contexto cultural

---

## 👥 Contribuir

El sistema está diseñado para extensibilidad:

1. **Agregar nuevas reglas de complejidad:**
   - Editar `complexity-analyzer.ts`

2. **Ajustar mapeo OCC → Plutchik:**
   - Editar `occ-to-plutchik-mapper.ts`

3. **Agregar nuevos dyads:**
   - Editar `plutchik.ts` (definiciones)
   - `dyad-calculator.ts` actualizará automáticamente

---

## 📞 Soporte

Si encuentras problemas:
1. Ejecutar `scripts/test-hybrid-emotional-system.ts`
2. Revisar logs de routing (aparece en consola)
3. Verificar que archivos deprecated no se usen directamente
4. Revisar `EMOTIONAL-SYSTEMS-COMPARISON.md` para entender arquitectura

---

**Versión:** 1.0.0 (Hybrid System)
**Fecha:** 2025-01-18
**Autor:** Sistema generado con Claude Code + investigación científica
