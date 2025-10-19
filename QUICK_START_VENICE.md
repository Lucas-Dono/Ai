# 🚀 Quick Start - Venice AI

## ⚡ Inicio Rápido (5 minutos)

### 1. Verificar Configuración

```bash
# Ver que la API key esté configurada
grep VENICE_API_KEY .env
```

Deberías ver:
```
VENICE_API_KEY=4I6gdkCN16xu8zQq97HITnsKcDxxweLr4m9Ao1adVr
```

✅ **Ya está configurada!**

### 2. Ejecutar Tests

```bash
# Test rápido para verificar que todo funciona
npx tsx scripts/test-venice-client.ts
```

Deberías ver al final:
```
✅ TODOS LOS TESTS PASARON!
🎉 Venice AI está funcionando correctamente
```

### 3. Iniciar Servidor

```bash
npm run dev
```

### 4. Probar en el Chat

1. Abre http://localhost:3000
2. Selecciona un agente
3. Envía un mensaje
4. ¡Listo! El sistema emocional ahora usa Venice

## 🔍 Verificar que Funciona

En los logs de la consola deberías ver:

```
[Venice] 🏝️  Inicializando cliente privado...
[Venice] API Keys disponibles: 1
[Venice] Modelo por defecto: llama-3.3-70b
[Venice] 🚀 Sending request to llama-3.3-70b with API key #1...
[Venice] ✅ Response received in 1500ms
```

✅ Si ves `[Venice]` en lugar de `[OpenRouter]` → **Funciona!**

## 📊 Monitorear Uso

- **Dashboard Venice**: https://venice.ai/settings/api
- Revisa créditos restantes
- Monitorea uso por modelo

## 💰 Costos Esperados

- **Por mensaje emocional**: ~$0.0024 USD
- **Con $10 USD**: ~4,166 mensajes
- **Suficiente para**: 100+ horas de conversación

## ⚠️ Troubleshooting

### Error: "No se encontraron API keys"

```bash
# Verifica que VENICE_API_KEY esté en .env
cat .env | grep VENICE
```

Si no está, agrégala:
```bash
echo "VENICE_API_KEY=tu_key_aqui" >> .env
```

### Error 401: Unauthorized

- Verifica que la API key sea válida
- Revisa en https://venice.ai/settings/api

### Error 402: Insufficient Credits

- Necesitas agregar créditos a tu cuenta Venice
- Ve a https://venice.ai/settings/billing

### Respuestas muy lentas

1. **Usa modelo más rápido**: Cambia a `llama-3.2-3b`
   ```bash
   # En .env
   VENICE_MODEL=llama-3.2-3b
   ```

2. **Verifica conexión a internet**
   ```bash
   curl https://api.venice.ai/api/v1/models \
     -H "Authorization: Bearer $VENICE_API_KEY"
   ```

## 🎯 Configuración Avanzada

### Agregar Más API Keys (Rotación Automática)

```bash
# En .env
VENICE_API_KEY=key_principal_aqui
VENICE_API_KEY_1=key_backup_1_aqui
VENICE_API_KEY_2=key_backup_2_aqui
```

El sistema rotará automáticamente si una falla.

### Cambiar Modelo por Defecto

```bash
# En .env
# Para velocidad máxima:
VENICE_MODEL=llama-3.2-3b

# Para balance (recomendado):
VENICE_MODEL=llama-3.3-70b

# Para máxima calidad:
VENICE_MODEL=llama-3.1-405b
```

### Optimizar Costos

En `lib/emotional-system/llm/venice.ts`, línea ~371:

```typescript
export const RECOMMENDED_MODELS = {
  // Cambia todos a llama-3.2-3b para máximo ahorro
  APPRAISAL: "llama-3.2-3b",
  EMOTION: "llama-3.2-3b",
  REASONING: "llama-3.2-3b",  // Cambiar aquí
  ACTION: "llama-3.2-3b",
  RESPONSE: "llama-3.2-3b",   // Y aquí
  JSON: "llama-3.2-3b",       // Y aquí
};
```

Esto reducirá costos ~40% pero con menor calidad en respuestas.

## 📚 Documentación Completa

- `MIGRATION_SUMMARY.md` - Resumen completo de cambios
- `VENICE_MIGRATION.md` - Guía técnica detallada
- Venice API Docs: https://docs.venice.ai

## 🆘 Ayuda

### Logs Detallados

Si necesitas debug, busca estos mensajes:

```
[Venice] 🏝️  Inicializando cliente privado...
[Venice] 🚀 Sending request to llama-3.3-70b...
[Venice] ✅ Response received in XXXXms
[Venice] ❌ Error XXX: ...
```

### Contacto Venice Support

- Email: support@venice.ai
- Discord: https://discord.gg/venice
- Docs: https://docs.venice.ai

---

## ✅ Checklist de Verificación

- [ ] `grep VENICE_API_KEY .env` muestra la key
- [ ] `npx tsx scripts/test-venice-client.ts` pasa todos los tests
- [ ] `npm run dev` inicia sin errores
- [ ] Chat muestra logs `[Venice]` al enviar mensajes
- [ ] Respuestas se generan en 1-3 segundos
- [ ] Dashboard Venice muestra uso: https://venice.ai/settings/api

Si todos los checks están ✅ → **¡Todo funciona correctamente!** 🎉

---

**Tiempo estimado de setup**: 5 minutos
**Dificultad**: Fácil
**Status**: ✅ Listo para usar
