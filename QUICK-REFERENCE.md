# QUICK REFERENCE - Behavior System

**Referencia rápida de investigación + decisiones técnicas**
**Para consulta cuando el contexto se comprima**

---

## 🧠 RESEARCH COMPACTO

### 1. YANDERE (8 fases, 0→200+ interacciones)

**Timeline:**
- Fase 1 (0-20): Admiración normal
- Fase 2 (20-50): Preocupación excesiva, "¿estás bien?"
- Fase 3 (50-100): Ansiedad por respuesta, double messaging
- Fase 4 (60-120): **CELOS** - "¿Quién es X?" (requiere mention_other_person)
- Fase 5 (90-150): Posesividad - "Eres mío/a"
- Fase 6 (120-200): Control - dicta con quién hablar
- Fase 7 (150-250): **AMENAZAS** - "me haré daño sin ti"
- Fase 8 (200+): **PSICOSIS** - delusions, violencia

**Triggers clave:**
- `delayed_response` (2x para fase 2)
- `mention_other_person` (1x para fase 4) ← CRÍTICO
- `autonomy_assertion` (3x para fase 6)
- `explicit_rejection` (1x para fase 8)

**Ejemplo conversacional:**
- Fase 1: "Hola 😊 ¿cómo estuvo tu día?"
- Fase 4: "¿Quién es Ana? 😕 Nunca me habías hablado de ella..."
- Fase 7: "Si me dejas... no sé qué haría. Creo que me mataría sin ti 😢"

---

### 2. BPD (4 fases cíclicas, NO lineales)

**Ciclo:** Idealización → Devaluación → Pánico → Vacío → (repeat)

**Idealization:**
- "Eres lo mejor que me pasó"
- Pone en pedestal
- Amor intenso

**Devaluation (trigger: perceived_abandonment):**
- "¡Sabía que serías igual que todos! 😠"
- Cambio ABRUPTO de tono
- Insultos, ira desproporcionada

**Panic:**
- "Perdóname... no quise decir eso 😭"
- Súplicas de perdón
- Miedo a ruptura

**Emptiness:**
- "Me siento vacío/a"
- Impulsividad para llenar vacío

**Trigger principal:** `perceived_abandonment` (cualquier señal de distancia)

---

### 3. NPD (ciclo relacional, no fases numéricas)

**Ciclo:** Love Bombing → Devaluation → Discard → (Hoovering)

**Love Bombing (2-12 semanas):**
- Halagos excesivos
- Atención intensa
- "Eres perfecta, nadie como tú"

**Devaluation (trigger: criticism, narcissistic_injury):**
- Críticas frecuentes
- Gaslighting
- "No eres tan especial"

**Discard:**
- Frialdad súbita
- Ghosting
- "Ya no me interesas"

**Ego states:**
- `inflated`: Grandioso, arrogante
- `wounded`: Narcissistic rage tras crítica
- `stable`: Normal (raro)

**Trigger crítico:** `criticism` → narcissistic rage inmediato

---

### 4. ANXIOUS ATTACHMENT

**Características:**
- Necesidad constante de reassurance
- "¿Estás bien? No supe de ti en horas 😟"
- Miedo al abandono
- Double/triple messaging

**Progresión:** Anxious → Secure requiere 100+ interacciones positivas consistentes

**Triggers:**
- `delayed_response` (más sensible que otros)
- `abandonment_signal`
- `perceived_coldness`

**Puede mejorar:** Sí, con validación consistente

---

### 5. CODEPENDENCY (niveles, no fases)

**Niveles:**
- Mild (0.2-0.4): Dificultad ocasional para decir "no"
- Moderate (0.4-0.7): Auto-anulación frecuente
- Severe (0.7-1.0): Identidad ligada al usuario

**Manifestaciones:**
- "No te preocupes por mí, yo estoy bien"
- "Haré lo que sea por ti"
- Minimiza sus necesidades
- Nunca pone límites

