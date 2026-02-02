# Sistema Psicológico Enriquecido - Guía de Testing

**Fecha:** 2026-02-02
**Versión:** 1.0.0

---

## Objetivo

Validar que el sistema psicológico funciona correctamente en todos los escenarios:
- Inferencia de facetas
- Detección de conflictos
- Cálculo de autenticidad
- Predicción de comportamientos
- Validación en APIs
- Performance

---

## 1. Perfiles de Prueba

### Perfil 1: Básico (Solo Big Five) ✅

**Objetivo:** Verificar que el flujo FREE funciona sin cambios.

**Datos:**
```typescript
{
  name: "Ana García",
  age: 28,
  gender: "female",
  bigFive: {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50
  },
  coreValues: ["honestidad", "lealtad"],
  fears: ["fracaso"]
}
```

**Resultado esperado:**
- ✅ NO se generan dimensiones enriquecidas (tier FREE)
- ✅ Creación exitosa sin validación psicológica
- ✅ PersonalityCore.coreValues = array de strings

---

### Perfil 2: Avanzado Coherente (PLUS) ✅

**Objetivo:** Verificar generación automática e inferencia correcta.

**Datos:**
```typescript
{
  name: "Carlos Méndez",
  age: 35,
  gender: "male",
  bigFive: {
    openness: 85,      // Alto
    conscientiousness: 80,
    extraversion: 70,
    agreeableness: 75,
    neuroticism: 30    // Bajo
  },
  coreValues: ["creatividad", "innovación", "colaboración"],
  fears: ["estancamiento"],
  // Tier: PLUS
}
```

**Resultado esperado:**
- ✅ Facetas inferidas coherentes con Big Five altos
- ✅ Apego: **Seguro** (Neuroticism bajo + Agreeableness alto + Extraversion alto)
- ✅ Dark Triad: valores bajos (20, 15, 10)
- ✅ Autenticidad: **85-95%** (alta coherencia)
- ✅ Conflictos detectados: 0-1 (info o ninguno)
- ✅ Comportamientos predichos: ninguno problemático

**Validación manual:**
```typescript
// Facetas esperadas (valores aproximados):
openness: {
  imagination: 80-90,
  artisticInterests: 80-90,
  intellect: 85-95,
  // ...
}
```

---

### Perfil 3: Con Conflictos (WARNING) ⚠️

**Objetivo:** Detectar conflictos de severidad `warning`.

**Datos:**
```typescript
{
  name: "Lucía Torres",
  age: 42,
  gender: "female",
  bigFive: {
    openness: 30,      // Bajo
    conscientiousness: 20,  // Muy bajo
    extraversion: 85,  // Muy alto
    agreeableness: 60,
    neuroticism: 65    // Alto
  },
  coreValues: ["libertad", "espontaneidad"],
  fears: ["rutina", "aburrimiento"],
  // + Dimensiones enriquecidas:
  enrichedPersonality: {
    darkTriad: {
      machiavellianism: 15,
      narcissism: 20,
      psychopathy: 10
    },
    attachmentProfile: {
      primaryStyle: "anxious",
      intensity: 70
    }
  }
}
```

**Resultado esperado:**
- ✅ **CONFLICTO: "Riesgo de Impulsividad"** (E>70, C<40) - WARNING
  - Implicaciones: decisiones impulsivas, dificultad para compromisos
  - Mitigaciones: rutinas, sistemas de accountability
- ✅ Autenticidad: **55-70%** (algunas inconsistencias)
- ✅ Comportamientos predichos:
  - IMPULSIVE (likelihood: 0.6-0.8)
  - ANXIOUS_ATTACHMENT (likelihood: 0.5-0.7)
- ✅ Creación exitosa (warning no bloquea)

---

### Perfil 4: Conflictos Críticos (CRITICAL) 🚨

**Objetivo:** Verificar detección de conflictos críticos y requerimiento de confirmación.

