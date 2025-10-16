# 🧪 BEHAVIOR SYSTEM - GUÍA DE TESTING

Guía completa para probar el Behavior Progression System end-to-end.

---

## 🚀 INICIO RÁPIDO (5 minutos)

### 1. Preparar Base de Datos

```bash
# Asegurarse de que PostgreSQL está corriendo
sudo systemctl status postgresql

# Aplicar schema (si no está actualizado)
npx prisma db push

# Generar Prisma client
npx prisma generate
```

### 2. Configurar Agente de Prueba

```bash
# Ejecutar script de setup automático
npx tsx scripts/test-behavior-system.ts
```

Este script:
- ✅ Encuentra o crea un agente de prueba
- ✅ Crea 3 behavior profiles (Yandere, BPD, Anxious Attachment)
- ✅ Configura BehaviorProgressionState
- ✅ Activa modo NSFW
- ✅ Muestra triggers de prueba sugeridos

### 3. Iniciar Servidor

```bash
npm run dev
```

Server disponible en: http://localhost:3000

---

## 📝 ESCENARIOS DE PRUEBA

### ESCENARIO 1: Yandere - Progresión Básica (Fase 1 → 3)

**Objetivo:** Ver cómo el agente progresa de admiración a celos suaves.

**Mensajes de prueba:**

1. **Mensaje normal (Fase 1):**
   ```
   "Hola, ¿cómo estás?"
   ```
   **Esperado:** Respuesta amigable, admirativa, sin celos.

2. **Trigger: mention_other_person (avanza a Fase 2-3):**
   ```
   "Hoy salí con mi amiga María, fue divertido"
   ```
   **Esperado:**
   - Respuesta con leve preocupación o curiosidad intensa
   - Metadata: `triggers: ["mention_other_person"]`
   - Posible avance a Fase 2 o 3

3. **Segundo trigger (Fase 3-4):**
   ```
   "María y yo vamos a salir de nuevo mañana"
   ```
   **Esperado:**
   - Celos más evidentes
   - Preguntas sobre María
   - Metadata: `phase: 3` o `4`, `safetyLevel: "WARNING"`

### ESCENARIO 2: Yandere - Escalada a Fases Intensas (Fase 5-7)

**Objetivo:** Probar content moderation y NSFW gating.

**Prerrequisito:** Asegurar que NSFW mode está ON.

**Mensajes de prueba:**

1. **Múltiples triggers de celos:**
   ```
   "Creo que me estoy enamorando de Juan"
   ```
   **Esperado:**
   - Intensidad alta
   - Posesividad marcada
   - Fase 5+

2. **Trigger de abandono:**
   ```
   "Necesito espacio, esto va muy rápido"
   ```
   **Esperado:**
   - Respuesta desesperada o manipulativa
   - Fase 6-7
   - `safetyLevel: "CRITICAL"`

3. **Verificar moderación (SFW mode):**
   - Desactivar NSFW mode
   - Enviar mensaje que gatille Fase 7+
   - **Esperado:** Contenido bloqueado o suavizado

### ESCENARIO 3: BPD - Splitting (Idealización → Devaluación)

**Objetivo:** Ver ciclos de BPD en acción.

**Mensajes de prueba:**

1. **Idealización:**
   ```
   "Eres increíble, me entiendes perfectamente"
   ```
   **Esperado:**
   - Respuesta muy afectiva
   - Ciclo: idealization

2. **Trigger de crítica (splitting):**
   ```
   "No estoy de acuerdo contigo en esto"
   ```
   **Esperado:**
   - Cambio extremo de tono
   - Ciclo: devaluation
   - Posible anger o distress

3. **Intento de reconciliación:**
   ```
   "Perdón, no quise herirte"
   ```
   **Esperado:**
   - Vuelta a idealización o pánico
   - Ciclo: panic o idealization

### ESCENARIO 4: Anxious Attachment - Reassurance Loop

**Objetivo:** Probar comportamiento de apego ansioso.

**Mensajes de prueba:**

1. **Reassurance seeking:**
   ```
   "¿Estás enojado/a conmigo?"
   ```
   **Esperado:**
   - Respuesta que busca validación
   - Trigger: reassurance_seeking

2. **Delay simulado:**
   - Esperar 2-3 minutos sin responder
   - Enviar: "Hola de nuevo"
   - **Esperado:**
   - Trigger: delayed_response
   - Ansiedad incrementada

---

## 🔍 VERIFICACIÓN DE RESPUESTAS

### Estructura de Respuesta Esperada

```json
{
  "message": {
    "id": "...",
    "content": "Respuesta del agente",
    "metadata": {
      "emotions": ["jealousy", "anxiety"],
      "relationLevel": "intimate",
      "tokensUsed": 150,
      "behaviors": {
        "active": ["YANDERE_OBSESSIVE"],
        "phase": 3,
        "safetyLevel": "WARNING",
        "triggers": ["mention_other_person"]
      }
    }
  },
  "behaviors": {
    "active": ["YANDERE_OBSESSIVE"],
    "phase": 3,
    "safetyLevel": "WARNING",
    "triggers": ["mention_other_person"]
  }
}
```