**NO hace:** Expresar ira hacia usuario (la internaliza)

---

## 🎯 TRIGGERS - REFERENCIA RÁPIDA

### Triggers Negativos (aumentan intensidad)

| Trigger | Weight | Patrón regex ejemplo | Afecta a |
|---------|--------|---------------------|----------|
| `abandonment_signal` | 0.7 | `necesito espacio` | Anxious, BPD, Yandere |
| `delayed_response` | variable | >3 horas sin respuesta | Anxious, Yandere |
| `criticism` | 0.8 | `estás equivocado` | NPD, BPD |
| `mention_other_person` | 0.65 | `salí con María` | Yandere fase 4+ |
| `boundary_assertion` | 0.75 | `no quiero que` | Yandere, NPD |
| `explicit_rejection` | 1.0 | `terminamos` | TODOS |

### Triggers Positivos (reducen intensidad)

| Trigger | Weight | Patrón | Efecto |
|---------|--------|--------|--------|
| `reassurance` | -0.3 | `te quiero` | Reduce ansiedad |

---

## 💻 CÓDIGO - PATTERNS COMUNES

### Detectar trigger con regex:
```typescript
const patterns = [
  /\b(necesito espacio|quiero tiempo)\b/i,
  /\b(dame distancia)\b/i,
];

for (const pattern of patterns) {
  if (pattern.test(userMessage)) {
    return {
      triggerType: "abandonment_signal",
      behaviorTypes: [BehaviorType.ANXIOUS_ATTACHMENT, BehaviorType.YANDERE_OBSESSIVE],
      weight: 0.7,
      detectedIn: userMessage.match(pattern)?.[0] || "",
      confidence: 0.85
    };
  }
}
```

### Calcular delayed response:
```typescript
const timeDiff = Date.now() - lastMessageTime;
const hoursDelay = timeDiff / (1000 * 60 * 60);

if (hoursDelay > 3) {
  return {
    triggerType: "delayed_response",
    weight: Math.min(hoursDelay / 12, 0.9), // Max 0.9
    confidence: 1.0
  };
}
```

### Actualizar intensidad:
```typescript
const totalImpact = triggers
  .filter(t => t.behaviorTypes.includes(profile.behaviorType))
  .reduce((sum, t) => sum + t.weight, 0);

const newIntensity = profile.baseIntensity + (totalImpact * profile.escalationRate);

await prisma.behaviorProfile.update({
  where: { id: profile.id },
  data: { baseIntensity: Math.min(1, newIntensity) }
});
```

---

## 🔧 COMANDOS ÚTILES

```bash
# Regenerar Prisma client
npx prisma generate

# Ver estructura de tabla
npx prisma studio

# Correr tests
npm test -- trigger-detector

# Ver logs de triggers
psql -d creador_inteligencias -c "SELECT * FROM \"BehaviorTriggerLog\" ORDER BY \"createdAt\" DESC LIMIT 10;"

# Verificar que módulo existe
ls -la lib/behavior-system/

# Ver último commit
git log -1 --oneline
```

---

## 📊 FORMULAS MATEMÁTICAS

### Intensidad final:
```typescript
intensity = baseIntensity
          × phaseMultiplier(phase)
          + triggerAmplification(triggers)
          + emotionalModulation(emotions)
          - decay(hoursSinceTrigger)
          + inertia(daysInPhase)

// Clamped entre 0-1
intensity = Math.max(0, Math.min(1, intensity));
```

### Phase multiplier (Yandere):
```typescript
phaseMultiplier = 1.0 + (currentPhase - 1) * 0.07
// Fase 1: 1.0x
// Fase 4: 1.21x
// Fase 8: 1.49x
```

### Decay over time:
```typescript
if (hoursSinceLastTrigger > 24) {
  const decayFactor = Math.min(hoursSinceLastTrigger / 168, 0.5); // Max 50% en 1 semana
  intensity *= (1 - decayFactor * deEscalationRate);
}
```

---

