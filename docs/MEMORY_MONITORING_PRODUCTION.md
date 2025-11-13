# Monitoreo de Memoria en Producción

## Diferencia entre errores de BUILD vs RUNTIME

### Error que tuviste (BUILD/DEV):
- **Cuándo**: Durante `npm run dev` o `npm run build`
- **Causa**: Compilación de Next.js consumiendo memoria
- **Afecta a**: El desarrollador
- **Solución**: Aumentar `--max-old-space-size`

### Errores en PRODUCCIÓN (RUNTIME):
- **Cuándo**: Servidor corriendo con usuarios reales
- **Causa**: Memory leaks, operaciones pesadas, alta carga
- **Afecta a**: Los usuarios finales
- **Solución**: Optimizar código, límites, escalamiento

---

## Áreas de riesgo en tu proyecto

### 1. Operaciones de ML/AI (Alto riesgo de memoria)

Tu proyecto usa:
```typescript
// @xenova/transformers - Embeddings y ML
// node-llama-cpp - LLMs locales
// Sharp - Procesamiento de imágenes
```

**Recomendaciones**:
- Limitar llamadas concurrentes a modelos
- Usar rate limiting agresivo en endpoints de AI
- Considerar mover modelos pesados a servicios externos
- Implementar caché de embeddings

### 2. Redis y Caché

**Verificar**:
```bash
# Ver uso de memoria de Redis
redis-cli INFO memory
```

**En tu código** (`lib/redis/config.ts`):
- Asegurar que todas las keys tienen TTL
- Implementar estrategias de eviction
- Monitorear tamaño del caché

### 3. Socket.IO (Conexiones persistentes)

Con muchos usuarios, cada socket consume memoria:

**Verificar** (`lib/socket/server.ts`):
- Límites de conexiones por usuario
- Cleanup de sockets desconectados
- Timeouts de inactividad

### 4. Procesamiento de imágenes

Sharp consume mucha memoria con imágenes grandes:

**Verificar** (`lib/visual-system/visual-generation-service.ts`):
- Límites de tamaño de imagen
- Procesamiento en cola (no concurrente)
- Liberar buffers después de usar

---

## Monitoreo recomendado

### 1. Agregar métricas de memoria en tu servidor

```typescript
// server.js o lib/monitoring/memory.ts
import { logger } from './lib/logging';

setInterval(() => {
  const used = process.memoryUsage();

  logger.info('Memory usage', {
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`,
  });

  // Alerta si el heap usado supera el 80% del total
  const heapPercentage = (used.heapUsed / used.heapTotal) * 100;
  if (heapPercentage > 80) {
    logger.warn('High memory usage detected', { heapPercentage });
  }
}, 60000); // Cada minuto
```

### 2. Usar Sentry para monitorear en producción

Ya tienes Sentry configurado. Asegúrate de capturar errores de memoria:

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Monitorear memoria
    setInterval(() => {
      const used = process.memoryUsage();
      const heapPercentage = (used.heapUsed / used.heapTotal) * 100;

      if (heapPercentage > 80) {
        Sentry.captureMessage('High memory usage', {
          level: 'warning',
          extra: { memoryUsage: used, heapPercentage }
        });
      }
    }, 60000);
  }
}
```

### 3. Configurar límites en producción

En tu `server.js`:

```javascript
// Limitar memoria en producción
if (process.env.NODE_ENV === 'production') {
  // Ajustar según tu servidor
  const maxMemory = process.env.MAX_MEMORY || '4096'; // MB
  process.env.NODE_OPTIONS = `--max-old-space-size=${maxMemory}`;
}
```

---

## Estrategias de prevención

### 1. Rate limiting por operación pesada

```typescript
// lib/redis/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';

// Rate limit específico para operaciones de AI
export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 llamadas por minuto
  prefix: 'ai-ops',
});

// Rate limit para generación de imágenes
export const imageGenRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, '1 m'), // 2 imágenes por minuto
  prefix: 'image-gen',
});
```

### 2. Cola de procesamiento para operaciones pesadas

```typescript
// lib/queue/ai-queue.ts
class AIQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private maxConcurrent = 3;
  private current = 0;

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.current >= this.maxConcurrent) return;

    this.processing = true;
    while (this.queue.length > 0 && this.current < this.maxConcurrent) {
      const task = this.queue.shift();
      if (task) {
        this.current++;
        task().finally(() => {
          this.current--;
          this.process();
        });
      }
    }
    this.processing = false;
  }
}

export const aiQueue = new AIQueue();
```

### 3. Liberar recursos explícitamente

```typescript
// En operaciones de ML/AI
async function processWithModel(input: string) {
  let model;
  try {
    model = await loadModel();
    const result = await model.process(input);
    return result;
  } finally {
    // Liberar recursos SIEMPRE
    if (model) {
      await model.dispose();
      model = null;
    }

    // Forzar garbage collection en desarrollo
    if (global.gc && process.env.NODE_ENV === 'development') {
      global.gc();
    }
  }
}
```

---

## Checklist para producción

Antes de lanzar con usuarios reales:

- [ ] Configurar monitoreo de memoria en Sentry
- [ ] Agregar rate limiting en endpoints de AI/ML
- [ ] Implementar cola para operaciones pesadas
- [ ] Configurar límites de memoria en servidor (`NODE_OPTIONS`)
- [ ] Verificar que Redis tiene TTL en todas las keys
- [ ] Probar con herramientas de carga (k6, Artillery)
- [ ] Configurar auto-scaling basado en uso de memoria
- [ ] Agregar alertas de memoria alta
- [ ] Documentar límites de recursos por tier de usuario
- [ ] Implementar circuit breakers para servicios externos

---

## Pruebas de carga recomendadas

```bash
# Instalar k6
npm install -g k6

# Test básico de carga
k6 run --vus 50 --duration 30s load-test.js
```

Ejemplo de test para tu endpoint de chat:

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Subir a 10 usuarios
    { duration: '3m', target: 50 },  // Subir a 50 usuarios
    { duration: '1m', target: 0 },   // Bajar a 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de requests < 500ms
  },
};

export default function () {
  const res = http.post('http://localhost:3000/api/agents/1/message',
    JSON.stringify({
      message: 'Hola',
      conversationId: '123'
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
    }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## Resumen ejecutivo

### Tu error actual:
- ✅ Ya solucionado con `--max-old-space-size=8192`
- ✅ Solo afecta desarrollo/build
- ✅ NO afectará a usuarios finales

### Para producción con muchos usuarios:
- ⚠️ Monitorear uso de memoria con Sentry
- ⚠️ Implementar rate limiting agresivo en AI/ML
- ⚠️ Usar colas para operaciones pesadas
- ⚠️ Probar con herramientas de carga
- ⚠️ Configurar auto-scaling

### Señales de alerta en producción:
1. Memoria creciendo constantemente (memory leak)
2. Timeouts frecuentes en endpoints de AI
3. Crashes con "heap out of memory" en logs
4. Respuestas lentas con pocos usuarios

Si ves estas señales, revisa este documento y aplica las estrategias correspondientes.
