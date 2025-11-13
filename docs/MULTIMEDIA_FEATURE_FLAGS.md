# Sistema de Feature Flags Multimedia

## 🎯 Problema Resuelto

**Dilema estratégico:** ¿Bloquear multimedia en FREE (ahorro de costos) o habilitar trial (mejor conversión)?

**Solución:** Sistema configurable con `.env` que permite cambiar estrategia sin refactorizar código.

---

## 🚀 Estrategias Disponibles

### 1. **BLOCKED** (Fase Lanzamiento) ⚠️

**Cuándo usar:** Lanzamiento inicial sin capital para multimedia

```env
FREE_MULTIMEDIA_STRATEGY="BLOCKED"
```

**Comportamiento:**
- ✅ Usuarios FREE no pueden generar imágenes ni voces
- ✅ Mensajes de upgrade claros
- ✅ Costo multimedia: **$0**
- ❌ Conversión estimada: **2-3%**

**Mensaje al usuario:**
```
La generación de imágenes está disponible solo para usuarios Plus y Ultra.

Con Plus ($10/mes) obtienes:
📸 10 imágenes/día
💬 100 mensajes/día
🔥 Contenido NSFW

Actualiza ahora: /pricing
```

---

### 2. **TRIAL_LIFETIME** (Fase Crecimiento) ⭐ **RECOMENDADO**

**Cuándo usar:** Cuando tienes ingresos estables y quieres mejorar conversión

```env
FREE_MULTIMEDIA_STRATEGY="TRIAL_LIFETIME"
FREE_IMAGE_GENERATION_LIFETIME="3"
FREE_VOICE_MESSAGES_LIFETIME="5"
```

**Comportamiento:**
- ✅ Usuario FREE obtiene **3 imágenes** + **5 voces** de por vida
- ✅ No se renueva mensual/diariamente
- ✅ Costo predecible: **$0.18 por usuario**
- ✅ Conversión estimada: **5-8%**
- ✅ FOMO (Fear of Missing Out): "Ya usé 2/3 fotos gratis"

**Mensaje al usuario (durante trial):**
```
IA: "¡Dame un segundo que tomo la foto! Te la mando en un ratito 😊
     (Fotos restantes: 2/3)"
```

**Mensaje al usuario (trial agotado):**
```
Ya usaste tus 3 fotos gratis del trial 📸 (3/3)

¡Te gustó? Con Plus ($10/mes) obtienes:
📸 10 imágenes/día
💬 100 mensajes/día
🔥 Contenido NSFW

Actualiza ahora: /pricing
```

---

### 3. **TRIAL_TIME** (Fase Agresiva) 🔥

**Cuándo usar:** Fase de crecimiento agresivo, dispuesto a invertir en adquisición

```env
FREE_MULTIMEDIA_STRATEGY="TRIAL_TIME"
FREE_MULTIMEDIA_TRIAL_DAYS="30"
```

**Comportamiento:**
- ✅ Usuario FREE tiene **30 días** de multimedia ilimitada
- ✅ Después de 30 días: bloqueado
- ⚠️ Costo variable: **$0.50-1.00 por usuario** (depende de uso)
- ✅ Conversión estimada: **8-12%**
- ✅ Máximo engagement durante trial

**Mensaje al usuario (durante trial):**
```
Trial multimedia: 15 días restantes
```

**Mensaje al usuario (trial expirado):**
```
Tu trial de 30 días ha expirado 😢

Para seguir usando generación de imágenes, actualiza a Plus:
📸 10 imágenes/día
🎙️ 50 mensajes de voz/mes
💬 100 mensajes/día

Actualiza ahora: /pricing
```

---

## 📊 Comparativa de Estrategias

| Estrategia | Costo/User | Conversión | ROI | Recomendado Para |
|------------|------------|------------|-----|------------------|
| **BLOCKED** | $0.00 | 2-3% | N/A | Lanzamiento sin capital |
| **TRIAL_LIFETIME** ⭐ | $0.18 | 5-8% | **Alto** | Fase de crecimiento equilibrado |
| **TRIAL_TIME** | $0.50-1.00 | 8-12% | Medio | Crecimiento agresivo con capital |

**Cálculo de ejemplo (1000 usuarios FREE/mes):**

```
BLOCKED:
- Costo: $0
- Conversión: 30 users → $300 MRR
- ROI: ∞

TRIAL_LIFETIME:
- Costo: $180
- Conversión: 70 users → $700 MRR
- ROI: $520 ganancia neta

TRIAL_TIME:
- Costo: $800
- Conversión: 100 users → $1000 MRR
- ROI: $200 ganancia neta
```

