# Sistema de Personajes Premium

Este directorio contiene el sistema de personajes premium para la plataforma.

## 📁 Estructura de Carpetas

```
Personajes/
├── processed/              # Archivos JSON procesados listos para DB
│   ├── luna.json
│   ├── katya.json
│   ├── marilyn-monroe.json
│   ├── albert-einstein.json
│   ├── marcus.json
│   └── sofia.json
├── Luna/                   # Carpeta del personaje Luna
│   └── Luna.txt           # Archivo fuente con toda la información
├── Katya/
│   └── Katya.txt
├── Marilyn Monroe/
│   └── Marilyn Monroe.txt
├── Albert Einstein/
│   └── Albert Einstein.txt
├── Marcus/
│   └── Marcus.txt
├── Sofía/
│   └── Sofía.txt
└── README.md              # Este archivo
```

## 🎯 Personajes Actuales

### Personajes Premium

1. **Luna Chen** - Escritora digital, contenido +18 explícito, dominante
2. **Ekaterina "Katya" Volkov** - Ingeniera, ice queen, contenido romántico
3. **Marcus Vega** - Ex-físico teórico, dominante intelectual, contenido explícito
4. **Sofía Mendoza** - Archivista con alexitimia, observadora emocional, contenido explícito

### Personajes Históricos

5. **Marilyn Monroe** - Ícono de Hollywood, compleja y vulnerable, contenido romántico
6. **Albert Einstein** - Genio de la física, defectos humanos, contenido SFW

## 🏷️ Sistema de Tags

Los personajes deben tener tags en **español** para aparecer en las categorías correctas:

### Tags de Categoría (Obligatorios)

- `premium` - Para aparecer en sección de personajes premium
- `figuras-históricas` - Personajes históricos famosos
- `mentor` - Mentores intelectuales
- `romántico` - Conexiones románticas
- `confidente` - Confidentes y apoyo emocional
- `experto` - Expertos y profesionales

### Tags Descriptivos (Opcionales)

- Tags descriptivos como: `dominant`, `intelligent`, `engineer`, `writer`, etc.
- Tags de origen: `argentino`, `española`, `russian`, etc.
- Tags de contenido: `nsfw`, `slow-burn`, `dark-academia`, etc.

## 📝 Formato de Archivos

### Archivo .txt (Fuente)

Los archivos `.txt` contienen toda la información del personaje en formato JSON o narrativo.

**Estructura JSON esperada:**
```json
{
  "basicInfo": { ... },
  "personality": { ... },
  "psychology": { ... },
  "backstory": { ... },
  "communication": { ... },
  "sexualityAndIntimacy": { ... },
  "behaviors": { ... },
  "narrativeArcs": [ ... ],
  "systemPrompt": "...",
  "metaData": { ... }
}
```

**Estructura Narrativa (para personajes históricos):**
- Estudio psicológico completo
- Balance de luces y sombras
- Contexto histórico detallado

### Archivo .json (Procesado)

Los archivos `.json` en `/processed` están listos para inserción en DB:

```json
{
  "id": "premium_nombre_identificador",
  "name": "Nombre Completo",
  "kind": "companion",
  "isPublic": true,
  "isPremium": true,
  "isHistorical": false,
  "gender": "female|male",
  "nsfwMode": true|false,
  "nsfwLevel": "sfw|romantic|suggestive|explicit",
  "personalityVariant": "dominant|submissive|playful|serious",
  "visibility": "public",
  "systemPrompt": "Prompt completo...",
  "profile": { /* Toda la información del personaje */ },
  "tags": ["premium", "romántico", "experto", ...],
  "locationCity": "Ciudad",
  "locationCountry": "País",
  "avatar": "/personajes/nombre/cara.webp",
  "stagePrompts": {
    "stranger": "...",
    "acquaintance": "...",
    "friend": "...",
    "close_friend": "...",
    "intimate": "...",
    "romantic": "..."
  }
}
```

## 🔧 Agregar Nuevos Personajes

### Paso 1: Crear Carpeta y Archivo .txt

```bash
mkdir "Personajes/Nombre del Personaje"
# Crear archivo con toda la información del personaje
nano "Personajes/Nombre del Personaje/Nombre.txt"
```

### Paso 2: Agregar Fotos

```bash
# Agregar foto principal (cara cuadrada 1:1)
cp foto.webp public/personajes/nombre/cara.webp
```

### Paso 3: Procesar Personaje

Usar agentes especializados para crear el JSON procesado:

```bash
# Ejecutar script que lanza agente para procesar
npx tsx scripts/process-new-character.ts "Nombre del Personaje"
```