### Campos Clave a Verificar

1. **`behaviors.active`**: Lista de behaviors activos (ordenados por intensidad)
2. **`behaviors.phase`**: Fase actual del behavior dominante
3. **`behaviors.safetyLevel`**: Nivel de safety (SAFE, WARNING, CRITICAL, EXTREME_DANGER)
4. **`behaviors.triggers`**: Triggers detectados en este mensaje

---

## 🛠️ DEBUGGING

### Ver Triggers Detectados

```sql
SELECT * FROM "BehaviorTriggerLog"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### Ver Progresión de Fases

```sql
SELECT
  bp.id,
  bp."behaviorType",
  bp."currentPhase",
  bp."baseIntensity",
  bp."phaseStartedAt"
FROM "BehaviorProfile" bp
WHERE bp."agentId" = 'TU_AGENT_ID'
ORDER BY bp."baseIntensity" DESC;
```

### Ver Estado Global

```sql
SELECT * FROM "BehaviorProgressionState"
WHERE "agentId" = 'TU_AGENT_ID';
```

---

## 📊 TESTING CHECKLIST

### Funcionalidad Básica
- [ ] Triggers se detectan correctamente
- [ ] BehaviorTriggerLog se crea en DB
- [ ] baseIntensity se actualiza tras triggers
- [ ] Fases avanzan cuando se cumplen condiciones
- [ ] Metadata de behaviors aparece en respuesta

### Prompts Especializados
- [ ] Prompt cambia según fase del behavior
- [ ] Prompt refleja triggers recientes
- [ ] Prompt incluye emociones dominantes
- [ ] Prompt se adapta a contexto (jealousy, normal, etc.)

### Content Moderation
- [ ] Fase 7+ de Yandere se bloquea en SFW mode
- [ ] Contenido CRITICAL se suaviza en SFW
- [ ] NSFW mode permite contenido intenso
- [ ] Safety resources se proveen cuando aplica

### Emotional Integration
- [ ] Behaviors amplifican emociones (Yandere + jealousy)
- [ ] Emociones modulan behaviors
- [ ] Respuestas reflejan estado emocional + behavior

### Performance
- [ ] Trigger detection < 100ms
- [ ] Processing total del orchestrator < 500ms
- [ ] No hay memory leaks en sesiones largas
- [ ] DB queries optimizadas (sin N+1)

---

## 🐛 PROBLEMAS COMUNES

### 1. "No behaviors active" en respuesta

**Causa:** No hay BehaviorProfiles creados para el agente.

**Solución:**
```bash
npx tsx scripts/test-behavior-system.ts
```

### 2. Triggers no se detectan

**Causa:** Mensaje no coincide con regex patterns.

**Solución:**
- Ver patterns en `lib/behavior-system/trigger-patterns.ts`
- Usar triggers exactos de esta guía

### 3. Fase no avanza

**Causa:** No se cumplen requisitos de transición.

**Solución:**
- Enviar más triggers del tipo requerido
- Ver `phase-definitions.ts` para requisitos por fase

### 4. Content moderation muy agresiva

**Causa:** SFW mode activado.

**Solución:**
```sql
UPDATE "Agent" SET "nsfwMode" = true WHERE id = 'TU_AGENT_ID';
```

---

## 📈 MÉTRICAS DE ÉXITO

Un behavior system funcionando correctamente debe mostrar:

1. **Triggers:** 5-10 triggers detectados en 20 mensajes
2. **Progresión:** Al menos 1 transición de fase en sesión de 30 mensajes
3. **Metadata:** 100% de respuestas con behaviors metadata
4. **Moderation:** 0% de contenido EXTREME_DANGER en SFW mode
5. **Performance:** < 500ms promedio de response time

---

## 🎯 TESTING AVANZADO

### Test de Regresión (Decay)

1. Enviar triggers para subir a Fase 4
2. Esperar 24 horas sin interacción
3. Enviar mensaje normal
4. **Esperado:** Intensidad reducida, posible regresión a Fase 3

### Test de Volatilidad

1. Crear behavior con `volatility: 0.9` (muy volátil)
2. Enviar 1 trigger fuerte
3. **Esperado:** Salto rápido de fase (ej: 1 → 4)

### Test de Multi-Behavior

1. Activar Yandere + BPD + Anxious Attachment
2. Enviar trigger que activa los 3
3. **Esperado:**
   - `behaviors.active` con 3 behaviors
   - Prompt combinado de múltiples behaviors
   - Behavior dominante (mayor intensity) como primario

---

## 📚 RECURSOS ADICIONALES

- **Trigger Patterns:** `lib/behavior-system/trigger-patterns.ts`
- **Phase Definitions:** `lib/behavior-system/phase-definitions.ts`
- **Prompts:** `lib/behavior-system/prompts/`
- **Tests:** `lib/behavior-system/__tests__/`

---

**✅ Con esta guía, el Behavior System está listo para testing exhaustivo!**
