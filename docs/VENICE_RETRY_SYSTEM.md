# Sistema de Reintentos Inteligente con Circuit Breaker para Venice API

## 📋 Resumen

Implementación de un sistema robusto de manejo de errores y reintentos para la API de Venice que distingue entre diferentes tipos de errores, aplica estrategias de reintento apropiadas, y coordina las pausas globalmente usando un **Circuit Breaker** para evitar sobrecargar el servidor saturado.

## 🎯 Problemas Resueltos

### Problema 1: Confusión entre Saturación y Falta de Créditos
Anteriormente, la aplicación trataba todos los errores 429 como errores de quota y rotaba las API keys inmediatamente. Esto causaba problemas cuando el servidor estaba temporalmente saturado, ya que el mensaje del servidor decía "intente más tarde" pero la aplicación interpretaba esto como falta de créditos y detenía la ejecución.

### Problema 2: Múltiples Usuarios Bombardeando el Servidor
Sin un circuit breaker, cada usuario que enviaba un mensaje intentaba conectarse al servidor saturado de forma independiente, lo que resultaba en:
- Múltiples intentos simultáneos sobrecargando aún más el servidor
- Desperdicio de recursos haciendo intentos condenados al fracaso
- Experiencia de usuario inconsistente (algunos usuarios esperaban más que otros)

### Solución: Circuit Breaker Global
Ahora se usa un **circuit breaker global** que coordina todos los intentos de todos los usuarios:
- Solo **un intento** cada 30 segundos cuando el servidor está saturado
- Todos los usuarios **esperan juntos** y se benefician cuando funciona
- Máximo **15 reintentos** = 7.5 minutos de intentos repartidos
- Después de 15 fallos, se detiene y notifica que el servidor está inaccesible

## 🔧 Solución Implementada

### 1. Clasificación Inteligente de Errores

Se implementó la función `classifyVeniceError()` que distingue entre 5 tipos de errores:

```typescript
enum VeniceErrorType {
  SERVER_OVERLOAD,          // Servidor saturado temporalmente
  QUOTA_ERROR,              // Rate limit de la API key
  INSUFFICIENT_CREDITS,     // Sin créditos reales
  SERVER_ERROR,             // Errores 500/502/503
  UNKNOWN                   // Otros errores
}
```

#### Detección de Saturación del Servidor (SERVER_OVERLOAD)
Detecta mensajes que indican saturación temporal:
- "overload"
- "saturado"
- "busy"
- "too many requests"
- "try again later"
- "intente más tarde"
- "please retry"

**Acción**: Espera 2 minutos y reintenta (hasta 3 veces por API key)

#### Detección de Créditos Insuficientes (INSUFFICIENT_CREDITS)
Detecta mensajes que indican falta real de créditos:
- "insufficient credits"
- "créditos insuficientes"
- "no credits"
- "balance"

**Acción**: Falla inmediatamente (no hay punto en reintentar)

### 2. Circuit Breaker Global

El **circuit breaker** es una instancia única compartida por toda la aplicación que coordina los reintentos cuando el servidor está saturado.

#### Estados del Circuit Breaker

```
CLOSED (🟢)    → Servidor funcionando normalmente
   ↓ (error de saturación)
OPEN (🔴)      → Servidor saturado, esperando cooldown (30s)
   ↓ (después de 30s)
HALF_OPEN (🟡) → Probando si el servidor se recuperó
   ↓ (éxito)        ↓ (fallo)
CLOSED (🟢)    →  OPEN (🔴)
```

#### Comportamiento por Estado

- **CLOSED**: Todas las solicitudes pasan normalmente
- **OPEN**: Bloquea nuevas solicitudes, espera 30 segundos antes de probar
- **HALF_OPEN**: Permite UN intento de prueba, otros usuarios esperan el resultado

### 3. Estrategias de Reintento por Tipo de Error

| Tipo de Error | Estrategia | Reintentos | Tiempo de Espera | Coordinación |
|---------------|------------|------------|------------------|--------------|
| SERVER_OVERLOAD | Circuit Breaker | 15 globales | 30 segundos | Global (todos los usuarios) |
| SERVER_ERROR (500) | Backoff exponencial | 3 por key | 1s, 2s, 4s | Individual |
| QUOTA_ERROR | Rotación de keys | Todas las keys | Inmediato | Individual |
| INSUFFICIENT_CREDITS | Falla inmediata | 0 | N/A | N/A |
| UNKNOWN | Falla inmediata | 0 | N/A | N/A |

### 3. Método Central de Ejecución

Todos los métodos ahora usan `executeWithRetry()`:

```typescript
private async executeWithRetry(body: VeniceRequestBody): Promise<any>
```

Este método:
- ✅ Maneja todos los tipos de errores de forma inteligente
- ✅ Implementa contadores independientes por API key
- ✅ Aplica las estrategias de reintento apropiadas
- ✅ Proporciona logs detallados del proceso
- ✅ Resetea contadores al cambiar de API key

