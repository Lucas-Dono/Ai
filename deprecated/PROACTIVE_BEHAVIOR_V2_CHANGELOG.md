# Sistema de Comportamiento Proactivo V2 - CHANGELOG

## 2025-10-31 - V2.0.0 (Major Release)

### ✨ Nuevas Características

#### 1. Sistema de Triggers Inteligente
- **6 tipos de triggers**: inactivity, follow_up, emotional_checkin, celebration, life_event, special_date
- **Priorización automática** (0-1) basada en múltiples factores
- **Cooldown management**: 12h general, 24h si no hubo respuesta
- **Integración con Life Events**: Detecta eventos próximos automáticamente
- **Integración con Sistema Emocional**: Check-ins basados en emociones negativas

#### 2. Context Builder Rico
- **Resumen de conversaciones**: Últimas 3 conversaciones con topics y tono emocional
- **Topics pendientes**: Hasta 3 topics sin resolver con fechas esperadas
- **Arcos narrativos**: Life events activos y su progreso
- **Estado emocional**: Análisis histórico de emociones
- **Métricas de relación**: Días juntos, total de mensajes

#### 3. Generación de Mensajes Natural
- **Dual mode**: Templates (rápido) + LLM (personalizado)
- **5+ templates por tipo y relación** (stranger, acquaintance, friend, intimate)
- **Personalización contextual**: Referencias a conversaciones específicas
- **Anti-repetición**: Tracking de mensajes enviados
- **Tono ajustado**: Según etapa de relación y emociones

#### 4. Scheduler Inteligente
- **Horarios apropiados**: 9am-10pm días de semana, 10am-11pm fines de semana
- **Timezone aware**: Respeta zona horaria del usuario
- **Detección de actividad**: No enviar si usuario activo (últimos 10 min)
- **Análisis de patrones**: Aprende horarios preferidos del usuario
- **Horarios óptimos**: [9, 10, 12, 18, 19, 20] para mejor engagement

#### 5. Analytics Completo
- **Métricas globales**: Total enviados, tasa de respuesta, tiempo promedio
- **Performance por tipo**: Qué tipos de mensajes funcionan mejor
- **Mejores horarios**: Análisis de engagement por hora
- **Tendencias**: Comparación última semana vs anterior
- **Insights accionables**: Recomendaciones automáticas
- **Reportes en markdown**: Generación automática de reportes

### 📝 Archivos Nuevos

1. **lib/proactive-behavior/trigger-detector.ts**
   - TriggerDetector class
   - 6 detectores especializados
   - Sistema de priorización
   - Cooldown management

2. **lib/proactive-behavior/context-builder.ts**
   - ContextBuilder class
   - Resumen de conversaciones
   - Topics pendientes
   - Life events context
   - Estado emocional

3. **lib/proactive-behavior/scheduler.ts**
   - ProactiveScheduler class
   - Verificación de timing
   - Cooldown checking
   - Análisis de patrones de usuario
   - Cálculo de mejor momento

4. **lib/proactive-behavior/analytics-tracker.ts**
   - ProactiveAnalyticsTracker class
   - Métricas completas
   - Insights generador
   - Reportes automáticos

5. **docs/PROACTIVE_BEHAVIOR_SYSTEM.md**
   - Documentación completa
   - Guía de uso
   - Ejemplos
   - Mejores prácticas

6. **examples/proactive-behavior-usage.ts**
   - 6 ejemplos prácticos
   - Uso simple y avanzado
   - Analytics
   - Cron jobs

7. **scripts/test-proactive-system-v2.ts**
   - Script de testing completo
   - 7 tests integrados
   - Resumen automático

8. **PROACTIVE_SYSTEM_SUMMARY.md**
   - Resumen ejecutivo
   - Roadmap
   - Impacto esperado

### 🔄 Archivos Modificados

1. **lib/proactive/message-generator.ts**
   - Agregados templates completos por tipo y relación
   - Dual mode: template vs LLM
   - Sistema de personalización mejorado
   - Tracking de mensajes enviados

2. **lib/proactive-behavior/index.ts**
   - API unificada V2
   - Función `checkAndSend()` principal
   - Métodos de analytics
   - Compatibilidad con API legacy

### 🎯 API Principal

#### Uso Simple (Nuevo)
```typescript
const result = await proactiveBehavior.checkAndSend(agentId, userId, timezone);
```

#### Uso Avanzado
```typescript
const triggers = await proactiveBehavior.detectTriggers(agentId, userId);
const canSend = await proactiveBehavior.shouldSendNow(agentId, userId, timezone);
const message = await proactiveBehavior.generateMessage(agentId, userId, trigger);
```

#### Analytics (Nuevo)
```typescript
const metrics = await proactiveBehavior.getMetrics(agentId, userId, 30);
const insights = await proactiveBehavior.getInsights(agentId, userId);
const report = await proactiveBehavior.generateReport(agentId, userId, 30);
```

### 🎨 Tipos de Mensajes