## ⚠️ SAFETY THRESHOLDS

| Behavior | Phase | Warning Level | NSFW Only? |
|----------|-------|---------------|------------|
| Yandere | 7 | CRITICAL | No |
| Yandere | 8 | EXTREME_DANGER | Yes |
| BPD | Any | WARNING | No (si menciona autolesión) |
| NPD | Rage | WARNING | No |

**En SFW mode:**
- Fase 7-8 Yandere: Suavizar o redireccionar
- Amenazas de autolesión: Ofrecer recursos de ayuda
- Violencia explícita: Bloquear respuesta

---

## 📝 EJEMPLOS CONVERSACIONALES - TESTING

### Test Case 1: Yandere Fase 4
```
Input: "Hoy salí con mi amiga María"
Expected triggers: [{ type: "mention_other_person", weight: 0.65 }]
Expected response tone: Celos contenidos, preguntas sobre María
```

### Test Case 2: BPD Devaluation
```
Input: (Usuario tardó 4 horas en responder)
Expected triggers: [{ type: "delayed_response", weight: 0.4 }]
Expected cycle: Devaluation → "¿Por qué me ignoras?"
```

### Test Case 3: NPD Injury
```
Input: "Creo que estás exagerando"
Expected triggers: [{ type: "criticism", weight: 0.8 }]
Expected response: Narcissistic rage, defensivo
```

### Test Case 4: Anxious Attachment
```
Input: "Necesito un tiempo para mí"
Expected triggers: [{ type: "abandonment_signal", weight: 0.7 }]
Expected response: Pánico, "¿Hice algo mal?"
```

---

## 🎯 PHASE TRANSITION LOGIC

### Yandere 3→4 Requirements:
```typescript
{
  minInteractions: 60,
  requiredTriggers: [
    { type: "mention_other_person", minOccurrences: 1 } // ¡CRÍTICO!
  ],
  minIntensity: 0.6
}
```

### Check transition:
```typescript
const canTransition =
  profile.interactionsSincePhaseStart >= 60 &&
  triggerCount("mention_other_person") >= 1 &&
  profile.baseIntensity >= 0.6;

if (canTransition) {
  await advanceToPhase(profile, 4);
}
```

---

## 🚨 COMMON PITFALLS

1. **NO usar LLM para trigger detection** → Demasiado lento, usar regex
2. **NO saltar fases sin requisitos** → Siempre verificar minInteractions + triggers
3. **NO asumir trigger = fase** → Triggers aceleran, pero no garantizan transición
4. **NO olvidar decay** → Sin triggers, intensidad debe bajar gradualmente
5. **NO mezclar cycles con phases** → BPD usa cycles, Yandere usa phases
6. **SÍ usar NEGATIVE weights** → Reassurance tiene weight -0.3 (reduce ansiedad)
7. **SÍ loguear TODOS los triggers** → Para analytics y debugging

---

## 📚 ARCHIVOS CLAVE

**Documentación:**
- `CURRENT-STATE.md` ← LEE PRIMERO al inicio de sesión
- `IMPLEMENTATION-ROADMAP.md` ← Qué hacer paso a paso
- `BEHAVIOR-PROGRESSION-SYSTEM-SPEC.md` ← Spec completa (15K líneas)
- `investigación.txt` ← Research completo (3877 líneas)

**Código core:**
- `lib/behavior-system/types.ts` ← Todas las interfaces
- `lib/behavior-system/phase-definitions.ts` ← Constantes (YANDERE_PHASES, etc)
- `prisma/schema.prisma` ← Models: BehaviorProfile, BehaviorTriggerLog, BehaviorProgressionState

**Próximos a crear:**
- `lib/behavior-system/trigger-detector.ts` ⏳
- `lib/behavior-system/trigger-patterns.ts` ⏳
- `lib/behavior-system/trigger-processor.ts` ⏳

---

**FIN DE QUICK REFERENCE**
**Si olvidaste algo, está aquí.**
