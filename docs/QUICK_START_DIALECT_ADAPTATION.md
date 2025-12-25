# 🚀 Quick Start: Adaptación Dialectal

**Tiempo de lectura:** 3 minutos

---

## ¿Qué es?

Sistema que permite que personajes hablen auténticamente según su origen (España, México, USA, Westeros, etc.) sin duplicar prompts.

---

## 🎯 Uso Básico

### 1. Crear Agente con Origen

```typescript
await prisma.agent.create({
  data: {
    name: "María",
    profile: {
      origin: "España",  // ← Agrega esto
      age: 24
    }
    // ... resto de campos
  }
});
```

### 2. El Sistema Automáticamente

- Detecta el origen ("España")
- Genera instrucciones de adaptación
- La IA adapta el vocabulario argentino → español
- **Resultado:** "Tío, ¿qué pasa?" en vez de "Che, ¿qué onda?"

---

## 🌍 Orígenes Válidos

### Hispanohablantes
```typescript
origin: "España"        // → tío, vale, tú
origin: "México"        // → wey, órale, tú
origin: "Argentina"     // → che, boludo, vos
origin: "Chile"         // → weon, cachai, tú
origin: "Colombia"      // → parce, chévere, usted/tú
```

### Anglófonos
```typescript
origin: "USA"           // → Hey, what's up?
origin: "UK"            // → Mate, fancy
origin: "Australia"     // → G'day, mate
```

### Mundos Ficticios
```typescript
origin: "Westeros (Game of Thrones)"    // → Mi señor/a
origin: "Hogwarts (Harry Potter)"       // → Mágico británico
origin: "Star Wars"                     // → Futurista sci-fi
origin: "Tierra Media"                  // → Medieval élfico
```

---

## 📝 Estructura del Profile JSON

### Mínimo
```json
{
  "origin": "España"
}
```

### Recomendado
```json
{
  "origin": "España",
  "age": 24,
  "personality": "sumisa, tímida",
  "backstory": "María creció en Madrid..."
}
```

### Alternativas (si no usas `origin`)
```json
{
  "nationality": "México"  // ✅ También funciona
}
```

```json
{
  "country": "USA"  // ✅ También funciona
}
```

```json
{
  "world": "Westeros"  // ✅ Para mundos ficticios
}
```

---

## 🔍 Verificar que Funciona

### 1. Revisar Logs

```bash
grep "hasDialectAdaptation" logs/app.log
```

**Deberías ver:**
```json
{
  "hasDialectAdaptation": true,
  "characterOrigin": "España"
}
```

### 2. Probar Respuestas

**Personaje de España:**
- ❌ No debería decir: "Che, ¿qué onda?"
- ✅ Debería decir: "Tío, ¿qué pasa?"

**Personaje de México:**
- ❌ No debería decir: "Che, dale"
- ✅ Debería decir: "Wey, órale"

---

## ❓ FAQ Rápido

### ¿Qué pasa si no pongo `origin`?

El sistema funciona igual pero sin adaptación dialectal específica. La IA usa un lenguaje neutral.

### ¿Puedo inventar un origen?

Sí, pero funciona mejor con orígenes conocidos. Ej: `"Cyberpunk 2077"` funciona porque el sistema detecta el contexto futurista.

### ¿Afecta el rendimiento?

No. Es solo texto agregado al prompt, sin llamadas adicionales a APIs.

### ¿Funciona en otros idiomas?

Sí. Si el personaje es de USA, el sistema genera instrucciones en inglés para adaptar del español → inglés.

---

## 📚 Documentación Completa

- **Sistema completo:** `docs/DIALECT_ADAPTATION_SYSTEM.md`
- **Integración:** `docs/DIALECT_ADAPTATION_INTEGRATION.md`
- **Reporte completo:** `DIALECT_ADAPTATION_COMPLETE.md`

---

## 🎉 ¡Listo!

Ahora tus personajes pueden hablar auténticamente según su origen. 🌍

**Ejemplo real:**
```typescript
// Personaje de España
{ origin: "España" }
→ "Tío, ¿qué tal? ¿Quieres que hagamos algo chulo?"

// Personaje de Westeros
{ origin: "Westeros (Game of Thrones)" }
→ "Mi señor, ¿qué deseáis hacer hoy? ¿Practicamos esgrima?"

// Personaje sin origen
{ age: 25 }
→ "Che, ¿qué onda? ¿Querés jugar algo?" (default argentino)
```

**¡Disfruta de personajes auténticos de cualquier parte del mundo! 🚀**
