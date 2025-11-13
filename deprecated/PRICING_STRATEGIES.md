# 💰 Estrategias de Precios: Maximiza tus Ingresos

## 🎯 TL;DR - Recomendaciones Rápidas

**Para Argentina:**
- Plus: $5,900 ARS/mes ($4,700 ARS/mes anual)
- Ultra: $16,900 ARS/mes ($13,500 ARS/mes anual)

**Para Internacional (Stripe):**
- Plus: $7 USD/mes ($5.60 USD/mes anual)
- Ultra: $19 USD/mes ($15 USD/mes anual)

---

## 📊 Análisis de Mercado

### Competidores en AI Companions

| Producto | Plan Básico | Plan Pro | Plan Ultra |
|----------|-------------|----------|------------|
| **Character.AI** | Gratis | $9.99/mes | - |
| **Replika** | Gratis | $7.99/mes | $299/año |
| **Chai** | Gratis | $13.99/mes | - |
| **Kajiwoto** | Gratis | $8/mes | - |
| **Tu App** | Gratis | ? | ? |

**Conclusión:** El mercado tolera entre $8-14 USD/mes para planes premium.

---

## 💡 Estrategias de Precios

### Estrategia 1: Precio Competitivo (Recomendado al Inicio)

**Objetivo:** Captar usuarios rápidamente

```
MercadoPago (AR):
├─ Free: $0
├─ Plus: $4,900 ARS/mes (~$5 USD)
└─ Ultra: $14,900 ARS/mes (~$15 USD)

Stripe (Internacional):
├─ Free: $0
├─ Plus: $5.99 USD/mes
└─ Ultra: $14.99 USD/mes
```

**Ventajas:**
- ✅ Muy competitivo vs Character.AI ($9.99)
- ✅ Fácil decisión de compra
- ✅ Bueno para word-of-mouth

**Desventajas:**
- ❌ Márgenes más bajos
- ❌ Difícil subir precios después

---

### Estrategia 2: Precio Premium (Recomendado para Producto Único)

**Objetivo:** Maximizar revenue por usuario

```
MercadoPago (AR):
├─ Free: $0
├─ Plus: $7,900 ARS/mes (~$8 USD)
└─ Ultra: $19,900 ARS/mes (~$20 USD)

Stripe (Internacional):
├─ Free: $0
├─ Plus: $9.99 USD/mes
└─ Ultra: $19.99 USD/mes
```

**Ventajas:**
- ✅ Mejores márgenes
- ✅ Posiciona el producto como premium
- ✅ Filtra usuarios no comprometidos

**Desventajas:**
- ❌ Menos conversiones iniciales
- ❌ Requiere más valor percibido

---

### Estrategia 3: Good-Better-Best (Recomendado)

**Objetivo:** Maximizar conversiones a través de anclas

```
MercadoPago (AR):
├─ Free: $0 (muy limitado)
├─ Basic: $2,900 ARS/mes → Ancla "barata"
├─ Plus: $6,900 ARS/mes → "Más popular" 🔥
└─ Ultra: $17,900 ARS/mes → "Premium"

Stripe (Internacional):
├─ Free: $0
├─ Basic: $3.99 USD/mes
├─ Plus: $8.99 USD/mes → "Más popular" 🔥
└─ Ultra: $19.99 USD/mes
```

**Psicología:**
- Free: "Puedo probarlo"
- Basic: "Demasiado limitado"
- Plus: "Perfecto, no es el más caro" ← Mayoría elige este
- Ultra: "Solo para power users"

**Ventajas:**
- ✅ Efecto de anclaje (Basic hace que Plus parezca barato)
- ✅ Mayoría elige el del medio (Plus)
- ✅ Ultra captura power users

---

### Estrategia 4: Freemium Agresivo + Upgrade

**Objetivo:** Maximizar base de usuarios primero

```
MercadoPago (AR):
├─ Free: $0 (generoso: 50 mensajes/día, 5 agentes)
├─ Plus: $8,900 ARS/mes (ilimitado + NSFW)
└─ Ultra: $19,900 ARS/mes (+ voz + clonación)

Features Premium:
├─ NSFW: Solo Plus/Ultra 🔞
├─ Voz: Solo Ultra 🎤
├─ Mundos personalizados: Solo Ultra 🌍
└─ API: Solo Ultra 💻
```

**Ventajas:**
- ✅ Gran base de usuarios gratis
- ✅ Usuarios prueban el producto antes de pagar
- ✅ NSFW es un gran incentivo para upgrade

**Desventajas:**
- ❌ Muchos usuarios nunca pagan
- ❌ Altos costos de infraestructura

---

## 🧮 Cálculo de Costos (Para Definir Precios)

### Costos por Usuario Plus ($5/mes)