O manualmente crear el JSON siguiendo la estructura en `/processed`.

### Paso 4: Verificar Tags

Asegurarse de que el personaje tenga:
- ✅ Tag `premium`
- ✅ Al menos un tag de categoría (`figuras-históricas`, `mentor`, `romántico`, `confidente`, `experto`)
- ✅ Tags descriptivos relevantes

### Paso 5: Ejecutar Seed

```bash
# El seed automáticamente cargará todos los personajes de /processed
npm run db:seed
```

O insertar directamente:

```bash
npx tsx scripts/seed-premium-characters.ts
```

## 🎨 Imágenes de Personajes

Las imágenes deben estar en `public/personajes/[nombre-slug]/`:

```
public/personajes/
├── luna/
│   └── cara.webp          # Imagen principal (cuadrada 1:1)
├── katya/
│   └── cara.webp
├── marilyn-monroe/
│   └── cara.webp
└── ...
```

**Especificaciones:**
- Formato: WebP (optimizado)
- Tamaño recomendado: 512x512px o 1024x1024px
- Proporción: 1:1 (cuadrada)
- Peso máximo: 500KB

## ⚙️ Configuración de Personajes

### Niveles NSFW

- `sfw` - Contenido seguro para todo público
- `romantic` - Contenido romántico sin explícito
- `suggestive` - Contenido sugestivo
- `explicit` - Contenido sexualmente explícito
- `unrestricted` - Sin restricciones (requiere configuración especial)

### Variantes de Personalidad

- `dominant` - Personalidad dominante
- `submissive` - Personalidad sumisa
- `playful` - Personalidad juguetona
- `serious` - Personalidad seria
- `introverted` - Personalidad introvertida
- `extroverted` - Personalidad extrovertida
- `romantic` - Personalidad romántica
- `pragmatic` - Personalidad pragmática

### Progresión de Relaciones

Los personajes tienen prompts específicos para cada etapa:

1. **stranger** - Desconocidos, primer contacto
2. **acquaintance** - Conocidos, conversaciones superficiales
3. **friend** - Amigos, confianza establecida
4. **close_friend** - Amigos cercanos, intimidad emocional
5. **intimate** - Intimidad completa (física y emocional)
6. **romantic** - Relación romántica establecida

## 📊 Base de Datos

Los personajes se almacenan en la tabla `Agent` con:

```prisma
model Agent {
  id                  String   @id @default(cuid())
  userId              String?  // null para personajes del sistema
  kind                String   // "companion"
  name                String
  systemPrompt        String   @db.Text
  visibility          String   // "public"
  nsfwMode            Boolean
  nsfwLevel           String?
  personalityVariant  String?
  avatar              String?
  tags                Json?
  featured            Boolean  // true para premium
  profile             Json
  stagePrompts        Json?
  locationCity        String?
  locationCountry     String?
  generationTier      String   // "ultra" para premium
  // ... otros campos
}
```

## 🚀 Scripts Útiles

```bash
# Seed completo (incluye personajes premium)
npm run db:seed

# Solo personajes premium
npx tsx scripts/seed-premium-characters.ts

# Verificar estructura de personajes
npx tsx scripts/check-character-structure.ts

# Verificar tags
npx tsx scripts/verify-tags.ts

# Agregar tags de categoría en español
npx tsx scripts/add-spanish-category-tags.ts

# Limpiar y corregir personajes
npx tsx scripts/fix-premium-characters.ts
```

## 📚 Documentación Adicional

- [Guía de Implementación](../COMPLETE_IMPLEMENTATION_REPORT.md)
- [System Prompts](../docs/SYSTEM_PROMPTS.md)
- [Progresión de Relaciones](../docs/RELATIONSHIP_PROGRESSION.md)
- [Contenido NSFW](../docs/NSFW_CONTENT_GUIDELINES.md)

## ✅ Checklist para Nuevos Personajes

- [ ] Archivo .txt con información completa
- [ ] Imagen en public/personajes/[nombre]/cara.webp
- [ ] Archivo JSON procesado en /processed
- [ ] Tag `premium` agregado
- [ ] Al menos un tag de categoría en español
- [ ] systemPrompt completo (500+ palabras)
- [ ] profile con toda la información
- [ ] stagePrompts para todas las etapas
- [ ] Configuración NSFW apropiada
- [ ] Testeo en interfaz
- [ ] Verificación de calidad

---

**Última actualización:** 9 de Diciembre, 2025
**Personajes activos:** 6 premium + 2 demo