## 📊 Comportamiento en Producción

### Caso 1: Servidor Saturado con Circuit Breaker (429 - Overload)

**Usuario 1 envía mensaje:**
```
[Venice] 🚀 Sending request to llama-3.3-70b with API key #1...
[Venice] ❌ Error 429 (SERVER_OVERLOAD): Server is overloaded, please try again later
[Venice Circuit Breaker] ⚠️  Saturación detectada (1/15)
[Venice Circuit Breaker] 🔴 Abriendo circuito. Entrando en modo de pausa.
[Espera 30 segundos]
```

**Usuario 2 intenta enviar mensaje (mientras espera):**
```
[Venice Circuit Breaker] 🔴 Circuito ABIERTO. Esperando 25s antes de reintentar...
[Espera junto con Usuario 1]
```

**Después de 30 segundos (Usuario 1 reintenta):**
```
[Venice Circuit Breaker] ⚡ Cambiando a HALF_OPEN, probando conexión...
[Venice] 🚀 Sending request to llama-3.3-70b with API key #1...
[Venice] ✅ Response received in 1234ms
[Venice Circuit Breaker] ✅ Circuito CERRADO. Servidor funcionando normalmente.
```

**Usuario 2 ahora puede proceder inmediatamente:**
```
[Venice] 🚀 Sending request to llama-3.3-70b with API key #1...
[Venice] ✅ Response received in 1189ms
```

### Caso 2: Error del Servidor (500)
```
[Venice] 🚀 Sending request to llama-3.3-70b with API key #1...
[Venice] ❌ Error 500 (SERVER_ERROR): Internal Server Error
[Venice] 🔄 Error del servidor. Reintentando en 1s (1/3)...
[Espera 1 segundo]
[Venice] 🚀 Sending request to llama-3.3-70b with API key #1...
[Venice] ❌ Error 500 (SERVER_ERROR): Internal Server Error
[Venice] 🔄 Error del servidor. Reintentando en 2s (2/3)...
[Espera 2 segundos]
[Venice] 🚀 Sending request to llama-3.3-70b with API key #1...
[Venice] ✅ Response received in 3245ms
```

### Caso 3: Rate Limit (429 - Quota)
```
[Venice] 🚀 Sending request to llama-3.3-70b with API key #1...
[Venice] ❌ Error 429 (QUOTA_ERROR): Rate limit exceeded
[Venice] 💳 Error de rate limit detectado, intentando con siguiente API key...
[Venice] 🔄 Rotando a API key #2
[Venice] 🚀 Sending request to llama-3.3-70b with API key #2...
[Venice] ✅ Response received in 1234ms
```

### Caso 4: Créditos Insuficientes (429 - No Credits)
```
[Venice] 🚀 Sending request to llama-3.3-70b with API key #1...
[Venice] ❌ Error 429 (INSUFFICIENT_CREDITS): Insufficient credits
[Venice] 💰 Créditos insuficientes detectados.
Error: Créditos insuficientes en Venice AI. Por favor, agregue más créditos a su cuenta.
```

## 🚀 Beneficios

1. **Resiliencia Mejorada**: La aplicación no se detiene por problemas temporales del servidor
2. **Experiencia de Usuario**: Los mensajes se procesan eventualmente, incluso si el servidor está saturado
3. **Uso Eficiente de Créditos**: Solo falla cuando realmente no hay créditos
4. **Distinción Clara**: Diferencia entre problemas temporales y permanentes
5. **Logs Detallados**: Facilita el debugging y monitoreo
6. **Código Mantenible**: Lógica centralizada en un solo método

## 💡 Uso

### Uso Básico (Sin Cambios Necesarios)

No se requieren cambios en el código existente. Todos los métodos públicos mantienen su interfaz:

```typescript
// Generate simple
await client.generate({
  model: 'llama-3.3-70b',
  prompt: 'Tu prompt aquí',
  temperature: 0.8,
  maxTokens: 1000
});

// Generate con system prompt
await client.generateWithSystemPrompt(
  'Tu system prompt',
  'Tu mensaje de usuario',
  { model: 'llama-3.3-70b' }
);

// Generate con mensajes múltiples
await client.generateWithMessages({
  systemPrompt: 'Tu system prompt',
  messages: [
    { role: 'user', content: 'Mensaje 1' },
    { role: 'assistant', content: 'Respuesta 1' },
    { role: 'user', content: 'Mensaje 2' }
  ],
  model: 'llama-3.3-70b'
});
```

### Monitoreo del Circuit Breaker

Puedes acceder al estado y estadísticas del circuit breaker para monitoreo o debugging:

```typescript
import { getVeniceCircuitBreaker } from './lib/emotional-system/llm/venice';

const circuitBreaker = getVeniceCircuitBreaker();

// Obtener estado actual
const state = circuitBreaker.getState();
console.log('Estado del circuit breaker:', state); // 'CLOSED', 'OPEN', o 'HALF_OPEN'

// Obtener estadísticas completas
const stats = circuitBreaker.getStats();
console.log('Estadísticas:', stats);
/*
{
  state: 'OPEN',
  failureCount: 5,
  maxFailures: 15,
  cooldownSeconds: 30
}
*/

// Resetear el circuit breaker (útil en testing o recuperación manual)
circuitBreaker.reset();
```