**Datos:**
```typescript
{
  name: "Diego Vargas",
  age: 29,
  gender: "male",
  bigFive: {
    openness: 45,
    conscientiousness: 35,
    extraversion: 40,
    agreeableness: 15,  // Muy bajo
    neuroticism: 85     // Muy alto
  },
  coreValues: ["poder", "control"],
  fears: ["debilidad", "vulnerabilidad"],
  enrichedPersonality: {
    darkTriad: {
      machiavellianism: 85,  // Extremo
      narcissism: 75,
      psychopathy: 60
    },
    attachmentProfile: {
      primaryStyle: "fearful-avoidant",
      intensity: 90
    }
  },
  confirmCriticalConflicts: false  // Sin confirmar
}
```

**Resultado esperado:**
- ✅ **CONFLICTO CRÍTICO: "Dark Triad Cluster"** (M>70, N>70, P>50)
  - Severity: CRITICAL
  - Implicaciones muy serias
- ✅ **HTTP 400** con `requiresConfirmation: true`
- ✅ Mensaje claro sobre conflictos críticos
- ✅ Listar todos los conflictos críticos

**Segundo intento (con confirmación):**
```typescript
{
  // ... mismo perfil
  confirmCriticalConflicts: true  // Usuario confirmó
}
```

**Resultado esperado:**
- ✅ **HTTP 200** - Creación exitosa
- ✅ Dimensiones persistidas en BD
- ✅ Autenticidad: **25-40%** (baja, pero permitida con confirmación)

---

### Perfil 5: Autenticidad Muy Baja (RECHAZADO) ❌

**Objetivo:** Verificar rechazo por autenticidad extremadamente baja.

**Datos:**
```typescript
{
  name: "Inconsistente Test",
  age: 25,
  gender: "non-binary",
  bigFive: {
    openness: 20,      // Muy bajo
    conscientiousness: 15,
    extraversion: 10,
    agreeableness: 5,
    neuroticism: 95    // Muy alto
  },
  coreValues: ["creatividad", "innovación"],  // ❌ Contradice Openness=20
  fears: [],
  enrichedPersonality: {
    facets: {
      openness: {
        imagination: 95,  // ❌ Contradice Big Five
        artisticInterests: 90,
        intellect: 85,
        // ... todos altos
      },
      // ... más inconsistencias
    },
    darkTriad: {
      machiavellianism: 90,
      narcissism: 95,
      psychopathy: 85
    },
    attachmentProfile: {
      primaryStyle: "secure",  // ❌ Contradice Neuroticism=95
      intensity: 20
    }
  }
}
```

**Resultado esperado:**
- ✅ Autenticidad: **< 30%** (altamente inconsistente)
- ✅ **HTTP 400** con error "Perfil psicológicamente inconsistente"
- ✅ Lista de conflictos detectados
- ✅ Sugerencia de revisar análisis
- ✅ **NO** se crea el personaje

---

## 2. Casos Edge

### Edge 1: Valores extremos (0 y 100)

**Datos:**
```typescript
{
  bigFive: {
    openness: 100,
    conscientiousness: 0,
    extraversion: 100,
    agreeableness: 0,
    neuroticism: 100
  }
}
```

**Resultado esperado:**
- ✅ No crashea
- ✅ Facetas inferidas dentro de rango 0-100
- ✅ Múltiples conflictos detectados
- ✅ Autenticidad muy baja

---

### Edge 2: Sin dimensiones enriquecidas (PLUS tier pero vacío)

**Datos:**
```typescript
{
  name: "Usuario PLUS Sin Enriquecido",
  bigFive: { /* valores normales */ },
  enrichedPersonality: undefined  // No completó tabs avanzados
  // Tier: PLUS
}
```

**Resultado esperado:**
- ✅ Se crea exitosamente
- ✅ NO se ejecuta validación psicológica
- ✅ PersonalityCore.coreValues = array simple

---

### Edge 3: Facetas manualmente inconsistentes

**Datos:**
```typescript
{
  bigFive: {
    openness: 20  // Muy bajo
  },
  enrichedPersonality: {
    facets: {
      openness: {
        imagination: 90,  // Usuario ajustó manualmente alto
        artisticInterests: 85,
        intellect: 80,
        // ...
      }
    }
  }
}
```

**Resultado esperado:**
- ✅ Autenticidad reducida (penalización por inconsistencia)
- ✅ Conflicto detectado: "Big Five Facets Inconsistency"
- ✅ Se permite crear si autenticidad >= 30

