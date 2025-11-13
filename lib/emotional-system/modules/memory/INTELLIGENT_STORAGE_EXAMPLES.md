# INTELLIGENT STORAGE SYSTEM - EXAMPLES

## Overview

Sistema multi-factor que decide qué memorias guardar basándose en:
1. **Factor emocional**: Arousal/intensidad emocional alta (30 pts)
2. **Factor informativo**: Nueva información sobre el usuario (40 pts)
3. **Factor de eventos**: Eventos significativos detectados (50 pts)
4. **Factor temporal**: Consistencia/repetición (20 pts)

**Threshold para guardar**: 50 puntos

---

## EJEMPLOS DE QUÉ SE GUARDA

### ✅ CASO 1: Información personal nueva (Score: 40+)

**Input**:
```
Usuario: "Me llamo Ana y tengo 28 años"
```

**Decisión**:
- ✅ **STORE** (Score: 85)
- Factores activos:
  - Informativo: 36 pts (nombre detectado, confidence 0.9)
  - Informativo: 34 pts (edad detectada, confidence 0.85)
  - Emocional: 0 pts
  - Eventos: 0 pts
  - Temporal: 0 pts

**Resultado**:
- Memoria guardada: "Usuario: 'Me llamo Ana y tengo 28 años' | Yo: 'Encantado de conocerte Ana'"
- Entidades detectadas:
  - Personal Info: type='name', value='Ana'
  - Personal Info: type='age', value='28'

---

### ✅ CASO 2: Evento significativo (Score: 50+)

**Input**:
```
Usuario: "Mi cumpleaños es el 15 de marzo"
```

**Decisión**:
- ✅ **STORE** (Score: 45 + confidence bonus)
- Factores activos:
  - Eventos: 45 pts (birthday event, confidence 0.9)
  - Informativo: 0 pts
  - Emocional: 0 pts
  - Temporal: 0 pts

**Resultado**:
- Memoria guardada con metadata de evento
- Evento guardado en ImportantEvents:
  - type: 'birthday'
  - eventDate: Date('2025-03-15')
  - priority: 'high'

---

### ✅ CASO 3: Alta intensidad emocional (Score: 30+)

**Input**:
```
Usuario: "¡Estoy súper emocionado! ¡Me aceptaron en la universidad!"
Emociones: joy=0.9, excitement=0.85
Appraisal: desirability=0.9
```

**Decisión**:
- ✅ **STORE** (Score: 75)
- Factores activos:
  - Emocional: 25 pts (arousal > 0.6)
  - Eventos: 45 pts (achievement detected)
  - Informativo: 0 pts
  - Temporal: 0 pts

**Resultado**:
- Memoria guardada con importance alta (0.75)
- Evento de logro guardado en ImportantEvents

---

### ✅ CASO 4: Persona importante mencionada (Score: 40+)

**Input**:
```
Usuario: "Mi hermana María me visitó hoy"
```

**Decisión**:
- ✅ **STORE** (Score: 49)
- Factores activos:
  - Informativo: 34 pts (persona importante + relación)
  - Emocional: 0 pts
  - Eventos: 0 pts
  - Temporal: 0 pts

**Resultado**:
- Memoria guardada
- Persona guardada en ImportantPeople:
  - name: 'María'
  - relationship: 'hermana'
  - importance: 'medium'

---

### ✅ CASO 5: Repetición/consolidación (Score: 20+)

**Input**:
```
Usuario (mensaje 1): "Me gusta el café"
Usuario (mensaje 2): "El café es mi bebida favorita"
Usuario (mensaje 3): "Siempre tomo café por la mañana"
Usuario (mensaje 4): "Voy a tomar un café"
```

**Decisión**:
- ✅ **STORE** (Score: 48)
- Factores activos:
  - Temporal: 20 pts (mencionado 3+ veces)
  - Informativo: 28 pts (preferencia detectada)
  - Emocional: 0 pts
  - Eventos: 0 pts

**Resultado**:
- Memoria consolidada guardada
- Preferencia del usuario registrada

---

### ✅ CASO 6: Combinación múltiple (Score: 100+)

**Input**:
```
Usuario: "Me llamo Carlos y mañana es mi cumpleaños. Estoy muy emocionado porque mi novia Ana me va a sorprender"
Emociones: joy=0.8, anticipation=0.9
Appraisal: desirability=0.85
```

