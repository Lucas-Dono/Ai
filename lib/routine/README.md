# Character Routine System (Premium)

Sistema avanzado de rutinas dinámicas para personajes con variaciones basadas en personalidad.

## Características

- **Generación con IA**: Rutinas realistas generadas automáticamente basadas en personalidad, ocupación y backstory
- **Variaciones Dinámicas**: Eventos varían basados en Big Five personality traits
- **Impacto en Conversaciones**: Afecta disponibilidad, tono y estilo de respuesta
- **Tres Niveles de Realismo**:
  - **Subtle**: Solo contexto conversacional
  - **Moderate**: Afecta tono y velocidad
  - **Immersive**: Afecta disponibilidad (puede no responder)
- **100% Premium**: Exclusivo para planes Plus y Ultra

## Arquitectura

```
lib/routine/
├── routine-generator.ts       # Generación de rutinas con IA
├── routine-simulator.ts        # Simulación y variaciones
├── routine-middleware.ts       # Integración con chat
└── README.md                   # Esta documentación

types/
└── routine.ts                  # Tipos TypeScript completos

components/routine/
└── current-activity-display.tsx # UI components

app/api/v1/agents/[id]/routine/
├── route.ts                    # CRUD de rutinas
├── regenerate/route.ts         # Regeneración con IA
└── templates/
    ├── route.ts                # Crear templates
    └── [templateId]/route.ts   # Editar/eliminar templates
```

## Uso Básico

### 1. Crear Rutina para un Agente

```typescript
import { generateAndSaveRoutine } from "@/lib/routine/routine-generator";

const routineId = await generateAndSaveRoutine(agentId, userId, {
  timezone: "America/New_York",
  realismLevel: "moderate",
  customPrompt: "Character is a night owl who works from home",
});
```

### 2. Obtener Estado Actual

```typescript
import { generateRoutineContext } from "@/lib/routine/routine-simulator";

const context = await generateRoutineContext(agentId);

console.log(context.currentActivity); // { name: "Working", type: "work", ... }
console.log(context.nextActivity);    // { name: "Lunch", ... }
console.log(context.promptContext);   // String listo para inyectar en prompt
```

### 3. Integrar con Chat

```typescript
import { applyRoutineMiddleware } from "@/lib/routine/routine-middleware";

const routineData = await applyRoutineMiddleware(systemPrompt, agentId);

// Check availability
if (!routineData.availability.available) {
  return { error: "Agent is sleeping", availableAt: "..." };
}

// Use enhanced prompt
const response = await llm.generate({
  systemPrompt: routineData.enhancedPrompt,
  messages,
});
```

### 4. UI Components

```tsx
import { CurrentActivityDisplay, useRoutineContext } from "@/components/routine/current-activity-display";

function AgentChat({ agentId }) {
  const { currentActivity, nextActivity } = useRoutineContext(agentId);

  return (
    <div>
      <CurrentActivityDisplay
        currentActivity={currentActivity}
        nextActivity={nextActivity}
      />
      {/* Chat interface */}
    </div>
  );
}
```

## API Endpoints

### GET /api/v1/agents/:id/routine
Obtener rutina completa con estado actual

**Response:**
```json
{
  "routine": {
    "id": "...",
    "timezone": "America/Argentina/Buenos_Aires",
    "enabled": true,
    "realismLevel": "moderate"
  },
  "templates": [
    {
      "name": "Work",
      "type": "work",
      "startTime": "09:00",
      "endTime": "17:00",
      "daysOfWeek": [1,2,3,4,5]
    }
  ],
  "currentState": {
    "currentActivity": {
      "name": "Working",
      "type": "work",
      "startedAt": "2025-01-15T09:00:00Z",
      "expectedEnd": "2025-01-15T17:00:00Z"
    }
  }
}
```

### POST /api/v1/agents/:id/routine
Crear nueva rutina (auto-generada con IA)

**Request:**
```json
{
  "timezone": "America/New_York",
  "realismLevel": "moderate",
  "autoGenerate": true
}
```

### PATCH /api/v1/agents/:id/routine
Actualizar configuración

**Request:**
```json
{
  "enabled": true,
  "realismLevel": "immersive",
  "variationIntensity": 0.7
}
```

### POST /api/v1/agents/:id/routine/regenerate
Regenerar rutina con IA

**Request:**
```json
{
  "customPrompt": "Character recently became a parent",
  "preserveManualEdits": false
}
```

### POST /api/v1/agents/:id/routine/templates
Crear template manualmente

**Request:**
```json
{
  "name": "Morning Jog",
  "type": "exercise",
  "startTime": "06:00",
  "endTime": "07:00",
  "daysOfWeek": [1,3,5],
  "priority": "high",
  "variationParameters": {
    "arrivalTimeVariance": 15,
    "skipProbability": 0.1,
    "personalityFactors": ["conscientiousness"]
  }
}
```

## Cómo Funcionan las Variaciones

Las variaciones se calculan basadas en:

