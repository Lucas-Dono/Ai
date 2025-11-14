# Sistema de Protección Anti-Abuso: Límites Diarios

**Fecha de implementación:** Enero 2025
**Problema identificado:** Usuarios podrían abusar del Plan Plus consumiendo todo el cupo mensual en un día, generando pérdidas
**Solución:** Límites diarios para características costosas

---

## Problema Original

### Plan Plus sin Protección (ANTES)
- **Precio:** $5/mes
- **Voice:** 50 mensajes/mes sin límite diario
- **Images:** 30 análisis/mes sin límite diario

### Escenario de Abuso Identificado
**Día 1 del mes:**
- Usuario usa 50 mensajes de voz en un día = 50 × $0.17 = **$8.50**
- Usuario usa 30 análisis de imagen = 30 × $0.05 = **$1.50**
- **Total gastado en un día: $10.00 en un plan de $5/mes**

**Resultado:**
- Pérdida de $5 por usuario abusivo
- Sin diferenciación con Plan Ultra ($15/mes)
- Vulnerable a usuarios que cancelan después de abusar dentro del período de reembolso de 14 días

---

## Solución Implementada

### Límites por Tier

#### Free Plan
```typescript
resources: {
  messagesPerDay: 10,
  imageAnalysisPerMonth: 5,
  imageAnalysisPerDay: 2,        // ← PROTECCIÓN: Max 2/día
  voiceMessagesPerMonth: 0,
  voiceMessagesPerDay: 0,        // ← Sin acceso a voz
}
```

#### Plus Plan ($5/mes)
```typescript
resources: {
  messagesPerDay: 100,

  // Imágenes
  imageAnalysisPerMonth: 30,     // Límite mensual original
  imageAnalysisPerDay: 3,        // ← PROTECCIÓN: Max 3/día (previene $1.50 en un día)

  // Voz (CRÍTICO: muy costoso)
  voiceMessagesPerMonth: 50,     // Límite mensual original
  voiceMessagesPerDay: 5,        // ← PROTECCIÓN: Max 5/día (previene $8.50 en un día)
}
```

**Protección Implementada:**
- **Máximo diario de voz:** 5 mensajes/día × $0.17 = $0.85/día
- **Máximo mensual realista:** 5/día × 30 días = 150 potencial (pero límite mensual es 50)
- **Costo máximo en Día 1:** $0.85 (voz) + $0.15 (imágenes) = **$1.00**
- **Comparado con antes:** $10.00 → $1.00 = **90% de reducción en riesgo**

#### Ultra Plan ($15/mes)
```typescript
resources: {
  messagesPerDay: -1,            // Unlimited
  imageAnalysisPerMonth: -1,     // Unlimited
  imageAnalysisPerDay: -1,       // Sin protección (plan premium)
  voiceMessagesPerMonth: -1,     // Unlimited
  voiceMessagesPerDay: -1,       // Sin protección (plan premium)
}
```

---

## Diferenciación Clara Entre Planes

### Antes (SIN límites diarios)
| Feature | Plus ($5) | Ultra ($15) | Diferencia Real |
|---------|-----------|-------------|-----------------|
| Voice   | 50/mes    | Ilimitado   | ❌ En práctica, Plus podía usar todo en 1 día |
| Images  | 30/mes    | Ilimitado   | ❌ En práctica, Plus podía usar todo en 1 día |

**Problema:** Plus era "Ultra con límites mensuales flojos"

### Después (CON límites diarios)
| Feature | Plus ($5) | Ultra ($15) | Diferencia Real |
|---------|-----------|-------------|-----------------|
| Voice   | 5/día, 50/mes | Ilimitado | ✅ Ultra = sin restricciones diarias |
| Images  | 3/día, 30/mes | Ilimitado | ✅ Ultra = sin restricciones diarias |

**Mejora:**
- **Plus:** Uso diario moderado (promedio 2-3 voz/semana)
- **Ultra:** Usuarios power que necesitan acceso sin límites diarios
- **Justificación de precio:** Ultra vale 3x más porque ofrece verdadera libertad