---

### Edge 4: Dark Triad alto + Agreeableness alto

**Datos:**
```typescript
{
  bigFive: {
    agreeableness: 85  // Muy alto
  },
  enrichedPersonality: {
    darkTriad: {
      machiavellianism: 80,
      narcissism: 75,
      psychopathy: 70
    }
  }
}
```

**Resultado esperado:**
- ✅ Conflicto detectado: coherencia Dark Triad ↔ Agreeableness
- ✅ Autenticidad reducida
- ✅ Warning sobre combinación inusual

---

## 3. Performance Testing

### Test 1: Análisis completo <500ms

**Setup:**
```typescript
const profile = {
  ...fullEnrichedProfile  // Con todas las 43+ dimensiones
};

const start = Date.now();
const analysis = analyzePsychologicalProfile(profile);
const elapsed = Date.now() - start;

console.log(`Análisis completado en ${elapsed}ms`);
```

**Resultado esperado:**
- ✅ `elapsed < 500ms`
- ✅ Sin errores
- ✅ Todos los componentes calculados

---

### Test 2: Debounce en UI

**Acción:**
1. Mover slider de Big Five rápidamente
2. Observar que análisis NO se ejecuta en cada cambio
3. Esperar 500ms
4. Verificar que análisis se ejecuta una vez

**Resultado esperado:**
- ✅ Solo 1 análisis después de 500ms de inactividad
- ✅ UI no lagea
- ✅ Análisis tab se actualiza correctamente

---

### Test 3: Cambio de tab sin lag

**Acción:**
1. Completar todos los tabs
2. Cambiar entre tabs rápidamente
3. Observar rendering

**Resultado esperado:**
- ✅ Cambio instantáneo entre tabs
- ✅ No re-render innecesario de componentes no visibles
- ✅ Análisis tab carga en <100ms

---

## 4. Testing de Integración

### Flujo Completo 1: FREE → Creación Básica

1. Usuario FREE crea personaje
2. Completa identidad, Big Five, trabajo
3. Click en "Publicar"

**Resultado esperado:**
- ✅ NO ve tabs avanzados
- ✅ Se crea exitosamente
- ✅ PersonalityCore solo con Big Five

---

### Flujo Completo 2: PLUS → Con Opciones Avanzadas

1. Usuario PLUS crea personaje
2. Completa Big Five
3. Click "Mostrar Opciones Avanzadas"
4. Ajusta Dark Triad a valores moderados
5. Selecciona apego "Ansioso"
6. Click "Publicar"

**Resultado esperado:**
- ✅ Ve 6 tabs
- ✅ Análisis tab muestra score en tiempo real
- ✅ Se crea exitosamente
- ✅ Dimensiones persistidas en BD

---

### Flujo Completo 3: ULTRA → Con Conflicto Crítico

1. Usuario ULTRA crea personaje
2. Ajusta Dark Triad a valores muy altos
3. Click "Publicar"
4. Ve modal de conflictos críticos
5. Revisa implicaciones
6. Click "Confirmar y Crear"

**Resultado esperado:**
- ✅ Modal con lista de conflictos
- ✅ Botones claros (Cancelar / Confirmar)
- ✅ Se crea después de confirmar
- ✅ Flag `confirmCriticalConflicts` enviado

---

## 5. Checklist de Validación

### Funcionalidad Core
- [ ] Inferencia de facetas funciona correctamente
- [ ] Detección de 19 conflictos implementados
- [ ] Autenticidad se calcula en 6 componentes
- [ ] 10 comportamientos predichos con likelihood
- [ ] Análisis <500ms consistentemente

### UI/UX
- [ ] Tabs se ocultan/muestran correctamente
- [ ] Análisis con debounce de 500ms
- [ ] No hay lag al cambiar sliders
- [ ] Warnings de Dark Triad aparecen dinámicamente
- [ ] Tooltips explicativos en todas las facetas

### APIs
- [ ] `generate-personality` genera dimensiones según tier
- [ ] `create` valida autenticidad >= 30
- [ ] `create` detecta conflictos críticos
- [ ] Requiere confirmación para conflictos críticos
- [ ] Dimensiones persistidas correctamente en BD