---

## 🛠️ Implementación

### Paso 1: Configurar `.env`

```bash
# Lanzamiento (sin capital)
FREE_MULTIMEDIA_STRATEGY="BLOCKED"

# ó Crecimiento (con ingresos)
FREE_MULTIMEDIA_STRATEGY="TRIAL_LIFETIME"
FREE_IMAGE_GENERATION_LIFETIME="3"
FREE_VOICE_MESSAGES_LIFETIME="5"

# ó Agresivo (con capital)
FREE_MULTIMEDIA_STRATEGY="TRIAL_TIME"
FREE_MULTIMEDIA_TRIAL_DAYS="30"
```

### Paso 2: Reiniciar servidor

```bash
# No requiere migración de BD
# Solo reiniciar para cargar nuevas env vars
npm run dev  # desarrollo
# o
pm2 restart all  # producción
```

### Paso 3: Verificar en logs

```bash
# Los logs mostrarán la estrategia activa
[MultimediaLimits] Strategy: BLOCKED
[MessageService] Image generation blocked by limits (reason: MULTIMEDIA_BLOCKED_FOR_FREE)
```

---

## 📱 Integración Frontend

### Consultar estado de trial

```typescript
// GET /api/user/multimedia-status
const response = await fetch('/api/user/multimedia-status');
const data = await response.json();

if (data.strategy === 'TRIAL_LIFETIME') {
  console.log(`Fotos restantes: ${data.images.remaining}/${data.images.limit}`);
  console.log(`Voces restantes: ${data.voices.remaining}/${data.voices.limit}`);
}

if (data.strategy === 'TRIAL_TIME') {
  console.log(`Días restantes: ${data.trialDaysRemaining}`);
}

if (data.strategy === 'BLOCKED') {
  console.log('Multimedia bloqueada para FREE');
}
```

### Mostrar progress bar (TRIAL_LIFETIME)

```tsx
function MultimediaTrial() {
  const { data } = useSWR('/api/user/multimedia-status');

  if (data?.strategy !== 'TRIAL_LIFETIME') return null;

  return (
    <div className="trial-status">
      <div>
        Fotos: {data.images.current}/{data.images.limit}
        <ProgressBar value={data.images.current} max={data.images.limit} />
      </div>
      <div>
        Voces: {data.voices.current}/{data.voices.limit}
        <ProgressBar value={data.voices.current} max={data.voices.limit} />
      </div>
      {data.images.remaining === 0 && (
        <button onClick={() => router.push('/pricing')}>
          Actualizar a Plus
        </button>
      )}
    </div>
  );
}
```

---

## 🔄 Cambio de Estrategia en Vivo

### Scenario: De BLOCKED a TRIAL_LIFETIME

1. **Editar `.env`:**
```env
# Antes
FREE_MULTIMEDIA_STRATEGY="BLOCKED"

# Después
FREE_MULTIMEDIA_STRATEGY="TRIAL_LIFETIME"
FREE_IMAGE_GENERATION_LIFETIME="3"
FREE_VOICE_MESSAGES_LIFETIME="5"
```

2. **Reiniciar:**
```bash
pm2 restart all
```

3. **Resultado:**
- ✅ Usuarios FREE existentes obtienen trial inmediatamente
- ✅ No se pierde data (PendingImageGeneration ya estaba trackeando)
- ✅ Cambio instantáneo, sin downtime

---

## 🧪 Testing

### Test 1: BLOCKED

```bash
# 1. Configurar
FREE_MULTIMEDIA_STRATEGY="BLOCKED"

# 2. Probar como usuario FREE
curl -X POST /api/agents/123/message \
  -H "Authorization: Bearer FREE_USER_TOKEN" \
  -d '{"content": "mándame una foto"}'

# 3. Verificar respuesta
# Debe retornar mensaje de upgrade sin imagen
```

### Test 2: TRIAL_LIFETIME

```bash
# 1. Configurar
FREE_MULTIMEDIA_STRATEGY="TRIAL_LIFETIME"
FREE_IMAGE_GENERATION_LIFETIME="3"

# 2. Solicitar 3 fotos
# Foto 1: "Fotos restantes: 2/3"
# Foto 2: "Fotos restantes: 1/3"
# Foto 3: "Fotos restantes: 0/3"

# 3. Solicitar 4ta foto
# Debe retornar mensaje de upgrade
```

