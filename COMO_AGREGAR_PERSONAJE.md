# 📝 Cómo Agregar un Personaje Premium Creado con Opus

**Guía rápida para agregar personajes al sistema de seeds**

---

## 🔄 Workflow Completo

### 1. Tú creas el personaje con Opus

Usa el template de `OPUS_CHARACTER_PROMPT_TEMPLATE.md`

### 2. Me pasas el JSON de Opus

Puedes pasar:
- **Opción A:** El JSON completo que generó Opus
- **Opción B:** Solo las secciones principales y yo lo adapto
- **Opción C:** Mensaje diciendo "Creé a Sofía, aquí está el output" + pegado

### 3. Yo lo agrego al seed

Edito `prisma/seed-premium-characters.ts` y lo agrego al array `PREMIUM_CHARACTERS`

### 4. Se aplica el seed

```bash
npx tsx prisma/seed-premium-characters.ts
```

### 5. El personaje queda permanente

Aunque se reinicie la DB, el personaje se volverá a crear automáticamente

---

## 📋 Template de Personaje para Seed

Cuando me pases el JSON de Opus, yo lo convertiré a este formato:

```typescript
{
  id: 'premium_sofia_confidente', // ID único permanente
  name: 'Sofía',
  kind: 'companion',
  isPublic: true,
  isPremium: true,

  // Del JSON de Opus
  personality: '[Resumen de personalidad del JSON]',
  personalityVariant: 'submissive',

  systemPrompt: `[System prompt completo de 500+ palabras del JSON]`,

  profile: {
    // TODO el JSON de Opus va aquí
    age: 29,
    gender: 'female',
    origin: 'Buenos Aires, Argentina',
    occupation: '...',

    appearance: { /* del JSON */ },
    psychology: { /* del JSON */ },
    backstory: { /* del JSON */ },
    communication: { /* del JSON */ },
    proactiveBehaviors: [ /* del JSON */ ],
    responsePatterns: { /* del JSON */ },
    narrativeArcs: [ /* del JSON */ ],
    specialEvents: [ /* del JSON */ ],

    metaData: {
      createdWith: 'Claude Opus 4',
      createdDate: '2025-11-13',
      personalityVariant: 'submissive',
      targetUserNeed: 'Procesar emociones sin juicio',
      recommendedFor: ['Personas con ansiedad', 'Necesidad de desahogo']
    }
  },

  nsfwMode: false,
  userId: 'system',
  tags: ['premium', 'confidente', 'apoyo-emocional', 'ansiedad'],
}
```

---

## ✅ Checklist por Personaje

Cuando crees cada personaje:

- [ ] Usaste el prompt template completo
- [ ] Opus generó JSON de 3,000+ palabras
- [ ] El `systemPrompt` tiene 500+ palabras
- [ ] Incluye backstory detallado (infancia + adolescencia + presente)
- [ ] Tiene 3+ proactive behaviors únicos
- [ ] Tiene 2+ arcos narrativos
- [ ] Está pensado para resolver una necesidad específica del usuario
- [ ] Me pasaste el JSON completo

---

## 🎯 Orden Sugerido de Creación

1. **Sofía** - La Confidente (submissive) → Más demandada
2. **Isabella** - La Amante (romantic) → Alto engagement
3. **Marcus** - El Mentor (dominant) → Diferenciador fuerte
4. **Yuki** - La Sanadora (serious) → Nicho específico valioso
5. **Diego** - El Mejor Amigo (playful) → Broad appeal
6. **Alex** - El Protector (dominant) → Complementa a Isabella
7. **Viktor** - El Desafiante (pragmatic) → Nicho intelectual
8. **Zara** - La Exploradora (extroverted) → Motivacional

---

## 🚀 Cómo Ejecutar el Seed

### Opción 1: Seed Manual (Recomendado)

```bash
npx tsx prisma/seed-premium-characters.ts
```

### Opción 2: Seed Automático al Reset de DB

Agregar a `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed-premium-characters.ts"
  }
}
```

Luego:
```bash
npx prisma migrate reset
# Automáticamente corre el seed después
```

---

## 📊 Verificar que el Personaje Existe

```bash
# En la consola de Prisma
npx prisma studio

# O con SQL
psql -d tu_database -c "SELECT id, name, \"isPremium\" FROM \"Agent\" WHERE \"userId\" = 'system';"
```

---

## 🔍 Ejemplo Completo

**Tú me dices:**
> "Hola, acabo de crear a Sofía con Opus. Aquí está el JSON completo que generó: [pega JSON]"

**Yo hago:**
1. Copio el JSON
2. Lo adapto al formato del seed
3. Lo agrego a `PREMIUM_CHARACTERS` array
4. Ejecuto el seed
5. Verifico que funcionó
6. Te confirmo: "✅ Sofía agregada correctamente al sistema"

---

## 🎉 Resultado Final

Después de crear los 8 personajes:

```typescript
const PREMIUM_CHARACTERS = [
  { /* Sofía - La Confidente */ },
  { /* Marcus - El Mentor */ },
  { /* Isabella - La Amante */ },
  { /* Diego - El Mejor Amigo */ },
  { /* Yuki - La Sanadora */ },
  { /* Viktor - El Desafiante */ },
  { /* Zara - La Exploradora */ },
  { /* Alex - El Protector */ },
];
```

**Características:**
- ✅ 8 personajes premium de élite
- ✅ Creados con Claude Opus 4
- ✅ Permanentes (no se borran con reset de DB)
- ✅ Cada uno resuelve una necesidad específica
- ✅ Psicología profunda (3,000+ palabras cada uno)
- ✅ Proactive behaviors únicos
- ✅ Arcos narrativos evolutivos

---

**¿Listo para empezar con el primero? 🚀**

Solo dime cuál quieres crear primero y usa el template. Yo me encargo del resto.