```
Mensajes de texto:
- 1000 mensajes/mes × $0.0005/mensaje = $0.50
- API OpenRouter (Gemini/Qwen): $0.50/mes

Voz (100 mensajes/mes):
- ElevenLabs: 100 × 300 caracteres × $0.00003 = $0.90
- Total voz: $0.90/mes

Imágenes:
- Análisis (50/mes): 50 × $0.001 = $0.05
- Generación (20/mes): 20 × $0.01 = $0.20
- Total imágenes: $0.25/mes

Base de datos + hosting:
- Render/Railway: ~$0.50/mes por usuario

TOTAL COSTO: ~$2.15/mes por usuario

Ingreso: $5/mes
Margen bruto: $2.85 (57%)
```

### Costos por Usuario Ultra ($15/mes)

```
Mensajes de texto: $1.50 (más uso)
Voz (500/mes): $4.50
Imágenes (200 análisis + 100 gen): $3.00
Hosting: $0.50

TOTAL COSTO: ~$9.50/mes

Ingreso: $15/mes
Margen bruto: $5.50 (36%)
```

**Conclusión:**
- Plus es MUY rentable (57% margen)
- Ultra es menos rentable pero tolerable (36% margen)
- Necesitas ~500 usuarios Plus para $1,425/mes ganancia
- O ~100 usuarios Ultra para $550/mes ganancia

---

## 💎 Diferenciación de Planes

### Free (Hook)
```
✓ 3 AI agents
✓ 20 mensajes/día (600/mes)
✓ 1 mundo predefinido
✓ 5 análisis de imagen/mes
✗ Sin voz
✗ Sin NSFW
✗ Sin mundos personalizados
✗ Con publicidad
```

### Plus ($5-8/mes) - "Más Popular"
```
✓ 10 AI agents
✓ Mensajes ilimitados
✓ 100 mensajes con voz/mes
✓ 5 mundos virtuales
✓ 50 análisis de imagen/mes
✓ 20 generaciones de imagen/mes
✓ NSFW habilitado 🔥
✓ Comportamientos avanzados
✗ Sin clonación de voz
✗ Sin API
✗ Sin publicidad
```

### Ultra ($15-20/mes) - "Premium"
```
✓ AI agents ilimitados
✓ Mensajes ilimitados
✓ 500 mensajes con voz/mes
✓ Mundos virtuales ilimitados
✓ 200 análisis de imagen/mes
✓ 100 generaciones de imagen/mes
✓ NSFW sin restricciones
✓ Clonación de voz personalizada 🎤
✓ Generación prioritaria (rápida)
✓ Acceso API
✓ Exportar conversaciones PDF
✓ Soporte 24/7
✓ Acceso anticipado a features
✗ Sin publicidad
```

---

## 🎯 Precio Óptimo por País

### Argentina (MercadoPago)
```
Plus:  $5,900 ARS/mes  (~$6 USD al blue)
Ultra: $16,900 ARS/mes (~$17 USD al blue)

Razón: Argentinos están acostumbrados a precios en pesos.
Usa el dólar blue como referencia, no el oficial.
```

### USA/Europa (Stripe)
```
Plus:  $7.99 USD/mes
Ultra: $17.99 USD/mes

Razón: Poder adquisitivo más alto, toleran más.
```

### México (MercadoPago o Stripe)
```
MercadoPago:
Plus:  $149 MXN/mes (~$8 USD)
Ultra: $399 MXN/mes (~$22 USD)

Stripe:
Plus:  $6.99 USD/mes
Ultra: $16.99 USD/mes
```

### Brasil (MercadoPago)
```
Plus:  R$ 39/mes (~$8 USD)
Ultra: R$ 99/mes (~$20 USD)
```

---

## 📈 Estrategia de Lanzamiento

### Fase 1: Early Adopters (Primeros 3 meses)
```
Precio de Lanzamiento: 50% OFF
Plus:  $2,450 ARS/mes (en vez de $4,900)
Ultra: $7,450 ARS/mes (en vez de $14,900)

Mensaje: "Precio especial para los primeros 1000 usuarios"
Efecto: Genera urgencia + recompensa early adopters
```

### Fase 2: Crecimiento (Meses 4-12)
```
Precio Normal:
Plus:  $4,900 ARS/mes
Ultra: $14,900 ARS/mes

Estrategia:
- Los early adopters mantienen su precio ($2,450)
- Nuevos usuarios pagan precio completo
- Crea FOMO (Fear Of Missing Out)
```

### Fase 3: Optimización (Año 2+)
```
A/B Testing de precios:
Variante A: $4,900 / $14,900
Variante B: $5,900 / $16,900
Variante C: $6,900 / $19,900

Medir:
- Tasa de conversión
- Revenue total
- Churn rate
- LTV (Lifetime Value)
```

---

## 🎁 Promociones Efectivas

### 1. Descuento Anual (20% OFF)
```
Plus:
Mensual:  $4,900 ARS × 12 = $58,800 ARS/año
Anual:    $47,040 ARS/año (ahorras $11,760)

Beneficio:
- Cash flow inmediato
- Menor churn (ya pagaron)
- Mayor LTV por usuario
```