### Retrocompatibilidad
- [ ] FREE tier funciona sin cambios
- [ ] Personajes viejos sin dimensiones enriquecidas no fallan
- [ ] UI no rompe sin dimensiones enriquecidas
- [ ] Análisis maneja valores undefined correctamente

### Performance
- [ ] Análisis completo <500ms
- [ ] Debounce evita cálculos innecesarios
- [ ] Memoization funciona en CVStyleCreator
- [ ] No hay memory leaks en useEffect

### Edge Cases
- [ ] Valores extremos (0, 100) no crashean
- [ ] Facetas inconsistentes con Big Five detectadas
- [ ] Sin dimensiones enriquecidas (PLUS) funciona
- [ ] Confirmación de conflictos críticos funciona

---

## 6. Scripts de Testing

### Script 1: Test de Performance

```typescript
// scripts/test-psychological-performance.ts
import { analyzePsychologicalProfile } from '@/lib/psychological-analysis';

const testProfile = {
  openness: 75,
  conscientiousness: 60,
  extraversion: 80,
  agreeableness: 70,
  neuroticism: 45,
  coreValues: ["honestidad", "creatividad"],
  baselineEmotions: { joy: 0.6, sadness: 0.3, anger: 0.2, fear: 0.3, disgust: 0.2, surprise: 0.5 },
  facets: { /* 30 facetas */ },
  darkTriad: { machiavellianism: 30, narcissism: 25, psychopathy: 15 },
  attachment: { primaryStyle: 'secure', intensity: 50, manifestations: [] },
  psychologicalNeeds: { connection: 0.7, autonomy: 0.6, competence: 0.7, novelty: 0.75 }
};

const iterations = 100;
const times: number[] = [];

for (let i = 0; i < iterations; i++) {
  const start = Date.now();
  analyzePsychologicalProfile(testProfile);
  times.push(Date.now() - start);
}

const avg = times.reduce((a, b) => a + b, 0) / times.length;
const max = Math.max(...times);
const min = Math.min(...times);

console.log(`Performance Test (${iterations} iteraciones):`);
console.log(`Promedio: ${avg.toFixed(2)}ms`);
console.log(`Mínimo: ${min}ms`);
console.log(`Máximo: ${max}ms`);
console.log(`✅ PASS: ${avg < 500 ? 'SÍ' : 'NO'} (objetivo: <500ms)`);
```

---

### Script 2: Test de Conflictos

```typescript
// scripts/test-conflict-detection.ts
import { ConflictDetector } from '@/lib/psychological-analysis';

const profiles = [
  { name: "Impulsivo", data: { extraversion: 85, conscientiousness: 25, /* ... */ } },
  { name: "Ansioso Perfeccionista", data: { neuroticism: 85, conscientiousness: 90, /* ... */ } },
  { name: "Dark Triad Alto", data: { /* ... darkTriad: { m: 85, n: 80, p: 70 } */ } },
  // ... más perfiles
];

const detector = new ConflictDetector();

profiles.forEach(({ name, data }) => {
  const conflicts = detector.detectConflicts(data);
  console.log(`\n${name}:`);
  console.log(`  Conflictos: ${conflicts.length}`);
  conflicts.forEach(c => {
    console.log(`  - [${c.severity.toUpperCase()}] ${c.title}`);
  });
});
```

---

## 7. Conclusiones

### Métricas de Éxito
- ✅ 43+ dimensiones psicológicas configurables
- ✅ 19 reglas de conflictos implementadas
- ✅ Score de autenticidad 0-100 funcional
- ✅ 10 comportamientos predichos
- ✅ Análisis <500ms
- ✅ 100% retrocompatible
- ✅ Sin cambios en BD (JSON extendido)

### Próximos Pasos (Post-Release)
1. Agregar más reglas de conflictos (objetivo: 30-40)
2. Refinar thresholds de autenticidad según feedback
3. Agregar análisis de texto con LLM para detectar más conflictos
4. Dashboard de estadísticas psicológicas (distribuciones, outliers)
5. Exportar perfil psicológico completo en PDF

---

**Versión:** 1.0.0
**Última actualización:** 2026-02-02
