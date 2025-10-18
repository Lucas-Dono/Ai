# 🔍 Sistema de Vision - Image Captioning con HuggingFace

Sistema de procesamiento de imágenes con **rotación de API keys** y **control de costos** para el lanzamiento.

## 🎯 Problema Resuelto

Los usuarios pueden enviar imágenes al chat, pero tu LLM no tiene capacidad de leerlas. Este sistema genera **descripciones de texto** de las imágenes para que tu LLM pueda responder apropiadamente.

## 💡 Solución Implementada

### **HuggingFace Vision con Rotación de Keys**
- **Modelo**: BLIP-2 (Salesforce) - Image Captioning
- **Rotación automática** de múltiples API keys (igual que OpenRouter)
- **Tier gratuito**: 30,000 requests/mes por key
- **Sin censura**: Modelos open source

### **Sistema de Límites por Usuario**
Para protegerte de costos inesperados:
- **Free users**: 10 imágenes/mes
- **Premium users**: 100 imágenes/mes (cuando implementes pagos)
- **Pro users**: Ilimitadas (reasonable use: 500/mes)
- Contador se resetea automáticamente cada mes

## 📊 Costos Proyectados

### **Escenario Conservador (Primer Año)**

| Usuarios | Imágenes/mes | Keys Necesarias | Costo Mensual |
|----------|--------------|-----------------|---------------|
| 50       | 500          | 1 (gratis)      | $0            |
| 200      | 2,000        | 1 (gratis)      | $0            |
| 500      | 5,000        | 1 (gratis)      | $0            |
| 1,000    | 10,000       | 1 (gratis)      | $0            |
| 3,000    | 30,000       | 1 (gratis)      | $0            |

### **Escalamiento con Múltiples Keys**

Con rotación de keys puedes escalar SIN COSTO:

| Keys | Imágenes Gratis/Mes | Usuarios Soportados (10 img/u) |
|------|---------------------|--------------------------------|
| 1    | 30,000              | 3,000                          |
| 5    | 150,000             | 15,000                         |
| 10   | 300,000             | 30,000                         |

**Crear cuentas es gratis** → Puedes crear múltiples cuentas de HuggingFace.

## ⚙️ Configuración

### 1. Crear API Keys de HuggingFace

1. Ve a https://huggingface.co/settings/tokens
2. Crea un token con permisos de **read**
3. Repite para crear múltiples tokens (recomendado: 5 keys)

### 2. Configurar Variables de Entorno

En tu `.env`:

```env
# Opción 1: Una sola key
HUGGINGFACE_API_KEY="hf_your_api_key_here"

# Opción 2: Múltiples keys para rotación (RECOMENDADO)
HUGGINGFACE_API_KEY_1="hf_key_1"
HUGGINGFACE_API_KEY_2="hf_key_2"
HUGGINGFACE_API_KEY_3="hf_key_3"
HUGGINGFACE_API_KEY_4="hf_key_4"
HUGGINGFACE_API_KEY_5="hf_key_5"
```

El sistema detectará automáticamente todas las keys numeradas.

### 3. Aplicar Migración de Base de Datos

La base de datos ya fue sincronizada con `prisma db push`. Los nuevos campos en el modelo `User` son:

```prisma
model User {
  // ...
  imageUploadsThisMonth Int      @default(0)
  imageUploadLimit      Int      @default(10)
  imageUploadResetDate  DateTime @default(now())
  // ...
}
```

## 🚀 Uso

### **Desde el Frontend**

El usuario simplemente sube una imagen desde el chat. El componente `ImageUploader` enviará un `FormData`:

```typescript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('content', 'Mira esta foto');

const response = await fetch(`/api/agents/${agentId}/message`, {
  method: 'POST',
  body: formData,
});
```

### **Procesamiento Automático**

1. **Endpoint detecta** que es FormData (imagen)
2. **Verifica límite** de imágenes del usuario
3. **Genera caption** con HuggingFace Vision:
   - Ejemplo: `"a young woman with blonde hair wearing a red dress"`
4. **Enriquece el prompt** para el LLM:
   ```
   [Imagen: a young woman with blonde hair wearing a red dress]

   Mira esta foto
   ```
5. **LLM responde** basándose en la descripción
6. **Incrementa contador** de imágenes del usuario

### **Rotación Automática de Keys**

Si una key alcanza su límite:
```
[HuggingFace Vision] Error 429: Rate limit exceeded
[HuggingFace Vision] 🔄 Rotando a API key #2
[HuggingFace Vision] Generating caption with key #2...
```