**Decisión**:
- ✅ **STORE** (Score: 134)
- Factores activos:
  - Emocional: 24 pts (arousal alto)
  - Informativo: 36 pts (nombre detectado)
  - Eventos: 45 pts (cumpleaños detectado)
  - Informativo: 29 pts (persona importante 'Ana' + relación)

**Resultado**:
- Memoria con importance máxima (1.0)
- Evento de cumpleaños guardado
- Persona 'Ana' guardada con relación 'novia'

---

## EJEMPLOS DE QUÉ NO SE GUARDA

### ❌ CASO 1: Saludos triviales (Score: 0)

**Input**:
```
Usuario: "Hola, ¿cómo estás?"
```

**Decisión**:
- ❌ **SKIP** (Score: 0)
- Factores activos: Ninguno

**Por qué no se guarda**:
- No hay información personal nueva
- No hay eventos significativos
- Emociones neutrales (arousal < 0.6)
- No hay repetición relevante

---

### ❌ CASO 2: Small talk sin significancia (Score: 0)

**Input**:
```
Usuario: "Hace buen día hoy"
```

**Decisión**:
- ❌ **SKIP** (Score: 0)
- Factores activos: Ninguno

**Por qué no se guarda**:
- Conversación superficial
- No aporta información sobre el usuario
- No hay carga emocional significativa

---

### ❌ CASO 3: Preguntas genéricas (Score: 0)

**Input**:
```
Usuario: "¿Qué hora es?"
```

**Decisión**:
- ❌ **SKIP** (Score: 0)
- Factores activos: Ninguno

**Por qué no se guarda**:
- Pregunta utilitaria sin contexto
- No revela información personal
- No tiene carga emocional

---

### ❌ CASO 4: Respuestas cortas (Score: 0)

**Input**:
```
Usuario: "Ok"
```

**Decisión**:
- ❌ **SKIP** (Score: 0)
- Factores activos: Ninguno

**Por qué no se guarda**:
- Mensaje muy corto sin contenido significativo
- No se puede extraer información útil

---

### ❌ CASO 5: Repetición sin importancia (Score: 20)

**Input**:
```
Usuario (repetido): "Está lloviendo"
```

**Decisión**:
- ❌ **SKIP** (Score: 20)
- Factores activos:
  - Temporal: 20 pts (mencionado múltiples veces)

**Por qué no se guarda**:
- Aunque hay repetición, el contenido no es significativo
- No alcanza el threshold de 50 puntos
- Es información trivial sobre el clima

---

## CASOS EDGE

### 🟡 CASO 1: Información ambigua (Score variable)

**Input**:
```
Usuario: "Ayer vi a un amigo"
```

**Decisión**:
- ❌ **SKIP** (Score: 21)
- Factores activos:
  - Informativo: 21 pts (persona mencionada, pero confidence baja 0.6)

**Por qué score bajo**:
- Falta el nombre del amigo (baja confidence)
- No hay contexto emocional
- No es un evento significativo por sí solo

---

### 🟡 CASO 2: Emoción sin contexto (Score: 25-30)

**Input**:
```
Usuario: "Estoy contento"
Emociones: joy=0.7
```

**Decisión**:
- ❌ **SKIP** (Score: 21)
- Factores activos:
  - Emocional: 21 pts (arousal moderado)

**Por qué no alcanza threshold**:
- Arousal no es suficientemente alto
- Falta contexto sobre POR QUÉ está contento
- Si hubiera contexto ("Estoy contento porque..."), subiría el score

---

## MÉTRICAS DEL SISTEMA

### Scoring Breakdown

| Factor | Peso Max | Criterio | Ejemplo |
|--------|----------|----------|---------|
| Emocional | 30 pts | Arousal > 0.6 | "¡Estoy emocionadísimo!" |
| Informativo | 40 pts | Nueva info personal | "Me llamo X", "Tengo X años" |
| Eventos | 50 pts | Evento significativo | Cumpleaños, médico, examen |
| Temporal | 20 pts | Mencionado 2+ veces | Preferencia repetida |

### Threshold

- **Threshold mínimo**: 50 puntos
- **Importancia normalizada**: finalScore / 100 (0-1)

### Confidence Factors

Los detectores tienen confidence que multiplica el score:

