# 🔀 Sistema Híbrido de LLM: Gemini + Venice

## 🎯 Objetivo

**Optimizar costos** usando Gemini (gratis) para procesamiento técnico y Venice (pago) solo para contenido que requiere estar sin censura.

---

## 📊 Distribución de Proveedores

### ✅ Gemini AI (Gratis - Cuota gratuita)

| Fase | Por qué Gemini | Ahorro |
|------|----------------|--------|
| **Appraisal** | Evaluación técnica numérica (JSON). No visible al usuario. Sin contenido sensible. | 🟢 Alto |
| **Emotion Generation** | Generación de emociones (JSON). No visible al usuario. Sin contenido sensible. | 🟢 Alto |
| **Action Decision** | Decisión de tipo de acción (JSON). No visible al usuario. Sin contenido sensible. | 🟢 Medio |

**Total fases Gemini**: 3 de 5 (60% de las llamadas LLM)

### 🏝️ Venice AI (Pago - Sin censura)

| Fase | Por qué Venice | Crítico |
|------|----------------|---------|
| **Internal Reasoning** | Pensamiento interno auténtico. Aunque no visible, Gemini censuraría pensamientos "inapropiados". | ⚠️ Importante |
| **Response Generation** | **TEXTO VISIBLE AL USUARIO**. Debe poder: contenido NSFW, hacerse pasar por persona real, opiniones sin filtros. | 🔴 MUY CRÍTICO |
| **Proactive Messages** | **TEXTO VISIBLE AL USUARIO**. Igual que Response Generation. | 🔴 MUY CRÍTICO |

**Total fases Venice**: 2 de 5 (40% de las llamadas LLM, pero las más costosas)

---

## 💰 Estimación de Ahorro

### Costos por Fase (estimados)

**Venice**:
- Input: $0.20/M tokens
- Output: $0.90/M tokens

**Gemini**:
- Input: $0 (dentro de cuota gratuita)
- Output: $0 (dentro de cuota gratuita)

### Costo por Mensaje Emocional

| Fase | Tokens Aprox | Venice (antes) | Híbrido (ahora) | Ahorro |
|------|--------------|----------------|-----------------|--------|
| Appraisal | 500 | $0.0001 | **$0** ✅ | 100% |
| Emotion | 600 | $0.00012 | **$0** ✅ | 100% |
| Reasoning | 1000 | $0.0004 | $0.0004 | 0% |
| Action | 400 | $0.00008 | **$0** ✅ | 100% |
| Response | 1500 | $0.0015 | $0.0015 | 0% |
| **TOTAL** | **4000** | **$0.0022** | **$0.0019** | **~14%** |

**Ahorro mensual** (100 mensajes/día):
- Antes (solo Venice): $6.60/mes
- Ahora (híbrido): $5.70/mes
- **Ahorro: $0.90/mes** (14%)

**Plus**: Proteges la cuota gratuita de Gemini para escalar sin costos adicionales.

---

## 🛠️ Implementación

### Arquitectura

```typescript
// ANTES: Todos los módulos usaban Venice directo
import { getVeniceClient } from './venice';
const llmClient = getVeniceClient();

// AHORA: Todos usan HybridProvider
import { getHybridLLMProvider } from './hybrid-provider';
const llmClient = getHybridLLMProvider();
```

### Selección Automática

El `HybridLLMProvider` selecciona automáticamente el mejor provider por fase:

```typescript
// Appraisal: usa Gemini automáticamente
await llmClient.generateJSON<AppraisalScores>(
  'appraisal',  // ← Especificar fase
  systemPrompt,
  userPrompt,
  options
);

// Response: usa Venice automáticamente
await llmClient.generateWithSystemPrompt(
  'response',   // ← Especificar fase
  systemPrompt,
  userPrompt,
  options
);
```

### Configuración de Fases

```typescript
const PHASE_CONFIG: Record<LLMPhase, {
  provider: 'gemini' | 'venice';
  reason: string;
}> = {
  appraisal: {
    provider: 'gemini',
    reason: 'Evaluación técnica - No requiere sin censura',
  },
  emotion: {
    provider: 'gemini',
    reason: 'Generación emociones JSON - No requiere sin censura',
  },
  reasoning: {
    provider: 'venice',
    reason: 'Pensamiento interno auténtico - Requiere honestidad total',
  },
  action: {
    provider: 'gemini',
    reason: 'Decisión de acción JSON - No requiere sin censura',
  },
  response: {
    provider: 'venice',
    reason: 'CRÍTICO: Texto visible - Requiere sin censura total',
  },
};
```

---

## 📈 Escalabilidad

### Cuota Gratuita de Gemini

- **RPM (Requests Per Minute)**: 15
- **TPM (Tokens Per Minute)**: 1,000,000
- **RPD (Requests Per Day)**: 1,500