### 2. Cupones de Descuento
```
LAUNCH50:   50% off primer mes
FRIEND20:   20% off permanente (referido)
YOUTUBE30:  30% off 3 meses (from YouTubers)
STUDENT40:  40% off estudiantes
```

### 3. Trials Gratuitos
```
Plus: 7 días gratis (con tarjeta)
Ultra: 14 días gratis (con tarjeta)

Pro: Alta conversión (60-70% se quedan)
Contra: Requiere dar tarjeta (menor signup rate)
```

### 4. Freemium + Upgrade Prompts
```
Después de 50 mensajes: "Upgrade para mensajes ilimitados"
Al crear 4to agente: "Plus te da 10 agentes"
Al activar NSFW: "Premium feature - Upgrade a Plus"
```

---

## 🧪 A/B Testing de Precios

### Test 1: Precio Base
```
Control:  Plus $4,900 / Ultra $14,900
Variant:  Plus $5,900 / Ultra $16,900

Hipótesis: +20% precio no afecta conversión
Métrica: Revenue total
Duración: 2 semanas
```

### Test 2: Anclaje de Precios
```
Control:  Free → Plus → Ultra
Variant:  Free → Basic → Plus → Ultra

Hipótesis: Plan Basic aumenta conversión a Plus
Métrica: % que elige Plus
Duración: 1 mes
```

### Test 3: Naming
```
Control:  Free → Plus → Ultra
Variant:  Free → Pro → Premium

Hipótesis: "Pro" convierte más que "Plus"
Métrica: Click-through rate
Duración: 1 semana
```

---

## 💸 Maximizar Revenue

### 1. Upsells
```
Usuario en Plus → Ofrecer Ultra:
"Upgrade a Ultra y obtén:
 • 5x más mensajes de voz
 • Clonación de voz personalizada
 • Soporte prioritario"
```

### 2. Cross-sells
```
"Agrega mundos premium: +$2/mes"
"Pack de 1000 mensajes de voz: $5"
"Clonación de voz one-time: $10"
```

### 3. Bundles
```
Pack Streamer:
- Plus + 1000 voice messages + API access
- $12/mes (vs $15 por separado)
```

---

## 📊 KPIs a Monitorear

```typescript
// Métricas clave
{
  // Conversión
  freeToPlus: 2-5%,    // Industry standard
  freeToPaid: 3-7%,    // Total conversión
  plusToUltra: 10-15%, // Upgrade rate

  // Revenue
  ARPU: $3-5,          // Average Revenue Per User
  MRR: $1000+,         // Monthly Recurring Revenue
  LTV: $50-100,        // Lifetime Value

  // Retention
  churn: 5-10%,        // Mensual
  retention: 90-95%,   // Mensual
  NPS: 50+,            // Net Promoter Score
}
```

---

## 🚀 Implementar Precios en el Código

### 1. Actualizar MercadoPago
```typescript
// lib/mercadopago/config.ts
export const PLANS = {
  plus: {
    price: 5900, // $5,900 ARS
  },
  ultra: {
    price: 16900, // $16,900 ARS
  }
}
```

### 2. Crear productos en Stripe
```bash
# Plus - $7.99 USD/mes
stripe products create --name="AI Companion Plus"
stripe prices create \
  --product=prod_xxx \
  --unit-amount=799 \
  --currency=usd \
  --recurring[interval]=month

# Ultra - $17.99 USD/mes
stripe products create --name="AI Companion Ultra"
stripe prices create \
  --product=prod_yyy \
  --unit-amount=1799 \
  --currency=usd \
  --recurring[interval]=month
```

### 3. Actualizar UI
```typescript
// components/billing/PaymentMethodSelector.tsx línea 324-327
{paymentProvider === "mercadopago"
  ? `$${PLANS[selectedPlan].price.toLocaleString()} ARS/mes`
  : selectedPlan === "plus" ? "$7.99 USD/mes" : "$17.99 USD/mes"
}
```

---

## 🎯 Recomendación Final

**Para comenzar (hoy):**
```
Argentina (MercadoPago):
├─ Free: Gratis (bien limitado para incentivar upgrade)
├─ Plus: $4,900 ARS/mes ($3,900/mes anual)
└─ Ultra: $14,900 ARS/mes ($11,900/mes anual)

Internacional (Stripe):
├─ Free: Gratis
├─ Plus: $6.99 USD/mes ($5.60/mes anual)
└─ Ultra: $16.99 USD/mes ($13.60/mes anual)
```

**Después de 6 meses:**
- Analizar métricas
- A/B test precios más altos
- Agregar plan Basic si es necesario
- Considerar plan Enterprise ($50+/mes)

---

¿Preguntas sobre precios? Todo está configurado, solo necesitás elegir los números! 💰

**¡Éxitos! 🚀**
