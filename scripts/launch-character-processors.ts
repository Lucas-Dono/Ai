/**
 * Orquestador para procesar personajes masivamente usando agentes
 * Divide los personajes en batches y lanza agentes especializados
 */

import * as fs from 'fs';
import * as path from 'path';

const PERSONAJES_DIR = path.join(__dirname, '../Personajes');
const CHARACTERS_LIST_PATH = path.join(__dirname, 'characters-to-process.json');

interface CharacterToProcess {
  name: string;
  directory: string;
  mainFile?: string;
}

interface ProcessingBatch {
  batchNumber: number;
  characters: CharacterToProcess[];
}

/**
 * Carga la lista de personajes a procesar
 */
function loadCharactersList(): CharacterToProcess[] {
  if (!fs.existsSync(CHARACTERS_LIST_PATH)) {
    console.error('❌ No se encontró characters-to-process.json');
    console.log('   Ejecuta primero: npx tsx scripts/analyze-characters.ts');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(CHARACTERS_LIST_PATH, 'utf-8'));
  return data.characters;
}

/**
 * Divide personajes en batches
 */
function createBatches(characters: CharacterToProcess[], batchSize: number): ProcessingBatch[] {
  const batches: ProcessingBatch[] = [];

  for (let i = 0; i < characters.length; i += batchSize) {
    batches.push({
      batchNumber: Math.floor(i / batchSize) + 1,
      characters: characters.slice(i, i + batchSize),
    });
  }

  return batches;
}

/**
 * Genera instrucciones detalladas para un agente procesador
 */
function generateAgentInstructions(batch: ProcessingBatch): string {
  const characterList = batch.characters
    .map((c, idx) => {
      const filePath = path.join(PERSONAJES_DIR, c.directory, c.mainFile || `${c.name}.txt`);
      return `${idx + 1}. ${c.name}\n   Archivo: ${filePath}`;
    })
    .join('\n\n');

  return `# Tarea: Procesamiento de Personajes a Base de Datos
## Batch ${batch.batchNumber} - ${batch.characters.length} personajes

Tu tarea es procesar los siguientes personajes y añadirlos a la base de datos con TODA la información necesaria:

${characterList}

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

Procesa los ${batch.characters.length} personajes listados arriba, uno por uno, siguiendo el proceso exacto.

¡Buena suerte! 🚀
`;
}

/**
 * Guarda instrucciones de un batch para un agente
 */
function saveBatchInstructions(batch: ProcessingBatch): string {
  const instructions = generateAgentInstructions(batch);
  const fileName = `batch-${batch.batchNumber}-instructions.md`;
  const filePath = path.join(__dirname, fileName);

  fs.writeFileSync(filePath, instructions, 'utf-8');

  return filePath;
}

/**
 * Main
 */
function main() {
  console.log('🚀 Iniciando orquestación de procesamiento de personajes\n');

  // Cargar personajes
  const characters = loadCharactersList();
  console.log(`📚 Total de personajes a procesar: ${characters.length}\n`);

  // Crear batches (10 personajes por batch)
  const BATCH_SIZE = 10;
  const batches = createBatches(characters, BATCH_SIZE);
  console.log(`📦 Dividido en ${batches.length} batches de ${BATCH_SIZE} personajes\n`);

  // Generar instrucciones para cada batch
  console.log('📝 Generando instrucciones para agentes...\n');

  for (const batch of batches) {
    const filePath = saveBatchInstructions(batch);
    console.log(`   ✅ Batch ${batch.batchNumber}: ${path.basename(filePath)}`);
    console.log(`      Personajes: ${batch.characters.map(c => c.name).join(', ')}`);
    console.log();
  }

  console.log('✨ ¡Instrucciones generadas!\n');
  console.log('📋 Próximos pasos:');
  console.log('   1. Revisar los archivos batch-X-instructions.md');
  console.log('   2. Lanzar agentes Task para cada batch');
  console.log('   3. Los agentes procesarán los personajes automáticamente\n');

  console.log('💡 Comando para lanzar agentes:');
  console.log('   Para cada batch, usa el Task tool con:');
  console.log('   - subagent_type: "general-purpose"');
  console.log('   - prompt: Contenido del archivo batch-X-instructions.md');
  console.log();
}

main();