```typescript
score = WEIGHT * confidence

// Ejemplo:
// Name detection: 40 pts * 0.9 confidence = 36 pts
// Age detection: 40 pts * 0.85 confidence = 34 pts
```

---

## TIPOS DE INFORMACIÓN DETECTADOS

### Personal Info

- **name**: Nombres del usuario
- **age**: Edad
- **location**: Ciudad/país donde vive
- **occupation**: Trabajo/profesión
- **preference**: Gustos, hobbies
- **relationship**: Relaciones (novio, hermana, etc.)
- **health**: Condiciones de salud
- **goal**: Metas y objetivos

### Significant Events

- **birthday**: Cumpleaños (propios o de otros)
- **medical**: Citas médicas, operaciones
- **exam**: Exámenes, entrevistas, presentaciones
- **job_change**: Cambios de trabajo
- **relationship_change**: Cambios en relaciones
- **achievement**: Logros importantes
- **loss**: Pérdidas, duelos
- **anniversary**: Aniversarios
- **special**: Otros eventos especiales

### Important People

- **Relaciones detectadas**:
  - novio/novia, pareja, esposo/esposa
  - hermano/hermana, madre, padre
  - hijo/hija
  - amigo/amiga
  - jefe, colega
  - mascota, perro, gato

---

## USO EN CÓDIGO

```typescript
import { intelligentStorageSystem } from '@/lib/emotional-system/modules/memory/intelligent-storage';

// En el ResponseGenerator
const storageDecision = await intelligentStorageSystem.decideStorage({
  agentId: 'agent-123',
  userId: 'user-456',
  userMessage: 'Me llamo Ana',
  characterResponse: 'Encantado Ana!',
  emotions: emotionState,
  appraisal: appraisalResult,
  conversationHistory: historyBuffer,
});

// Verificar si se debe guardar
if (storageDecision.shouldStore) {
  console.log(`Storing memory with score: ${storageDecision.finalScore}`);

  // Guardar memoria
  await memorySystem.storeMemory({
    agentId,
    event: conversation,
    importance: storageDecision.importance,
  });

  // Persistir entidades (eventos, personas)
  await intelligentStorageSystem.persistDetectedEntities({
    agentId,
    userId,
    detectedEntities: storageDecision.detectedEntities,
  });
}
```

---

## VENTAJAS DEL SISTEMA

### 1. Evita False Positives
- ❌ Antes: Guardaba TODO con importance > 0.3
- ✅ Ahora: Solo guarda lo verdaderamente significativo

### 2. Multi-Factor
- No depende de UN solo factor
- Combina señales múltiples para mejor precisión

### 3. Integración Automática
- Auto-detecta eventos → ImportantEvents
- Auto-detecta personas → ImportantPeople
- Sin intervención manual del usuario

### 4. Transparencia
- Score visible y debuggeable
- Factores explicables
- Threshold configurable

### 5. Performance
- Detección basada en regex (rápida)
- Sin LLM calls para decisión
- ~5-10ms por decisión

---

## CONFIGURACIÓN

### Ajustar Threshold

```typescript
// En intelligent-storage.ts
private readonly STORAGE_THRESHOLD = 50; // Cambiar aquí

// Más estricto (menos memorias):
private readonly STORAGE_THRESHOLD = 70;

// Más permisivo (más memorias):
private readonly STORAGE_THRESHOLD = 35;
```

### Ajustar Pesos

```typescript
private readonly WEIGHTS = {
  emotional: 30,     // Aumentar para priorizar emociones
  informative: 40,   // Aumentar para priorizar info personal
  eventBased: 50,    // Aumentar para priorizar eventos
  temporal: 20,      // Aumentar para priorizar repetición
};
```

---

## ROADMAP

### Future Improvements

1. **LLM-based detection** (opcional, para casos ambiguos)
2. **Semantic similarity** para temporal factor (usando embeddings)
3. **User feedback loop** (aprender de qué guardó el usuario manualmente)
4. **Confidence calibration** (ajustar thresholds basado en historico)
5. **Multi-language support** (actualmente solo español)

---

## TESTING

Ver tests completos en: `__tests__/intelligent-storage.test.ts`

```bash
# Ejecutar tests
npm test intelligent-storage

# Ver coverage
npm test intelligent-storage -- --coverage
```