### Ejemplo: API Endpoint de Estado

```typescript
// app/api/venice/status/route.ts
import { getVeniceCircuitBreaker } from '@/lib/emotional-system/llm/venice';

export async function GET() {
  const breaker = getVeniceCircuitBreaker();
  const stats = breaker.getStats();

  return Response.json({
    venice: {
      circuitBreaker: stats,
      healthy: stats.state === 'CLOSED',
      remainingAttempts: stats.maxFailures - stats.failureCount
    }
  });
}
```

## 📈 Métricas de Reintento

### Configuración Actual
- **Circuit Breaker - Cooldown**: 30 segundos entre intentos
- **Circuit Breaker - Máximo de fallos**: 15 intentos globales
- **Tiempo máximo de saturación**: 15 intentos × 30s = 7.5 minutos
- **Reintentos por Error 500**: 3 intentos con backoff (1s + 2s + 4s) = máximo 7 segundos
- **API Keys**: Rota por todas las keys disponibles automáticamente

### Tiempo Máximo de Espera por Escenario

#### Servidor Saturado (Circuit Breaker Global)
- **Independiente del número de API keys**: 7.5 minutos (15 intentos × 30s)
- Todos los usuarios comparten el mismo límite
- Después de 15 fallos consecutivos → Error final

#### Error 500 (Individual por Request)
- **Por intento**: Máximo 7 segundos (1s + 2s + 4s)
- Después pasa a la siguiente API key si está disponible

### Beneficios del Circuit Breaker Global

1. **Eficiencia**: Solo 1 intento cada 30s en lugar de múltiples simultáneos
2. **Coordinación**: Todos los usuarios esperan juntos
3. **Servidor amigable**: No sobrecarga el servidor saturado
4. **Transparente**: Los usuarios ven mensajes de progreso claros

## 🔒 Seguridad

- ✅ No expone API keys en logs
- ✅ Distingue entre errores temporales y permanentes
- ✅ No reintenta indefinidamente
- ✅ Falla rápido en casos de errores irrecuperables

## 📝 Archivos Modificados

- `lib/emotional-system/llm/venice.ts`: Implementación completa del sistema de reintentos

## 🔮 Mejoras Futuras Potenciales

1. **Configuración Dinámica**: Permitir ajustar tiempos de cooldown y máximo de reintentos vía variables de entorno
   ```typescript
   const cooldownMs = process.env.VENICE_CIRCUIT_COOLDOWN_MS || 30000;
   const maxFailures = process.env.VENICE_CIRCUIT_MAX_FAILURES || 15;
   ```

2. **Métricas Persistentes**: Guardar estadísticas del circuit breaker en base de datos
   - Tracking de tasa de éxito/fallo por tipo de error
   - Historial de estados del circuit breaker
   - Tiempo promedio de recuperación del servidor

3. **Alertas Proactivas**: Notificar cuando:
   - El circuit breaker se abre con frecuencia (más de X veces por hora)
   - Se alcanzan los límites de reintentos
   - El servidor está caído por períodos prolongados

4. **Backoff Adaptativo**: Ajustar tiempos de espera basándose en:
   - Patrones históricos de recuperación del servidor
   - Hora del día (mayor carga en horarios pico)
   - Respuestas del servidor (headers como Retry-After)

5. **Dashboard de Monitoreo**: Interfaz visual para:
   - Estado en tiempo real del circuit breaker
   - Gráficos de intentos exitosos vs fallidos
   - Alertas y notificaciones

## 📅 Historial de Implementación

- **2026-01-19 v1.0**: Implementación inicial con clasificación de errores y reintentos básicos
- **2026-01-19 v2.0**: Agregado Circuit Breaker global con coordinación multi-usuario (30s cooldown, 15 reintentos máximo)

## 👥 Notas

Este sistema está diseñado específicamente para manejar la naturaleza realista de una aplicación de mensajería con IAs:

- **Pausas Naturales**: Los 30 segundos entre intentos simulan mejor una conversación real donde las personas no responden instantáneamente
- **Coordinación Global**: El circuit breaker evita que múltiples usuarios sobrecarguen el servidor saturado
- **Resiliencia**: 15 intentos repartidos en 7.5 minutos dan suficiente tiempo para que el servidor se recupere
- **Transparencia**: Los logs claros permiten a los usuarios entender qué está pasando

El balance entre resiliencia y tiempo de respuesta (30s × 15 = 7.5 min) fue elegido para ser:
- **Generoso** con el servidor saturado (no lo bombardea)
- **Razonable** para los usuarios (no espera indefinidamente)
- **Realista** para una app de mensajería (las personas también tardan en responder)