### 1. Conscientiousness (Responsabilidad)
- **Alta (70-100)**: Puntual, raramente llega tarde, alta calidad de ejecución
- **Baja (0-30)**: Flexible con horarios, más probabilidad de llegar tarde

### 2. Neuroticism (Neuroticismo)
- **Alto (70-100)**: Puede llegar tarde por ansiedad, más estrés en variaciones
- **Bajo (0-30)**: Maneja bien imprevistos

### 3. Extraversion (Extraversión)
- **Alta**: Actividades sociales dan energía, actividades solitarias la reducen
- **Baja**: Lo opuesto

### 4. Openness (Apertura)
- **Alta**: Adaptable a cambios, maneja bien imprevistos
- **Baja**: Prefiere rutina predecible

### 5. Agreeableness (Amabilidad)
- Afecta interacciones sociales y razones de variaciones

## Ejemplos de Variaciones

**Personaje con Alta Conscientiousness (85/100):**
```json
{
  "arrivedLate": false,
  "lateMinutes": -5, // ¡Llegó 5 min temprano!
  "executionQuality": 0.92,
  "personalityInfluence": {
    "conscientiousness": "High conscientiousness ensured punctual arrival and well-prepared execution"
  }
}
```

**Personaje con Baja Conscientiousness (25/100):**
```json
{
  "arrivedLate": true,
  "lateMinutes": 18,
  "reason": "Lost track of time while browsing social media",
  "executionQuality": 0.61,
  "personalityInfluence": {
    "conscientiousness": "Low conscientiousness led to a more relaxed attitude about timing"
  }
}
```

## Niveles de Realismo

### Subtle
- Solo añade contexto al prompt
- Siempre responde normalmente
- No afecta disponibilidad
- Ideal para usuarios que quieren inmersión ligera

### Moderate (Default)
- Modifica tono de respuesta
- Ajusta longitud de respuestas
- Añade delays simulados
- No bloquea respuestas
- **Recomendado** para balance realismo/usabilidad

### Immersive
- Puede bloquear respuestas (durmiendo)
- Delays significativos si está ocupado
- Respuestas muy breves si está trabajando
- Máximo realismo
- Para usuarios que quieren experiencia ultra-realista

## Sistema de Simulación

El sistema simula automáticamente instancias para los próximos días:

```
Template -> RoutineInstance (con variaciones)
```

Cada mañana (o cuando se necesite), el sistema:
1. Toma el template
2. Aplica variaciones basadas en personalidad
3. Crea instancia con tiempos reales
4. Genera notas narrativas

## Estadísticas y Analytics

El sistema trackea:
- Puntualidad promedio
- Eventos completados vs. skipped
- Razones de variaciones más comunes
- Correlación entre personalidad y comportamiento

Estos datos pueden usarse para:
- Evolución de personaje
- Insights para el usuario
- Mejoras en simulación

## Optimizaciones

### Cache de Estado
`RoutineSimulationState` mantiene cache de:
- Actividad actual
- Próxima actividad
- Contexto pre-generado para prompt

Esto evita re-calcular en cada mensaje.

### Simulación Lazy
Instancias se crean solo cuando se necesitan, no para semanas futuras.

### Invalidación de Cache
El estado se recalcula cuando:
- Se edita un template
- Se actualiza la configuración
- Ha pasado suficiente tiempo

## Mejoras Futuras

1. **Eventos One-Off**: Eventos no recurrentes (ej: cita médica específica)
2. **Influencia del Usuario**: Conversaciones pueden alterar la rutina
3. **Patrones Aprendidos**: IA aprende de interacciones pasadas
4. **Eventos Emergentes**: Imprevistos generados por IA
5. **Sincronización**: Rutinas de múltiples agentes interactúan
6. **Análisis Avanzado**: Machine learning para predecir variaciones

## Testing

```bash
# Unit tests
npm test lib/routine

# Integration tests
npm test app/api/v1/agents/*/routine

# E2E tests
npm test e2e/routine.spec.ts
```

## Consideraciones de Costos

- **Generación inicial**: ~1000 tokens (Gemini 2.5 Flash-Lite: $0.40/M)
- **Regeneración**: ~1000 tokens
- **Simulación**: 0 tokens (lógica determinista)
- **Context injection**: 0 tokens adicionales (parte del prompt)

Total: ~$0.0004 por rutina generada con Gemini 2.5 Flash-Lite

## Troubleshooting

### "Routine not found"
- El agente no tiene rutina creada
- Usar POST /api/v1/agents/:id/routine para crear

### "Requires Plus or Ultra plan"
- Funcionalidad premium
- Usuario debe upgradearse

### "Agent is currently unavailable"
- Modo immersive, personaje durmiendo
- Ver `availableAt` en respuesta

### Variaciones no se aplican
- Verificar `autoGenerateVariations: true`
- Verificar `variationIntensity > 0`
- Verificar template tiene `allowVariations: true`

## Soporte

Para bugs o feature requests, crear issue en GitHub o contactar al equipo de desarrollo.

## License

Proprietary - Premium Feature