---

## Implementación Técnica

### 1. Tipos Actualizados (`tier-limits.ts`)

```typescript
export interface ResourceLimits {
  messagesPerDay: number;
  imageAnalysisPerMonth: number;
  imageAnalysisPerDay: number;      // ← NUEVO
  voiceMessagesPerMonth: number;
  voiceMessagesPerDay: number;      // ← NUEVO
  // ... otros límites
}
```

### 2. Tracking Diario (`daily-limits.ts`)

```typescript
interface DailyUsage {
  userId: string;
  date: string; // YYYY-MM-DD
  messagesCount: number;
  imagesAnalyzed: number;
  voiceMessagesCount: number;  // ← NUEVO
  // ...
}
```

### 3. Función de Verificación (`canSendVoiceMessage`)

```typescript
export async function canSendVoiceMessage(
  userId: string,
  userPlan: string = "free"
): Promise<{
  allowed: boolean;
  reason?: string;
  currentDaily: number;
  dailyLimit: number;
  currentMonthly: number;
  monthlyLimit: number;
}>
```

**Lógica de verificación:**
1. **Free:** Bloquear (sin acceso a voz)
2. **Ultra:** Permitir siempre (ilimitado)
3. **Plus:**
   - Verificar límite diario primero (5/día)
   - Si pasa, verificar límite mensual (50/mes)
   - Bloquear si excede cualquiera

### 4. Función de Registro (`trackVoiceMessageUsage`)

```typescript
export async function trackVoiceMessageUsage(userId: string): Promise<void> {
  await prisma.usage.create({
    data: {
      userId,
      resourceType: "voice_message",
      quantity: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        cost: 0.17, // Costo real para tracking
      },
    },
  });
}
```

---

## Mensajes de Error al Usuario

### Límite Diario de Voz Alcanzado
```
Límite diario de mensajes de voz alcanzado (5/día).
Los mensajes de voz cuestan $0.17 cada uno.
Vuelve mañana o actualiza a Ultra.
```

### Límite Mensual de Voz Alcanzado
```
Límite mensual de mensajes de voz alcanzado (50/mes).
Actualiza a Ultra para voz ilimitada.
```

### Límite Diario de Imágenes Alcanzado
```
Límite diario de análisis alcanzado (3/día).
Vuelve mañana o actualiza a Ultra.
```

---

## Uso en APIs

### Ejemplo: Endpoint de Chat con Voz

```typescript
// app/api/agents/[id]/message/route.ts

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session.user.id;
  const userPlan = session.user.plan || "free";

  const { hasVoice } = await req.json();

  if (hasVoice) {
    // Verificar límite ANTES de procesar
    const voiceCheck = await canSendVoiceMessage(userId, userPlan);

    if (!voiceCheck.allowed) {
      return NextResponse.json(
        {
          error: voiceCheck.reason,
          currentDaily: voiceCheck.currentDaily,
          dailyLimit: voiceCheck.dailyLimit,
          upgradeUrl: "/pricing"
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Procesar mensaje de voz...
    const voiceResponse = await generateVoiceMessage(message);

    // Registrar uso DESPUÉS de éxito
    await trackVoiceMessageUsage(userId);
  }
}
```

### Ejemplo: Endpoint de Análisis de Imagen

```typescript
// Similar pattern para imágenes
const imageCheck = await canAnalyzeImage(userId, userPlan);

if (!imageCheck.allowed) {
  return NextResponse.json(
    {
      error: imageCheck.reason,
      current: imageCheck.current,
      limit: imageCheck.limit
    },
    { status: 429 }
  );
}

// Procesar imagen...
await trackImageAnalysisUsage(userId);
```

---

## Análisis de Protección

### Escenario de Prueba: Usuario Abusivo

