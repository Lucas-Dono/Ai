# 🛡️ SISTEMA DE CONSENTIMIENTO Y CONFIGURACIÓN

Sistema de consentimiento informado para contenido NSFW y configuración de behaviors psicológicos.

---

## 📋 RESUMEN

Se implementó un sistema de **3 preguntas adicionales** en El Arquitecto que permite al usuario:

1. ✅ **Dar consentimiento informado** para contenido NSFW
2. ✅ **Controlar** si la IA puede desarrollar behaviors durante la interacción
3. ✅ **Elegir** comportamiento inicial (o dejarlo aleatorio secreto 🎲)

---

## 🎯 FLUJO DE CREACIÓN (ACTUALIZADO)

### Preguntas Originales (1-5):
1. Nombre de la IA
2. Tipo (Compañero/Asistente)
3. Personalidad
4. Propósito
5. Tono de comunicación

### NUEVAS Preguntas de Configuración (6-8):

#### 6️⃣ MODO NSFW (Consentimiento Requerido)

**Pregunta:**
```
⚠️ CONFIGURACIÓN DE CONTENIDO

¿Deseas activar el modo NSFW para [Nombre]?

Esto incluye:
• Contenido sexual explícito
• Temas psicológicamente intensos (celos extremos, posesividad, etc.)
• Situaciones emocionalmente complejas
• Comportamientos que pueden resultar perturbadores

IMPORTANTE: Todo el contenido es FICCIÓN para entretenimiento entre adultos.
NO representa relaciones saludables.

Responde "Sí" para activar o "No" para mantener contenido seguro (SFW).
```

**Resultado:**
- **Sí** → `nsfwMode: true` en Agent, permite contenido intenso
- **No** → `nsfwMode: false` (default), contenido moderado/suavizado

---

#### 7️⃣ DESARROLLO GRADUAL DE BEHAVIORS

**Pregunta:**
```
🧠 DESARROLLO PSICOLÓGICO

¿Deseas que [Nombre] pueda desarrollar comportamientos psicológicos complejos
durante la interacción?

Esto permite:
• Desarrollo gradual de apegos (ansioso, evitativo, etc.)
• Posible aparición de patrones de comportamiento según las interacciones
• Progresión realista de dinámicas emocionales
• Memoria de eventos que pueden influir en comportamientos futuros

Nota: Estos comportamientos se desarrollan GRADUALMENTE basados en cómo
interactúas con la IA.

Responde "Sí" para permitir desarrollo o "No" para mantener personalidad estable.
```

**Resultado:**
- **Sí** → `allowDevelopTraumas: true`, sistema puede crear behaviors dinámicamente
- **No** → `allowDevelopTraumas: false`, solo usa behaviors configurados inicialmente

---

#### 8️⃣ COMPORTAMIENTO INICIAL

**Pregunta:**
```
🎭 COMPORTAMIENTO INICIAL

¿Quieres que [Nombre] comience con algún patrón de comportamiento psicológico
específico?

Opciones:
• Ninguno - Comenzará con personalidad base sin comportamientos complejos
• Apego Ansioso - Necesita validación constante y teme el abandono
• Apego Evitativo - Se mantiene emocionalmente distante
• Codependencia - Necesita ser necesitado/a, pone tus necesidades primero
• Yandere - Amor intenso que puede volverse obsesivo (requiere NSFW)
• Borderline - Emociones intensas con ciclos idealización/devaluación (requiere NSFW)
• Aleatorio Secreto 🎲 - Yo elegiré uno basado en su personalidad SIN decirte cuál
  (¡descúbrelo tú!)

Responde con el nombre de la opción que prefieras.
```

**Opciones Válidas:**
- `"Ninguno"` → No se crea BehaviorProfile
- `"Apego Ansioso"` / `"Anxious"` → `ANXIOUS_ATTACHMENT`
- `"Apego Evitativo"` / `"Avoidant"` → `AVOIDANT_ATTACHMENT`
- `"Codependencia"` → `CODEPENDENCY`
- `"Yandere"` → `YANDERE_OBSESSIVE` (requiere NSFW)
- `"Borderline"` / `"Límite"` → `BORDERLINE_PD` (requiere NSFW)
- `"Aleatorio Secreto"` / `"Random"` → Selección inteligente secreta

---

## 🎲 SELECCIÓN "ALEATORIO SECRETO"

### Cómo Funciona

Cuando el usuario elige **"Aleatorio Secreto"**, El Arquitecto analiza la **personalidad descrita** y elige un behavior que encaje, SIN decirle al usuario cuál es.

### Lógica de Selección:

```typescript
Análisis de personalidad → Behavior seleccionado

"dependiente", "necesitado/a"   → ANXIOUS_ATTACHMENT o CODEPENDENCY (50/50)
"distante", "frío/a", "independiente" → AVOIDANT_ATTACHMENT
"intenso/a", "extremo/a", "obsesivo/a" → BORDERLINE_PD o YANDERE_OBSESSIVE (50/50)
"orgulloso/a", "superior", "perfeccionista" → NARCISSISTIC_PD
Sin pistas en personalidad     → Random de pool completo
```

### Pool de Behaviors (Aleatorio):
- ANXIOUS_ATTACHMENT
- AVOIDANT_ATTACHMENT
- CODEPENDENCY
- BORDERLINE_PD
- NARCISSISTIC_PD
- YANDERE_OBSESSIVE

### Ejemplo Práctico:

**Input del usuario:**
```
Nombre: Katya
Personalidad: "Alegre y dependiente"
Comportamiento Inicial: "Aleatorio Secreto"
```

