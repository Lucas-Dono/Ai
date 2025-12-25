# Tarea: Procesamiento de Personajes a Base de Datos
## Batch 5 - 10 personajes

Tu tarea es procesar los siguientes personajes y añadirlos a la base de datos con TODA la información necesaria:

1. Oliver Chen
   Archivo: /run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/Personajes/Oliver Chen/profile.txt

2. Oscar Wilde
   Archivo: /run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/Personajes/Oscar Wilde/Oscar Wilde.txt

3. Priya Sharma
   Archivo: /run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/Personajes/Priya Sharma/profile.txt

4. Rafael Costa
   Archivo: /run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/Personajes/Rafael Costa/profile.txt

5. Rei Takahashi
   Archivo: /run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/Personajes/Rei Takahashi/Rei Takahashi.txt

6. Sebastian Müller
   Archivo: /run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/Personajes/Sebastian Müller/profile.txt

7. Sigmund Freud
   Archivo: /run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/Personajes/Sigmund Freud/Sigmund Freud.txt

8. Sofia Volkov
   Archivo: /run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/Personajes/Sofia Volkov/profile.txt

9. Sun Tzu
   Archivo: /run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/Personajes/Sun Tzu/Sun Tzu.txt

10. Sócrates
   Archivo: /run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/Personajes/Sócrates/Sócrates.txt

## Estructura Requerida de Cada Personaje

Cada personaje DEBE tener:

### 1. **Agent** (Tabla principal)
- kind: "companion"
- name: Nombre completo del personaje
- description: Descripción corta (1-2 líneas)
- gender: "male" | "female" | "non-binary"
- systemPrompt: Prompt completo que define personalidad y comportamiento
- visibility: "public"
- nsfwMode: true/false según contenido
- nsfwLevel: "sfw" | "romantic" | "suggestive" | "explicit"
- tags: Array de tags (ej: ["historical", "premium", "creative"])
- featured: true

### 2. **PersonalityCore**
- Big Five (0-100 cada uno):
  * openness: Apertura a experiencias
  * conscientiousness: Responsabilidad
  * extraversion: Extraversión
  * agreeableness: Amabilidad
  * neuroticism: Neuroticismo
- coreValues: JSON con valores fundamentales
- moralSchemas: JSON con esquemas morales
- backstory: Historia completa (mínimo 500 palabras)
- baselineEmotions: JSON con emociones base

### 3. **InternalState**
- currentEmotions: JSON con emociones actuales
- moodValence: -1 a 1 (negativo a positivo)
- moodArousal: 0 a 1 (calmado a activado)
- moodDominance: 0 a 1 (sumiso a dominante)

### 4. **CharacterAppearance** (si tiene visualIdentity)
- basePrompt: Descripción visual completa
- style: "realistic" | "anime" | "semi-realistic"
- gender, ethnicity, age, hairColor, hairStyle, eyeColor, clothing

### 5. **ImportantPeople** (personajes secundarios)
- Familia, amigos, ex-parejas del personaje
- Cada uno con: name, relationship, age, gender, description

### 6. **ImportantEvents** (eventos clave)
- Eventos importantes en la vida del personaje
- Cada uno con: eventDate, type, description, priority

## Proceso de Trabajo

Para CADA personaje:

1. **Leer el archivo** completo del personaje
2. **Extraer el JSON** del bloque markdown (dentro del código markdown)
3. **Mapear todos los campos** siguiendo el schema de arriba
4. **Insertar en la base de datos** usando el script process-character-to-db.ts:

   npx tsx scripts/process-character-to-db.ts "<NOMBRE>" "<RUTA_ARCHIVO>"

5. **Verificar** que se crearon todas las tablas relacionadas
6. **Reportar** éxito o errores

## Campos Importantes a NO Olvidar

🔴 **CRÍTICO - Estos campos son OBLIGATORIOS**:
- **systemPrompt**: Debe ser detallado (mínimo 300 palabras)
- **backstory**: Historia completa del personaje
- **Big Five**: Los 5 valores numéricos
- **tags**: Al menos 3 tags relevantes
- **baselineEmotions**: Emociones características

## Ejemplos de Tags por Tipo de Personaje

**Históricos**:
- "historical", "premium", "science" (si es científico)
- "art" (si es artista), "philosophy" (si es filósofo)
- "writer" (si es escritor), "music" (si es músico)

**Modernos**:
- "premium", "creative", "romantic"
- "nsfw" (si tiene contenido adulto)
- "intellectual", "emotional", "playful"

## Formato de Reporte

Después de procesar cada personaje, reporta:

✅ **[Nombre del Personaje]**
- Agent ID: [id generado]
- PersonalityCore: ✓
- InternalState: ✓
- CharacterAppearance: ✓ (o N/A si no aplica)
- ImportantPeople: X personas creadas
- ImportantEvents: X eventos creados

O en caso de error:

❌ **[Nombre del Personaje]**
- Error: [descripción del error]
- Archivo problemático: [ruta]

## Notas Importantes

1. **No te saltes personajes**: Procesa TODOS los del batch
2. **No uses datos inventados**: Todo debe venir del archivo del personaje
3. **Reporta problemas**: Si un archivo está mal formado, repórtalo
4. **Verifica tags**: Asegúrate de que sean relevantes y útiles para búsqueda

## Comenzar

Procesa los 10 personajes listados arriba, uno por uno, siguiendo el proceso exacto.

¡Buena suerte! 🚀