### Test 3: TRIAL_TIME

```bash
# 1. Configurar
FREE_MULTIMEDIA_STRATEGY="TRIAL_TIME"
FREE_MULTIMEDIA_TRIAL_DAYS="30"

# 2. Verificar días restantes
curl /api/user/multimedia-status

# 3. Simular expiración (cambiar user.createdAt en BD)
# Debe bloquear multimedia
```

---

## 📊 Monitoreo y Analytics

### Queries útiles

```sql
-- 1. Usuarios FREE que agotaron trial
SELECT COUNT(*)
FROM "User" u
WHERE u.plan = 'free'
AND (
  SELECT COUNT(*) FROM "PendingImageGeneration"
  WHERE "userId" = u.id AND status = 'completed'
) >= 3;

-- 2. Tasa de conversión post-trial
SELECT
  COUNT(*) FILTER (WHERE plan != 'free') / COUNT(*)::float AS conversion_rate
FROM "User"
WHERE "createdAt" > NOW() - INTERVAL '30 days'
AND (
  SELECT COUNT(*) FROM "PendingImageGeneration"
  WHERE "userId" = "User".id
) > 0;

-- 3. Uso promedio de trial
SELECT
  AVG(img_count) as avg_images_used,
  AVG(voice_count) as avg_voices_used
FROM (
  SELECT
    u.id,
    (SELECT COUNT(*) FROM "PendingImageGeneration" WHERE "userId" = u.id) as img_count,
    (SELECT COUNT(*) FROM "Message" WHERE "userId" = u.id AND role = 'assistant' AND metadata::text LIKE '%"type":"audio"%') as voice_count
  FROM "User" u
  WHERE u.plan = 'free'
) stats;
```

---

## 🎯 Recomendación Final

**Para tu caso (lanzamiento sin capital):**

### Fase 1: Lanzamiento (Mes 1-2)
```env
FREE_MULTIMEDIA_STRATEGY="BLOCKED"
```
- Costo: $0
- Foco: Validar producto, conseguir primeros pagos

### Fase 2: Optimización (Mes 3+)
```env
FREE_MULTIMEDIA_STRATEGY="TRIAL_LIFETIME"
FREE_IMAGE_GENERATION_LIFETIME="3"
FREE_VOICE_MESSAGES_LIFETIME="5"
```
- Costo: ~$50-100/mes (según tráfico)
- Foco: Mejorar conversión FREE → Plus

### Fase 3: Escala (Mes 6+)
```env
FREE_MULTIMEDIA_STRATEGY="TRIAL_TIME"
FREE_MULTIMEDIA_TRIAL_DAYS="7"  # Trial corto para maximizar conversión
```
- Costo: Variable según growth
- Foco: Crecimiento agresivo

---

## 🔧 Troubleshooting

### Problema: Cambié .env pero sigue bloqueado

```bash
# Verificar que se cargó el nuevo valor
node -e "console.log(process.env.FREE_MULTIMEDIA_STRATEGY)"

# Reiniciar con --force
pm2 restart all --force

# Verificar logs
pm2 logs | grep "Strategy"
```

### Problema: Usuario reporta "ya usé mi trial" pero no es cierto

```sql
-- Verificar uso real
SELECT COUNT(*)
FROM "PendingImageGeneration"
WHERE "userId" = 'USER_ID_HERE'
AND status IN ('completed', 'generating');

-- Si está mal, resetear manualmente (solo en casos excepcionales)
DELETE FROM "PendingImageGeneration"
WHERE "userId" = 'USER_ID_HERE';
```

---

## 📚 Archivos Relacionados

- [lib/multimedia/limits.ts](../lib/multimedia/limits.ts) - Lógica de límites
- [lib/services/message.service.ts](../lib/services/message.service.ts) - Integración en processMultimedia
- [app/api/user/multimedia-status/route.ts](../app/api/user/multimedia-status/route.ts) - Endpoint de consulta
- [.env.example](../.env.example) - Configuración

---

## ✅ Checklist Pre-Deploy

- [ ] Decidir estrategia inicial (BLOCKED recomendado para lanzamiento)
- [ ] Configurar `.env` con valores deseados
- [ ] Reiniciar servidor
- [ ] Verificar logs que muestran estrategia correcta
- [ ] Probar con usuario FREE (crear cuenta test)
- [ ] Verificar mensajes de upgrade son claros
- [ ] Monitorear costos primeros días
- [ ] Ajustar límites si es necesario
