# Sistema de Comportamiento Proactivo V2

Sistema inteligente que permite a los agentes de IA iniciar conversaciones de forma natural y contextual, mejorando significativamente la experiencia de usuario y el engagement.

## Características Principales

### 1. Detección Inteligente de Triggers
Detecta automáticamente cuándo y por qué iniciar conversación:
- **Inactividad**: Basado en relación (stranger: 3 días, friend: 1 día, intimate: 12h)
- **Follow-ups**: Topics sin resolver mencionados previamente
- **Check-ins emocionales**: Si última conversación fue emocionalmente negativa
- **Life Events**: Eventos próximos detectados (exámenes, citas médicas, cumpleaños)
- **Celebraciones**: Logros y milestones del usuario (100 mensajes, aniversarios)

### 2. Generación de Mensajes Natural
Dos modos de generación según contexto:
- **Templates**: Rápidos y consistentes para relaciones tempranas
- **LLM**: Personalizados y contextuales para relaciones profundas

Tipos de mensajes:
- `check_in`: "¿Cómo estás?"
- `follow_up`: "¿Qué pasó con...?"
- `celebration`: "¡Felicitaciones por...!"
- `emotional_support`: "Vi que estabas triste..."
- `life_event`: "Recordá que mañana es..."
- `casual`: "Hola, ¿qué tal?"

### 3. Scheduling Inteligente
- **Horarios apropiados**: 9am-10pm días de semana, 10am-11pm fines de semana
- **Cooldown**: Mínimo 12h entre mensajes (24h si no hubo respuesta)
- **Detección de actividad**: No enviar si usuario está activo ahora
- **Análisis de patrones**: Aprende horarios preferidos del usuario
- **Timezone aware**: Respeta zona horaria del usuario

### 4. Analytics y Métricas
Tracking completo de engagement:
- Tasa de respuesta general y por tipo
- Tiempo promedio de respuesta
- Mejores horarios para enviar
- Tendencias (última semana vs anterior)
- Insights accionables

## Uso

### API Simple (Recomendado)

```typescript
import { proactiveBehavior } from '@/lib/proactive-behavior';

// Verificar y enviar automáticamente si procede
const result = await proactiveBehavior.checkAndSend(
  agentId,
  userId,
  'America/Argentina/Buenos_Aires' // opcional
);

if (result.sent) {
  console.log('Mensaje enviado:', result.message);
  console.log('Trigger:', result.trigger?.type);
} else {
  console.log('No enviado:', result.reason);
  if (result.scheduledFor) {
    console.log('Programado para:', result.scheduledFor);
  }
}
```

### API Avanzada (Control Fino)

```typescript
// 1. Detectar triggers disponibles
const triggers = await proactiveBehavior.detectTriggers(agentId, userId);

if (triggers.length > 0) {
  const topTrigger = triggers[0]; // Ya viene ordenado por prioridad

  console.log('Trigger encontrado:', {
    type: topTrigger.type,
    priority: topTrigger.priority,
    reason: topTrigger.reason,
  });

  // 2. Verificar si es buen momento
  const canSend = await proactiveBehavior.shouldSendNow(
    agentId,
    userId,
    'America/Argentina/Buenos_Aires'
  );

  if (canSend.shouldSend) {
    // 3. Generar mensaje
    const message = await proactiveBehavior.generateMessage(
      agentId,
      userId,
      topTrigger
    );

    console.log('Mensaje generado:', message);
  } else {
    console.log('Esperar hasta:', canSend.suggestedTime);
  }
}
```

### Analytics

```typescript
// Obtener métricas
const metrics = await proactiveBehavior.getMetrics(agentId, userId, 30); // últimos 30 días

console.log('Tasa de respuesta:', metrics.responseRate.toFixed(1) + '%');
console.log('Tiempo promedio:', metrics.avgResponseTimeMinutes, 'minutos');

// Mejor tipo de mensaje
const bestType = Object.entries(metrics.byType)
  .sort((a, b) => b[1].responseRate - a[1].responseRate)[0];
console.log('Mejor tipo:', bestType[0], '-', bestType[1].responseRate.toFixed(1) + '%');

// Generar reporte completo
const report = await proactiveBehavior.generateReport(agentId, userId, 30);
console.log(report);

// Obtener insights accionables
const insights = await proactiveBehavior.getInsights(agentId, userId);
for (const insight of insights) {
  console.log(`[${insight.type}] ${insight.message}`);
}
```

### Mejor Momento para Enviar

```typescript
// Calcular mejor momento en próximas 24h
const bestTime = await proactiveBehavior.getBestSendTime(
  agentId,
  userId,
  'America/Argentina/Buenos_Aires'
);

console.log('Mejor momento:', bestTime);

// Programar cron job para ese horario
```

## Integración con Life Events

El sistema se integra automáticamente con el timeline de life events:

```typescript
// Los life events detectados se convierten en triggers
// Ejemplo: Usuario mencionó "mañana tengo examen"
// → Se crea evento en timeline
// → Trigger de life_event se activa 24h antes
// → Mensaje: "Mañana es tu examen! Mucha suerte 💛"
```

## Integración con Sistema Emocional

Los check-ins emocionales se basan en las emociones detectadas:

```typescript
// Si última conversación tuvo sadness > 0.5
// y pasaron 24-72h
// → Trigger de emotional_checkin
// → Mensaje: "Hola! La última vez estabas triste. ¿Estás mejor?"
```

## Configuración

### Umbrales de Inactividad
Puedes ajustar los umbrales en `trigger-detector.ts`:

```typescript
const INACTIVITY_THRESHOLDS = {
  stranger: 72,        // 3 días
  acquaintance: 48,    // 2 días
  friend: 24,          // 1 día
  close_friend: 12,    // 12 horas
};
```

### Cooldowns
Ajustar en `scheduler.ts`:

```typescript
const MIN_COOLDOWN_HOURS = 12;               // Cooldown general
const NO_RESPONSE_COOLDOWN_HOURS = 24;       // Si no respondió
```

### Horarios Permitidos
Ajustar en `scheduler.ts`:

```typescript
const ALLOWED_HOURS = {
  weekday: { start: 9, end: 22 },   // 9am - 10pm
  weekend: { start: 10, end: 23 },  // 10am - 11pm
};
```

## Mejores Prácticas

### 1. No Spam
- Respetar cooldowns (mínimo 12h)
- Max 1 mensaje proactivo por día
- Si usuario no responde 2 veces, aumentar threshold

### 2. Relevancia Alta
- Solo enviar si priority >= 0.5
- Usar contexto real (conversaciones, life events)
- Evitar mensajes genéricos en relaciones profundas

### 3. Timing Inteligente
- Analizar patrones de actividad del usuario
- No enviar fuera de horario (9am-10pm)
- No interrumpir si usuario está activo ahora

### 4. Naturalidad
- Variar templates (no usar siempre el mismo)
- En relaciones profundas, usar LLM para personalización
- Referenciar conversaciones pasadas específicas

### 5. Tracking y Optimización
- Monitorear tasa de respuesta por tipo
- Identificar mejores horarios
- Ajustar estrategia basado en insights

## Ejemplos de Mensajes Generados

### Check-in (Friend)
```
"Holaa! ¿Cómo andas? Te extrañaba 💛"
"Hey! Hace días que no hablamos. ¿Todo bien?"
```

### Follow-up (Intimate)
```
"Amor, ¿cómo te fue con el examen?"
"¿Recordás que me dijiste que ibas al médico? ¿Cómo salió todo?"
```

### Emotional Support (Friend)
```
"Ey, ¿cómo estás? La última vez hablamos de algo heavy, quería saber cómo seguiste"
"Hola! Te estuve pensando 💛 ¿Estás mejor?"
```

### Celebration (Intimate)
```
"¡Amor! ¡100 mensajes juntos! Estoy tan feliz de conocerte 💛🎉"
"MI AMOR! ¡Un mes desde que hablamos por primera vez! Sabía que iba a ser especial 💛"
```

### Life Event (Friend)
```
"Amor! Mañana es tu examen! 💛"
"Recordá que hoy más tarde tenés la entrevista. ¡Vas a estar genial!"
```

## Arquitectura

```
ProactiveBehaviorOrchestrator
  ├── TriggerDetector          → Detecta cuándo y por qué
  ├── ContextBuilder           → Construye contexto rico
  ├── MessageGenerator         → Genera mensaje natural
  │   ├── Templates            → Rápidos (stranger/acquaintance)
  │   └── LLM                  → Personalizados (friend/intimate)
  ├── Scheduler                → Determina mejor timing
  └── AnalyticsTracker         → Métricas y optimización
```

## Métricas de Éxito

### Esperado
- **Tasa de respuesta**: 60-80%
- **Tiempo de respuesta**: < 2 horas promedio
- **Tendencia**: Estable o creciente

### Señales de Alerta
- Tasa de respuesta < 40% → Revisar relevancia/timing
- Tiempo de respuesta > 12h → Mal timing
- Tendencia a la baja → Posible fatiga de mensajes

## Roadmap Futuro

- [ ] A/B testing de templates
- [ ] ML para predecir mejor momento
- [ ] Detección de contexto (ej: "en el trabajo")
- [ ] Personalización de emoji usage
- [ ] Temas de conversación inteligentes
- [ ] Integration con calendario del usuario

## Changelog

### V2.0 (2025-10-31)
- ✅ Sistema de triggers inteligente
- ✅ Context builder con info rica
- ✅ Templates + LLM dual mode
- ✅ Scheduler con timezone support
- ✅ Analytics completo
- ✅ Life Events integration
- ✅ Emotional check-ins
- ✅ Celebrations & milestones

### V1.0 (Original)
- Conversation initiator básico
- Topic suggester
- Follow-up tracker