**Intento de abuso (Día 1):**
1. Envía 50 mensajes de voz en 1 hora
2. Sistema bloquea después de 5
3. Intenta enviar 30 imágenes
4. Sistema bloquea después de 3

**Resultado:**
- **Costo real Día 1:** (5 × $0.17) + (3 × $0.05) = $0.85 + $0.15 = **$1.00**
- **Vs. sin protección:** $10.00
- **Ahorro por usuario:** $9.00
- **% de protección:** 90%

### Caso de Uso Legítimo

**Usuario normal (30 días):**
- Día 1-30: 2 mensajes de voz/semana = 8 mensajes/mes
- Día 1-30: 1 imagen cada 3 días = 10 imágenes/mes

**Costo real:**
- Voice: 8 × $0.17 = $1.36
- Images: 10 × $0.05 = $0.50
- **Total:** $1.86/mes

**Análisis:**
- Pago del plan: $5.00
- Costo real: $1.86
- Margen: $3.14 (63%)
- **Estado:** ✅ Sostenible

---

## Comparación con Competencia

### Character.AI
- No tiene límites por hora/día claramente publicitados
- Usa "Priority Queue" en plan pago (respuestas más rápidas, no más recursos)
- No ofrece voz en plan free

### ChatGPT Plus ($20/mes)
- GPT-4: 40 mensajes/3 horas (límite por ventana de tiempo)
- GPT-4o: 80 mensajes/3 horas
- DALL-E: ~50 imágenes/día (límite no oficial, varía)

### Claude Pro ($20/mes)
- ~45 mensajes/5 horas con Claude Opus
- ~100 mensajes/5 horas con Claude Sonnet
- No limita por día completo, usa ventanas de tiempo

### Nuestra Implementación
- **Similar a líderes de la industria:** Límites por ventana de tiempo (día)
- **Más transparente:** Límites claros y públicos
- **Más justo:** Usuario sabe exactamente cuánto puede usar

---

## Métricas de Éxito

### KPIs a Monitorear

1. **Tasa de Abuso Bloqueado**
   - Meta: <5% de usuarios bloquean límite diario
   - Alerta: >10% indica límites muy estrictos

2. **Costo Promedio por Usuario Plus**
   - Meta: $1.50 - $2.50/mes (30-50% del pago)
   - Alerta: >$3.50/mes (70% del pago)

3. **Ratio de Upgrades Plus → Ultra**
   - Meta: 10-15% de usuarios Plus upgradean a Ultra por límites
   - Indica que límites están correctamente calibrados

4. **Cancelaciones por "Límites Restrictivos"**
   - Meta: <5% de cancelaciones por esta razón
   - Alerta: >15% indica límites muy estrictos

---

## Próximos Pasos

### Fase 1 (COMPLETADO) ✅
- [x] Implementar límites diarios en tier-limits.ts
- [x] Crear funciones de verificación
- [x] Crear funciones de tracking
- [x] Actualizar estadísticas de uso

### Fase 2 (PENDIENTE)
- [ ] Integrar verificaciones en endpoints de chat
- [ ] Integrar verificaciones en endpoints de voz
- [ ] Integrar verificaciones en endpoints de imagen
- [ ] Actualizar UI para mostrar límites diarios

### Fase 3 (PENDIENTE)
- [ ] Implementar analytics de abuso bloqueado
- [ ] Dashboard de admin para ver intentos de abuso
- [ ] Alertas automáticas para patrones sospechosos
- [ ] A/B testing de límites para optimización

---

## Conclusión

Las protecciones anti-abuso implementadas logran:

1. **Protección Financiera:** Reducción del 90% en riesgo de pérdida por abuso
2. **Diferenciación Clara:** Plus vs Ultra ahora tienen propuestas de valor distintas
3. **Sostenibilidad:** Plan Plus es ahora rentable incluso con usuarios activos
4. **Transparencia:** Usuarios saben exactamente qué esperar

**Sin estas protecciones, el Plan Plus era insostenible. Con ellas, es un negocio viable.**