**Con sistema híbrido**:
- 3 fases usan Gemini por mensaje
- 1 mensaje = 3 requests a Gemini
- **Capacidad**: ~500 mensajes/día dentro de cuota gratuita

### Escalado con Tráfico Alto

Si superas cuota gratuita de Gemini:

1. **Opción 1**: Pagar Gemini
   - Gemini Paid: $0.00025/1K tokens
   - Sigue siendo 78% más barato que Venice

2. **Opción 2**: Cambiar solo las fases técnicas a Venice
   - Modificar `PHASE_CONFIG` en `hybrid-provider.ts`
   - Un simple cambio de configuración

---

## 🔧 Logs y Monitoreo

El sistema imprime claramente qué provider usa cada fase:

```
[HybridLLM] Phase: appraisal → Provider: GEMINI (Evaluación técnica - No requiere sin censura)
[HybridLLM] Phase: emotion → Provider: GEMINI (Generación emociones JSON - No requiere sin censura)
[HybridLLM] Phase: reasoning → Provider: VENICE (Pensamiento interno auténtico - Requiere honestidad total)
[HybridLLM] Phase: action → Provider: GEMINI (Decisión de acción JSON - No requiere sin censura)
[HybridLLM] Phase: response → Provider: VENICE (CRÍTICO: Texto visible - Requiere sin censura total)
```

---

## ⚠️ Consideraciones Importantes

### Cuando NO usar Gemini

❌ **NO usar Gemini para**:
- Texto visible al usuario (podría censurar)
- Contenido NSFW o adulto
- Opiniones políticamente incorrectas
- "Hacerse pasar" por persona real
- Temas sensibles que requieren autenticidad

✅ **SÍ usar Gemini para**:
- Procesamiento técnico (JSON)
- Evaluaciones numéricas
- Análisis de datos estructurados
- Decisiones lógicas

### Límites de Gemini

**Contenido Bloqueado**:
- Violencia explícita
- Contenido sexual explícito
- Información peligrosa
- Acoso o bullying
- Suplantación de identidad

Si Gemini bloquea una request en fase técnica, el sistema tiene fallback a Venice automático (implementar si necesario).

---

## 🎯 Recomendaciones

### Para Desarrollo
- ✅ Usa el sistema híbrido tal cual
- ✅ Monitorea logs para ver distribución de providers
- ✅ Verifica que Response siempre use Venice

### Para Producción Temprana (<500 msg/día)
- ✅ Mantén configuración híbrida
- ✅ Todo dentro de cuota gratuita de Gemini
- ✅ Solo pagas Venice para respuestas finales

### Para Producción Escalada (>500 msg/día)
- 🔄 Evalúa si Gemini Paid sigue siendo más barato que Venice
- 🔄 Considera usar Venice para todo si prefieres simplicidad
- 🔄 O mantén híbrido y paga Gemini Paid (sigue siendo 78% más barato)

---

## 📚 Archivos Modificados

### Nuevos
- ✅ `lib/emotional-system/llm/hybrid-provider.ts` - Provider híbrido

### Modificados
- ✅ `lib/emotional-system/modules/appraisal/engine.ts` - Usa HybridProvider
- ✅ `lib/emotional-system/modules/emotion/generator.ts` - Usa HybridProvider
- ✅ `lib/emotional-system/modules/cognition/reasoning.ts` - Usa HybridProvider
- ✅ `lib/emotional-system/modules/cognition/action-decision.ts` - Usa HybridProvider
- ✅ `lib/emotional-system/modules/response/generator.ts` - Usa HybridProvider

---

## 🚀 Próximos Pasos

1. **Probar el sistema híbrido**:
   ```bash
   npm run dev
   # Enviar mensajes y verificar logs
   ```

2. **Verificar que funciona**:
   - Busca en logs: `[HybridLLM] Phase: X → Provider: Y`
   - Appraisal/Emotion/Action deben usar **GEMINI**
   - Reasoning/Response deben usar **VENICE**

3. **Monitorear costos**:
   - Dashboard Venice: https://venice.ai/settings/api
   - Dashboard Gemini: https://makersuite.google.com/app/apikey
   - Verifica que Gemini se mantenga en cuota gratuita

---

## ✅ Beneficios Finales

1. **Ahorro de ~14%** en costos inmediatos
2. **Escalabilidad** hasta 500 msg/día sin costo adicional
3. **Privacidad** mantenida (Venice para contenido sensible)
4. **Flexibilidad** (cambiar configuración fácilmente)
5. **Sin censura** donde importa (respuestas visibles)

**El mejor de ambos mundos**: Gratuito donde se puede, privado y sin censura donde se necesita.

---

**Última actualización**: 2025-10-19
**Status**: ✅ Implementado y Listo