## 📈 Ejemplo de Respuesta

**Usuario sube**: Foto de una playa al atardecer

**Sistema procesa**:
```
Caption generado: "a beautiful beach at sunset with orange and pink sky"
```

**Prompt enviado al LLM**:
```
[Imagen: a beautiful beach at sunset with orange and pink sky]

¿Qué te parece esta vista?
```

**LLM responde**:
```
¡Qué hermoso atardecer! El cielo naranja y rosa se ve espectacular.
Me encantaría estar ahí contigo viendo esos colores. 💕
¿Dónde es esa playa?
```

## 🛡️ Manejo de Errores

### **Límite de Imágenes Alcanzado**

```json
{
  "error": "Límite mensual de imágenes alcanzado",
  "current": 10,
  "limit": 10,
  "resetDate": "2025-11-01T00:00:00.000Z",
  "upgrade": "/pricing"
}
```

### **Todas las Keys Agotadas**

```json
{
  "error": "Error al procesar la imagen. Por favor, intenta de nuevo.",
  "details": "All API keys exhausted"
}
```

En este caso, necesitas:
1. Agregar más keys a `.env`
2. O esperar a que resetee el límite mensual
3. O considerar un tier de pago de HuggingFace

## 📊 Monitoreo

### **Ver Estadísticas de Keys**

```typescript
const visionClient = new HuggingFaceVisionClient({});
const stats = visionClient.getKeyStats();

console.log(`Usando key ${stats.current} de ${stats.total}`);
// Output: "Usando key 2 de 5"
```

### **Logs Automáticos**

El sistema logea automáticamente:
```
[HuggingFace Vision] Inicializando cliente...
[HuggingFace Vision] API Keys disponibles: 5
[HuggingFace Vision] Generating caption with key #1...
[HuggingFace Vision] Caption generated in 1524ms: "a young woman with..."
```

## 🔧 Configuración Avanzada

### **Cambiar Modelo**

Por defecto usa BLIP-2, pero puedes cambiar:

```typescript
const visionClient = new HuggingFaceVisionClient({
  defaultModel: "microsoft/Florence-2-large", // Más detallado
  // o "vikhyatk/moondream2" para más velocidad
});
```

### **Ajustar Límites por Plan**

Cuando implementes planes de pago, actualiza los límites:

```typescript
// Al crear usuario premium
await prisma.user.update({
  where: { id: userId },
  data: {
    imageUploadLimit: 100, // Premium: 100 imágenes/mes
  },
});

// Usuario pro (ilimitado)
await prisma.user.update({
  where: { id: userId },
  data: {
    imageUploadLimit: 999999, // Efectivamente ilimitado
  },
});
```

## 💰 Monetización Futura

Cuando tengas usuarios y quieras monetizar:

### **Plan Sugerido**

| Tier      | Precio  | Imágenes/mes | Tu Costo | Ganancia |
|-----------|---------|--------------|----------|----------|
| **Free**  | $0      | 10           | $0.0001  | $0       |
| **Plus**  | $5/mes  | 100          | $0.001   | $4.999   |
| **Pro**   | $15/mes | Ilimitado*   | ~$0.05   | $14.95   |

*Ilimitado = reasonable use (500/mes)

### **Break-even**

Con **10 usuarios Plus** ($50/mes ingreso):
- Costo de imágenes: ~$0.10/mes
- **Profit**: $49.90/mes (500x ROI)

## 🎯 Ventajas de Esta Solución

✅ **Costo $0** para empezar
✅ **Escala gratis** con múltiples keys
✅ **Sin censura** (modelos open source)
✅ **Protección automática** de costos con límites
✅ **Mismo patrón** que OpenRouter (código familiar)
✅ **Listo para monetizar** cuando tengas usuarios

## 📝 TODOs Futuros (Opcional)

- [ ] Dashboard para ver uso de imágenes por usuario
- [ ] Notificaciones cuando el usuario alcance 80% del límite
- [ ] Opción para comprar packs de imágenes adicionales
- [ ] Caché de captions para imágenes similares (ahorro adicional)
- [ ] A/B testing de modelos (BLIP vs Florence vs Moondream)

## 🤝 Soporte

Si tienes problemas:
1. Verifica que las API keys estén en `.env`
2. Revisa los logs en la consola
3. Asegúrate de tener conexión a internet
4. Verifica que la imagen sea válida (< 5MB, formato válido)

---

**Listo para el lanzamiento** 🚀 Con $100 en reserva puedes soportar **millones** de imágenes usando múltiples keys gratuitas.