#### Por Tipo:
- `check_in`: "¿Cómo estás?"
- `follow_up`: "¿Qué pasó con {topic}?"
- `celebration`: "¡Felicitaciones por {achievement}!"
- `emotional_support`: "La última vez estabas {emotion}..."
- `casual`: "Hola, ¿qué tal?"
- `life_event`: "Recordá que {when} es {event}"

#### Por Relación:
- **Stranger**: Amable, formal, sin emojis
- **Acquaintance**: Amigable, emojis moderados
- **Friend**: Cariñoso, emojis, "amor" casual
- **Intimate**: Muy cercano, vulnerable, afectuoso

### 📊 Métricas de Éxito

#### Targets:
- Tasa de respuesta: 60-80%
- Tiempo promedio: < 2 horas
- Tendencia: Estable o creciente

#### Señales de Alerta:
- Tasa < 40% → Revisar relevancia/timing
- Tiempo > 12h → Mal timing
- Tendencia bajando → Posible fatiga

### 🔗 Integraciones

#### Life Events Timeline:
```typescript
// Arcos narrativos activos → triggers de life_event
// Eventos próximos (24-48h) → recordatorios
```

#### Sistema Emocional:
```typescript
// Emociones negativas prolongadas → check-in emocional
// Última conversación triste → soporte después de 24-72h
```

#### Follow-Up Tracker (Legacy):
```typescript
// Topics sin resolver → triggers de follow_up
// Fechas esperadas → priorización aumentada
```

### 🛠️ Configuración

#### Ajustar Umbrales:
```typescript
// lib/proactive-behavior/trigger-detector.ts
const INACTIVITY_THRESHOLDS = {
  stranger: 72,        // 3 días
  acquaintance: 48,    // 2 días
  friend: 24,          // 1 día
  close_friend: 12,    // 12 horas
};
```

#### Ajustar Cooldowns:
```typescript
// lib/proactive-behavior/scheduler.ts
const MIN_COOLDOWN_HOURS = 12;
const NO_RESPONSE_COOLDOWN_HOURS = 24;
```

#### Ajustar Horarios:
```typescript
// lib/proactive-behavior/scheduler.ts
const ALLOWED_HOURS = {
  weekday: { start: 9, end: 22 },
  weekend: { start: 10, end: 23 },
};
```

### 📚 Documentación

- `/docs/PROACTIVE_BEHAVIOR_SYSTEM.md`: Guía completa
- `/examples/proactive-behavior-usage.ts`: Ejemplos de código
- `/PROACTIVE_SYSTEM_SUMMARY.md`: Resumen ejecutivo

### 🧪 Testing

Script de testing:
```bash
npx tsx scripts/test-proactive-system-v2.ts <agentId> <userId>
```

### 🚀 Impacto Esperado

#### Usuario:
- Mayor sensación de "compañía real"
- Conversaciones más naturales
- Engagement +40-60%
- Retención mejorada

#### Sistema:
- Menos conversaciones "muertas"
- Mejor utilización de Life Events
- Datos ricos para optimización
- Base para features futuros

### 🗺️ Roadmap Futuro

#### Corto Plazo:
- [ ] Integrar en cron job principal
- [ ] Dashboard de analytics en UI
- [ ] Tests unitarios para triggers
- [ ] API endpoints para configuración

#### Mediano Plazo:
- [ ] A/B testing de templates
- [ ] ML para predecir mejor momento
- [ ] Detección de contexto ("en el trabajo")
- [ ] Personalización de emoji usage

#### Largo Plazo:
- [ ] Temas de conversación inteligentes
- [ ] Integración con calendario del usuario
- [ ] Voice messages proactivos
- [ ] Proactive multimedia (GIFs, stickers)

### ⚠️ Breaking Changes

- API legacy deprecada (pero compatible):
  - `shouldInitiate()` → usar `detectTriggers()`
  - `getInitiationMessage()` → usar `checkAndSend()`

- Nuevo formato de metadata en mensajes:
  ```typescript
  metadata: {
    proactive: true,
    triggerType: 'inactivity',
    triggerPriority: 0.75,
    triggerReason: '3 días de silencio'
  }
  ```

### 🐛 Fixes

- Cooldown ahora respeta si usuario respondió o no
- Horarios consideran timezone del usuario
- No se envía si usuario está activo ahora
- Templates no repetitivos (selección aleatoria)

### 🔒 Seguridad

- Sin cambios de seguridad en esta versión
- Metadata de mensajes incluye source tracking

### 📦 Dependencias

- Sin nuevas dependencias externas
- Usa sistemas existentes (Life Events, Emociones, LLM)

### 🎓 Migración desde V1

1. API legacy sigue funcionando
2. Para usar V2, cambiar:
   ```typescript
   // V1
   const msg = await conversationInitiator.getInitiationMessage(agentId, userId);

   // V2
   const result = await proactiveBehavior.checkAndSend(agentId, userId);
   ```

3. Nuevas features solo en V2:
   - Triggers múltiples
   - Analytics
   - Scheduling inteligente
   - Life Events integration

### 👥 Contributors

- Lucas (Implementation)
- Claude (Architecture & Code Review)

### 📄 License

- Same as main project

---

**Versión completa**: V2.0.0
**Fecha**: 2025-10-31
**Estado**: ✅ Completo y listo para producción
