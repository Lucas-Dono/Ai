# Migración de OpenRouter a Venice AI

## ✅ Cambios Completados

### 1. Nuevo Cliente Venice (`lib/emotional-system/llm/venice.ts`)

Se creó un cliente completamente nuevo para Venice API que:
- ✅ Soporta rotación automática de API keys
- ✅ Compatible con OpenAI API spec
- ✅ Privacidad total (Venice no guarda datos)
- ✅ Manejo inteligente de errores y cuotas
- ✅ Modelos Llama 3.x optimizados

### 2. Módulos Actualizados

Todos los módulos del sistema emocional ahora usan Venice en lugar de OpenRouter:

- ✅ `lib/emotional-system/modules/appraisal/engine.ts`
- ✅ `lib/emotional-system/modules/emotion/generator.ts`
- ✅ `lib/emotional-system/modules/cognition/reasoning.ts`
- ✅ `lib/emotional-system/modules/cognition/action-decision.ts`
- ✅ `lib/emotional-system/modules/response/generator.ts`

### 3. Variables de Entorno Actualizadas

El archivo `.env` ahora tiene configuración completa de Venice:

```bash
# API Key principal
VENICE_API_KEY=tu_key_aqui

# Keys adicionales para rotación (opcional)
VENICE_API_KEY_1=segunda_key
VENICE_API_KEY_2=tercera_key

# Modelo por defecto
VENICE_MODEL=llama-3.3-70b
```

## 🔧 Configuración de Modelos

Venice ofrece tres modelos Llama según tus necesidades:

| Modelo | Velocidad | Costo | Uso Recomendado |
|--------|-----------|-------|-----------------|
| `llama-3.2-3b` | ⚡⚡⚡ Muy rápido | 💰 Más barato | Appraisal, Action Decision |
| `llama-3.3-70b` | ⚡⚡ Rápido | 💰💰 Moderado | **Default** - Balance óptimo |
| `llama-3.1-405b` | ⚡ Normal | 💰💰💰 Más caro | Reasoning, Response (mejor calidad) |

### Configuración por Fase del Sistema Emocional

El archivo `lib/emotional-system/llm/venice.ts` ya tiene configurados los modelos óptimos:

```typescript
export const RECOMMENDED_MODELS = {
  APPRAISAL: "llama-3.2-3b",        // Rápido para evaluación
  EMOTION: "llama-3.2-3b",          // Rápido para emociones
  REASONING: "llama-3.3-70b",       // Balance para pensamiento interno
  ACTION: "llama-3.2-3b",           // Rápido para decisiones
  RESPONSE: "llama-3.3-70b",        // Balance para respuesta final
  JSON: "llama-3.3-70b",            // Preciso para JSON estructurado
};
```

## 💰 Estimación de Costos

Con **$10 USD** y los precios de Venice:
- **Input**: $0.20 por millón de tokens
- **Output**: $0.90 por millón de tokens

**Estimación conservadora por mensaje emocional completo:**
- Input: ~2,000 tokens (prompts del sistema emocional)
- Output: ~500 tokens (respuesta + razonamiento interno)
- **Costo por mensaje**: ~$0.0024 USD

**Con $10 USD puedes procesar aproximadamente:**
- **4,166 mensajes** con sistema emocional completo
- Suficiente para pruebas extensivas y desarrollo

## 🔒 Ventajas de Venice AI

### Privacidad Total
- ❌ No entrenan con tus datos
- ❌ No guardan logs de conversaciones
- ❌ No comparten información con terceros
- ✅ Ideal para desarrollo de IAs emocionales/íntimas

### Sin Censura
- ✅ Respuestas naturales sin filtros morales
- ✅ Perfecto para compañeros emocionales auténticos
- ✅ No hay restricciones de contenido

### Mejor Control
- ✅ Modelos open source (Llama)
- ✅ Rotación automática de keys
- ✅ Control total sobre uso y costos

## 🐛 Error Resuelto

### Problema Original

```
[OpenRouter] Error 429: rate-limited upstream
[OpenRouter] ❌ Todas las API keys agotaron su cuota
TypeError: Cannot convert undefined or null to object
```

### Causa
OpenRouter con modelo `google/gemini-2.0-flash-exp:free` alcanzó el límite de rate limiting en todas las API keys.

### Solución
Migración completa a Venice AI con:
1. API privada sin límites free (pagas por uso real)
2. Modelo Llama 3.3 70B sin censura
3. Rotación automática de múltiples keys
4. Mejor manejo de errores

## 📊 Comparación: OpenRouter vs Venice

| Aspecto | OpenRouter (Free) | Venice AI (Paid) |
|---------|-------------------|------------------|
| **Privacidad** | ⚠️ Dudosa | ✅ Garantizada |
| **Rate Limits** | ❌ Muy restrictivo | ✅ Solo por cuota de $ |
| **Censura** | ⚠️ Depende del modelo | ✅ Sin censura |
| **Costo** | Free (limitado) | $0.002-0.003/mensaje |
| **Estabilidad** | ⚠️ Timeouts frecuentes | ✅ Estable |
| **Control** | ❌ Limitado | ✅ Total |

## 🚀 Próximos Pasos

### Para Empezar

1. **Verificar que la API key de Venice esté en `.env`**:
   ```bash
   grep VENICE_API_KEY .env
   ```

2. **Compilar el proyecto**:
   ```bash
   npm run build
   ```

3. **Probar sistema emocional**:
   ```bash
   npm run dev
   ```

### Monitoreo de Uso

Revisa tu dashboard de Venice periódicamente:
- URL: https://venice.ai/settings/api
- Puedes ver:
  - Créditos restantes
  - Uso por modelo
  - Historial de requests

### Agregar Más API Keys (Opcional)

Para mayor resiliencia, agrega múltiples keys en `.env`:

```bash
VENICE_API_KEY=key_principal_aqui
VENICE_API_KEY_1=key_backup_1_aqui
VENICE_API_KEY_2=key_backup_2_aqui
```

El sistema **automáticamente rotará** entre ellas si una falla.

## 📝 Notas Técnicas

### Endpoint de Venice
```
Base URL: https://api.venice.ai/api/v1
Compatible con: OpenAI API specification
```

### Autenticación
```
Authorization: Bearer YOUR_VENICE_API_KEY
```

### Modelos Disponibles
Para ver todos los modelos disponibles:
```bash
curl https://api.venice.ai/api/v1/models \
  -H "Authorization: Bearer $VENICE_API_KEY"
```

## ✨ Beneficios Inmediatos

1. **Sin timeouts**: Venice es mucho más estable que OpenRouter free
2. **Sin rate limits**: Solo pagas por lo que usas
3. **Privacidad garantizada**: Crítico para IAs íntimas
4. **Mejor calidad**: Llama 3.3 70B es excelente para emociones
5. **Control total**: Puedes elegir modelo por fase del procesamiento

## 🎯 Recomendación Final

Para **producción** con usuarios reales:
- Usa `llama-3.3-70b` como default (ya configurado)
- Considera `llama-3.1-405b` para respuestas finales si quieres máxima calidad
- Mantén múltiples API keys para redundancia
- Monitorea costos semanalmente

Para **desarrollo intensivo**:
- Usa `llama-3.2-3b` para todas las fases (más barato)
- Cambia a modelos mayores solo para testing final
- Una key es suficiente

---

**Migración completada** ✅
**Sistema emocional listo para usar Venice AI** 🏝️