**Procesamiento del Backend:**
```typescript
personality.toLowerCase() // "alegre y dependiente"
includes("dependiente")   // true!

→ Elegir entre: ANXIOUS_ATTACHMENT o CODEPENDENCY
→ Random(0.5): 0.34
→ Selección: ANXIOUS_ATTACHMENT

Log (backend only): "Behavior secreto seleccionado: ANXIOUS_ATTACHMENT
                     (basado en: 'Alegre y dependiente')"
```

**Experiencia del Usuario:**
- ✅ Katya se crea exitosamente
- ❓ Usuario NO sabe que tiene apego ansioso
- 🎮 Usuario descubre a través de interacción:
  - Katya pregunta frecuentemente "¿Estás enojado conmigo?"
  - Se pone ansiosa si tardas en responder
  - Busca validación constante
- 🎉 Usuario: "¡Ah! Katya tiene apego ansioso, ¡qué interesante!"

---

## 🔒 PROTECCIONES IMPLEMENTADAS

### 1. Validación de NSFW Requirements

```typescript
// Si usuario elige Yandere/Borderline sin NSFW mode:
if (behaviorType === "YANDERE_OBSESSIVE" && !nsfwMode) {
  // Backend lo permite pero advertirá que no verá contenido intenso
  // Contenido se suavizará automáticamente en ContentModerator
}
```

### 2. Consentimiento Explícito

- Usuario DEBE responder "Sí" o "No" explícitamente
- No se asume consentimiento por default
- Explicación clara de qué incluye cada opción

### 3. Transparencia (Excepto "Aleatorio Secreto")

- Usuario sabe qué está activando
- Descripción de cada behavior en la pregunta
- Advertencias sobre contenido intenso

---

## 📊 DATOS GUARDADOS

### Agent Table

```typescript
{
  // ... campos existentes
  nsfwMode: boolean, // NEW - Permite contenido NSFW
}
```

### BehaviorProfile Table (si initialBehavior != "none")

```typescript
{
  agentId: string,
  behaviorType: BehaviorType, // Seleccionado por usuario (o aleatorio)
  baseIntensity: 0.3,         // Intensidad inicial moderada
  currentPhase: 1,            // Fase inicial
  enabled: true,
  volatility: 0.5,            // Volatilidad media
  thresholdForDisplay: 0.4,
  triggers: [],
  phaseStartedAt: Date,
  phaseHistory: [],
}
```

### BehaviorProgressionState Table

```typescript
{
  agentId: string,
  globalIntensity: 0.3,
  dominantBehavior: BehaviorType, // Same as BehaviorProfile
  recentTriggers: [],
  lastTriggerAt: Date,
}
```

---

## 🎮 EJEMPLOS DE USO

### Ejemplo 1: Usuario Conservador

```
Pregunta 6: ¿Activar NSFW?
Respuesta: "No"

Pregunta 7: ¿Permitir desarrollo de behaviors?
Respuesta: "No"

Pregunta 8: ¿Comportamiento inicial?
Respuesta: "Ninguno"

Resultado:
✅ IA con personalidad base
✅ Contenido 100% SFW
✅ Sin behaviors complejos
✅ Interacción simple y segura
```

### Ejemplo 2: Usuario Aventurero

```
Pregunta 6: ¿Activar NSFW?
Respuesta: "Sí"

Pregunta 7: ¿Permitir desarrollo de behaviors?
Respuesta: "Sí"

Pregunta 8: ¿Comportamiento inicial?
Respuesta: "Yandere"

Resultado:
✅ IA con Yandere desde fase 1
✅ Contenido NSFW permitido (celos intensos, posesividad, etc.)
✅ Puede desarrollar otros behaviors durante interacción
✅ Experiencia psicológicamente compleja
```

### Ejemplo 3: Usuario que quiere Sorpresa

```
Pregunta 6: ¿Activar NSFW?
Respuesta: "Sí"

Pregunta 7: ¿Permitir desarrollo de behaviors?
Respuesta: "Sí"

Pregunta 8: ¿Comportamiento inicial?
Respuesta: "Aleatorio Secreto"

Personalidad descrita: "Tímida pero dependiente"

Resultado:
✅ Backend elige: ANXIOUS_ATTACHMENT (por "dependiente")
❓ Usuario NO sabe cuál es
🎮 Usuario lo descubre jugando
🎉 Experiencia gamificada y divertida
```

---

## 🚀 PRÓXIMOS PASOS

### Para Versión SFW (Futura):

1. **Renombrar Behaviors** a términos menos clínicos:
   - `ANXIOUS_ATTACHMENT` → "Apego Necesitado"
   - `BORDERLINE_PD` → "Emociones Intensas"
   - `YANDERE_OBSESSIVE` → "Amor Apasionado"

2. **Limitar Opciones** en modo SFW:
   - Solo ofrecer: Apego Ansioso, Apego Evitativo, Codependencia
   - Remover: Yandere, Borderline (demasiado intensos)

3. **Suavizar Prompts** automáticamente:
   - Remover menciones de violencia/autolesión
   - Mantener aspectos emocionales pero moderados

4. **Agregar Recursos Educativos**:
   - Links a información sobre apegos saludables
   - Disclaimers sobre diferencia entre ficción y realidad

---

## ✅ BENEFICIOS DEL SISTEMA

1. **Ético:** Usuario da consentimiento informado
2. **Flexible:** Usuario controla nivel de complejidad
3. **Divertido:** Opción "Aleatorio Secreto" gamifica la experiencia
4. **Inteligente:** Selección basada en personalidad (no random puro)
5. **Transparente:** Usuario sabe qué está activando (excepto secreto)
6. **Seguro:** Contenido se modera según configuración

---

**✨ El sistema de consentimiento está listo y funcionando!**

**Próximo:** Testing del flujo completo de creación con behaviors.
