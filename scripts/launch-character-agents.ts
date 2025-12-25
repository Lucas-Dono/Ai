import * as fs from 'fs';
import * as path from 'path';

/**
 * Sistema de Lanzamiento de Agentes para Creación de Personajes
 *
 * Este script lanza agentes especializados que:
 * 1. Investigan profundamente cada personaje (20+ búsquedas web)
 * 2. Crean documentación completa en formato .txt
 * 3. Generan prompts profesionales de DALL-E para imágenes
 */

interface CharacterEntry {
  id: string;
  name: string;
  period?: string;
  category?: string;
  archetype?: string;
  tags: string[];
  engagement: string;
  complexity: string;
  rationale?: string;
  concept?: string;
}

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);
const batchArg = args.find(arg => arg.startsWith('--batch='));
const batchNumber = batchArg ? batchArg.split('=')[1] : null;

if (!batchNumber) {
  console.error('❌ Error: Debes especificar un lote con --batch=N o --batch=all');
  console.log('\nEjemplos:');
  console.log('  npx tsx scripts/launch-character-agents.ts --batch=1');
  console.log('  npx tsx scripts/launch-character-agents.ts --batch=all');
  process.exit(1);
}

async function createCharacterFolder(characterName: string): Promise<string> {
  const folderPath = path.join(__dirname, '..', 'Personajes', characterName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  return folderPath;
}

function generateHistoricalCharacterPrompt(character: CharacterEntry): string {
  return `# MISIÓN: Crear Perfil Ultra Profesional de ${character.name}

## CONTEXTO
Eres un agente especializado en crear perfiles de personajes históricos para una plataforma de IA conversacional. Tu objetivo es crear un perfil EXCEPCIONALMENTE detallado y preciso de ${character.name}.

## REQUISITOS CRÍTICOS

### 1. INVESTIGACIÓN PROFUNDA (OBLIGATORIO)
Debes realizar MÍNIMO 20 búsquedas web para investigar:

**Búsquedas Biográficas (5-7 búsquedas):**
- Vida temprana, familia, educación
- Logros principales y contribuciones
- Eventos clave y puntos de inflexión
- Relaciones personales significativas
- Últimos años y legado

**Búsquedas Psicológicas (5-7 búsquedas):**
- Análisis psicológico de ${character.name}
- Patrones de personalidad documentados
- Cartas, diarios, testimonios personales
- Estudios académicos sobre su psicología
- Diagnósticos retrospectivos (si aplicable)

**Búsquedas Contextuales (5-7 búsquedas):**
- Contexto histórico de ${character.period}
- Sociedad y cultura de su época
- Personas influyentes en su vida
- Conflictos y desafíos de su tiempo
- Impacto cultural y científico

**Búsquedas Específicas (3-5 búsquedas):**
- Frases y citas textuales documentadas
- Controversias y aspectos problemáticos
- Mitos vs realidad sobre ${character.name}
- Perspectivas modernas y reevaluaciones

### 2. ESTRUCTURA DEL ARCHIVO .TXT

Debes crear un archivo completo en formato Markdown con esta estructura:

\`\`\`markdown
# ${character.name} - Perfil Completo para IA Conversacional

## INFORMACIÓN BÁSICA
- **Nombre Completo**: [nombre completo con todos los apellidos]
- **Período**: ${character.period}
- **Categoría**: ${character.category}
- **Origen**: [lugar de nacimiento y contexto]
- **Ocupación**: [profesión(es) principal(es)]

## BIOGRAFÍA DETALLADA

### Infancia y Juventud (Hasta ~20 años)
[Mínimo 300 palabras sobre su desarrollo temprano, familia, educación, eventos formativos]

### Edad Adulta Temprana (~20-40 años)
[Mínimo 400 palabras sobre inicio de carrera, primeros logros, relaciones clave]

### Madurez (~40-60 años)
[Mínimo 400 palabras sobre pico de carrera, obras principales, consolidación]

### Años Finales (60+ años o equivalente)
[Mínimo 300 palabras sobre declive, reflexiones, legado, muerte]

## ANÁLISIS PSICOLÓGICO PROFUNDO

### Personalidad Core
[Análisis de 500+ palabras sobre rasgos fundamentales, basado en evidencia histórica]

### Patrones de Comportamiento
[Análisis de 300+ palabras sobre comportamientos recurrentes documentados]

### Vida Emocional
[Análisis de 300+ palabras sobre expresión emocional, relaciones, intimidad]

### Motivaciones y Miedos
**Motivaciones conscientes:**
- [Lista detallada]

**Motivaciones inconscientes:**
- [Lista detallada]

**Miedos documentados:**
- [Lista detallada]

### Diagnósticos Retrospectivos
[Si aplicable, análisis de condiciones mentales con evidencia histórica]

## COMUNICACIÓN Y ESTILO

### Patrones de Habla
[Descripción detallada de cómo hablaba, frases características, tono]

### Estilo de Escritura
[Si aplicable, análisis de su escritura]

### Citas Textuales Documentadas
[Mínimo 10 citas reales con fuentes]

## RELACIONES CLAVE

[Para cada persona importante en su vida:]
### [Nombre de persona]
- **Relación**: [tipo de relación]
- **Período**: [cuándo se conocieron/relacionaron]
- **Dinámica**: [descripción de 100+ palabras de la relación]
- **Impacto**: [cómo afectó a ${character.name}]

## CONTEXTO HISTÓRICO

### Época y Sociedad
[500+ palabras sobre el mundo en que vivió]

### Eventos Históricos Relevantes
[Lista cronológica de eventos que afectaron su vida]

### Impacto Cultural
[300+ palabras sobre su influencia en cultura/ciencia/sociedad]

## CONTRADICCIONES Y COMPLEJIDAD

### Dualidades
[Análisis de aspectos contradictorios de su personalidad]

### Luces
[Aspectos positivos, logros, virtudes]

### Sombras
[Aspectos problemáticos, defectos, controversias]

**IMPORTANTE**: No santificar ni demonizar. Balance 60/40 o 50/50.

## SYSTEM PROMPT PARA IA

[Crear un system prompt de 800-1000 palabras que capture:]
- Esencia de su personalidad
- Patrones de comunicación
- Conocimientos y expertise
- Contexto histórico
- Dualidades y contradicciones
- Cómo respondería a usuarios modernos
- Límites y boundaries apropiados

## PROGRESIÓN DE RELACIONES

### Stranger
[Prompt de 150+ palabras: cómo interactúa con desconocidos]

### Acquaintance
[Prompt de 150+ palabras: primeras conversaciones]

### Friend
[Prompt de 150+ palabras: amistad establecida]

### Close Friend
[Prompt de 150+ palabras: confianza profunda]

### Intimate (si aplicable)
[Prompt de 150+ palabras: intimidad completa]

## METADATA

- **Nivel NSFW**: [sfw/romantic/suggestive según sea apropiado]
- **Variante de Personalidad**: [dominant/submissive/playful/serious/etc]
- **Tags de Categoría**: ${character.tags.join(', ')}
- **Nivel de Engagement**: ${character.engagement}
- **Complejidad**: ${character.complexity}

## FUENTES Y REFERENCIAS

[Lista de TODAS las fuentes consultadas durante la investigación]
- [Fuente 1]
- [Fuente 2]
- [...]

\`\`\`

### 3. ARCHIVO DE PROMPTS DE DALL-E

Crear archivo separado "dalle_prompts.txt" con:

\`\`\`
# Prompts de DALL-E para ${character.name}

## Prompt para Foto de Cara (512x512, cuadrada 1:1)

[Prompt ultra detallado de 200+ palabras describiendo:]
- Estructura facial específica basada en fotografías/pinturas históricas
- Expresión característica
- Época y estilo de la imagen
- Iluminación y composición
- Detalles como cabello, ojos, vestimenta visible
- Estilo artístico (fotografía histórica, retrato realista, etc.)

**Ejemplo de formato:**
"Portrait photograph of ${character.name}, [descripción física detallada], taken in [año aproximado], [estilo fotográfico de la época], [expresión facial], [detalles de vestimenta visible], [iluminación], [composición], [calidad de imagen], historical accuracy, museum quality, centered face, direct gaze, professional studio lighting of the era"

## Prompt para Foto de Cuerpo Completo

[Prompt ultra detallado de 200+ palabras describiendo:]
- Pose característica
- Vestimenta completa de la época
- Contexto y ambiente
- Proporciones corporales
- Gestos y lenguaje corporal
- Objetos relevantes (libros, instrumentos, etc.)

\`\`\`

## TU PROCESO DE TRABAJO

1. **INVESTIGACIÓN (60% del tiempo)**
   - Realizar las 20+ búsquedas web requeridas
   - Tomar notas detalladas de cada fuente
   - Verificar información cruzando múltiples fuentes
   - Buscar fotografías/pinturas históricas reales

2. **SÍNTESIS (25% del tiempo)**
   - Analizar toda la información recopilada
   - Identificar patrones y contradicciones
   - Crear narrative coherente

3. **ESCRITURA (15% del tiempo)**
   - Escribir el perfil completo siguiendo la estructura
   - Crear prompts de DALL-E basados en imágenes reales
   - Verificar que todo esté completo

## OUTPUTS REQUERIDOS

1. **Archivo**: \`Personajes/${character.name}/${character.name}.txt\`
   - Perfil completo en formato Markdown
   - Mínimo 5000 palabras
   - Todas las secciones completas

2. **Archivo**: \`Personajes/${character.name}/dalle_prompts.txt\`
   - Prompts de DALL-E para cara y cuerpo completo
   - Basados en fotografías/pinturas históricas reales
   - Ultra detallados (200+ palabras cada uno)

## ESTÁNDARES DE CALIDAD

✅ MÍNIMO 20 búsquedas web documentadas
✅ MÍNIMO 5000 palabras en el perfil
✅ Todas las secciones completadas
✅ Citas textuales con fuentes
✅ Balance entre luces y sombras
✅ System prompt de 800+ palabras
✅ Prompts de DALL-E ultra detallados
✅ Referencias y fuentes listadas

## COMIENZA AHORA

Empieza tu investigación profunda sobre ${character.name}. Recuerda: calidad sobre velocidad. Este personaje debe ser EXCEPCIONAL.`;
}

function generateOriginalCharacterPrompt(character: CharacterEntry): string {
  return `# MISIÓN: Crear Personaje Original Ultra Profesional - ${character.name}

## CONTEXTO
Eres un agente especializado en crear personajes originales de alta complejidad para una plataforma de IA conversacional. Tu objetivo es crear ${character.name}, un personaje completamente nuevo basado en este concepto:

**Concepto**: ${character.concept}
**Arquetipo**: ${character.archetype}

## REQUISITOS CRÍTICOS

### 1. INVESTIGACIÓN DE REFERENCIAS (OBLIGATORIO)
Aunque es un personaje original, debes investigar MÍNIMO 20 búsquedas para informar su creación:

**Búsquedas de Profesión/Arquetipo (5-7 búsquedas):**
- Investigación profunda sobre ${character.archetype}
- Realidades de esta profesión/estilo de vida
- Desafíos psicológicos comunes
- Cultura y jerga de este mundo
- Casos reales documentados

**Búsquedas Psicológicas (5-7 búsquedas):**
- Perfiles psicológicos de personas similares
- Trauma y healing patterns relevantes
- Condiciones mentales asociadas
- Mecanismos de coping documentados
- Estudios de personalidad aplicables

**Búsquedas Culturales (5-7 búsquedas):**
- Contexto cultural moderno (2020s)
- Tendencias sociales relevantes
- Representación en media
- Comunidades online relacionadas
- Movimientos sociales conectados

**Búsquedas de Inspiración (3-5 búsquedas):**
- Personas reales en campos similares
- Historias documentadas
- Entrevistas y testimonios
- Estudios de caso

### 2. ESTRUCTURA DEL ARCHIVO .TXT

\`\`\`markdown
# ${character.name} - Personaje Original Completo

## INFORMACIÓN BÁSICA
- **Nombre Completo**: [nombre completo inventado pero creíble]
- **Edad**: [edad específica]
- **Género**: [género]
- **Origen**: [ciudad y país específicos]
- **Ocupación**: ${character.archetype}
- **Arquetipo**: ${character.concept}

## BIOGRAFÍA DETALLADA

### Infancia (0-12 años)
[Mínimo 400 palabras sobre:]
- Familia de origen (padres, hermanos, dinámica familiar)
- Eventos formativos clave
- Trauma temprano (si aplicable)
- Primeros indicios de su futuro camino
- Relación con figuras de autoridad

### Adolescencia (13-19 años)
[Mínimo 400 palabras sobre:]
- Desarrollo de identidad
- Descubrimiento de vocación/pasión
- Relaciones significativas
- Crisis o turning points
- Educación y primeros pasos

### Edad Adulta Temprana (20-30 años)
[Mínimo 400 palabras sobre:]
- Cómo llegó a ${character.archetype}
- Logros y fracasos tempranos
- Desarrollo de expertise
- Relaciones románticas clave
- Construcción de identidad profesional

### Presente (Edad Actual)
[Mínimo 400 palabras sobre:]
- Estado actual de vida
- Dónde vive, rutina diaria
- Círculo social actual
- Desafíos presentes
- Metas y aspiraciones

## ANÁLISIS PSICOLÓGICO PROFUNDO

### Personalidad Core (Myers-Briggs, Enneagram, etc.)
[Análisis de 500+ palabras sobre rasgos fundamentales]

### Patrones de Comportamiento
**En situaciones sociales:**
[200+ palabras]

**En situaciones de estrés:**
[200+ palabras]

**En intimidad:**
[200+ palabras]

### Vida Emocional
**Rango emocional:**
[Descripción detallada]

**Expresión emocional:**
[Cómo manifiesta emociones]

**Regulación emocional:**
[Mecanismos de coping]

### Motivaciones y Miedos
**Motivaciones conscientes:**
1. [Detalle]
2. [Detalle]
3. [...]

**Motivaciones inconscientes:**
1. [Detalle]
2. [Detalle]
3. [...]

**Miedos profundos:**
1. [Detalle con explicación]
2. [Detalle con explicación]
3. [...]

### Condiciones de Salud Mental
[Si aplicable, descripción detallada de diagnósticos, síntomas, tratamiento]

### Sexualidad e Intimidad
**Orientación**: [específica]
**Estilo de attachment**: [anxious/avoidant/secure/etc]
**Patrón relacional**: [descripción]
**Nivel NSFW apropiado**: [justificación]

## COMUNICACIÓN Y ESTILO

### Patrones de Habla Digital
[Cómo escribe mensajes, estilo de chat]

### Vocabulario Característico
[Frases, jerga, expresiones típicas]

### Tono Emocional
**Cuando feliz**: [descripción]
**Cuando triste**: [descripción]
**Cuando enojado**: [descripción]
**Cuando vulnerable**: [descripción]

### Ejemplos de Diálogos
[10+ ejemplos de líneas de diálogo características]

## RELACIONES CLAVE

### [Nombre de persona 1 - ej: mejor amigo/a]
- **Relación**: [tipo]
- **Historia**: [200+ palabras sobre cómo se conocieron y dinámica]
- **Impacto**: [cómo afecta al personaje]

[Repetir para 4-6 personas importantes]

## VIDA COTIDIANA

### Rutina Diaria
[Descripción hora por hora de un día típico]

### Espacio Vital
[Descripción detallada de dónde y cómo vive]

### Hobbies y Pasiones
[Lista detallada con explicaciones]

### Guilty Pleasures
[Cosas que le gustan pero no admite fácilmente]

## CONTRADICCIONES Y COMPLEJIDAD

### Dualidades
[Aspectos contradictorios de su personalidad con ejemplos]

### Fortalezas
[5+ fortalezas específicas]

### Debilidades
[5+ debilidades específicas]

### Shadow Self
[Aspectos oscuros que niega o reprime]

## ARCOS NARRATIVOS POTENCIALES

### Arco 1: [Título]
[Descripción de 200+ palabras de posible desarrollo]

### Arco 2: [Título]
[Descripción de 200+ palabras]

### Arco 3: [Título]
[Descripción de 200+ palabras]

## SYSTEM PROMPT PARA IA

[Crear un system prompt de 800-1000 palabras que capture:]
- Esencia de personalidad
- Patrones de comunicación digital
- Expertise y conocimientos
- Contexto de vida actual
- Dualidades y contradicciones
- Cómo responde según nivel de relación
- Boundaries y límites
- Estilo de engagement

## PROGRESIÓN DE RELACIONES

### Stranger
[Prompt de 150+ palabras: primera impresión, guardedness]

### Acquaintance
[Prompt de 150+ palabras: apertura inicial]

### Friend
[Prompt de 150+ palabras: confianza, autenticidad]

### Close Friend
[Prompt de 150+ palabras: vulnerabilidad profunda]

### Intimate
[Prompt de 150+ palabras: todo su ser, sin filtros]

### Romantic (si aplicable)
[Prompt de 150+ palabras: amor, compromiso, futuro]

## METADATA

- **Nivel NSFW**: [sfw/romantic/suggestive/explicit según concepto]
- **Variante de Personalidad**: [basado en análisis]
- **Tags de Categoría**: ${character.tags.join(', ')}
- **Nivel de Engagement**: ${character.engagement}
- **Complejidad**: ${character.complexity}
- **Target User Need**: [qué necesidad emocional/psicológica satisface]

## REFERENCIAS DE INVESTIGACIÓN

[Lista de TODAS las fuentes consultadas]
- [Fuente sobre profesión/arquetipo]
- [Fuente psicológica]
- [...]

\`\`\`

### 3. ARCHIVO DE PROMPTS DE DALL-E

\`\`\`
# Prompts de DALL-E para ${character.name}

## Prompt para Foto de Cara (512x512, cuadrada 1:1)

[Prompt ultra detallado de 250+ palabras describiendo:]
- Características físicas específicas (raza, edad, estructura facial)
- Expresión que capture su esencia
- Estilo estético (moderno, urbano, profesional, etc.)
- Detalles como cabello, ojos, piel, accesorios
- Iluminación y mood
- Contexto fotográfico (selfie, retrato profesional, casual, etc.)

**Ejemplo de formato:**
"Professional portrait photograph of ${character.name}, [edad] year old [etnia] [género], [descripción física ultra detallada], [expresión facial específica], [estilo de cabello], [vestimenta visible], [accesorios relevantes al arquetipo], [lighting mood], [photographic style], modern 2020s aesthetic, high quality, sharp focus, centered composition, direct gaze, [elementos que reflejen su profesión/personalidad]"

## Prompt para Foto de Cuerpo Completo

[Prompt ultra detallado de 250+ palabras describiendo:]
- Pose que refleje su personalidad/profesión
- Outfit completo relevante a su arquetipo
- Setting/ambiente característico
- Lenguaje corporal específico
- Props/objetos relevantes
- Contexto que cuente su historia

\`\`\`

## TU PROCESO DE TRABAJO

1. **INVESTIGACIÓN (50% del tiempo)**
   - 20+ búsquedas sobre arquetipo, psicología, cultura
   - Tomar notas extensivas
   - Buscar inspiración en personas reales

2. **DISEÑO DEL PERSONAJE (30% del tiempo)**
   - Sintetizar investigación
   - Crear biografía coherente
   - Desarrollar complejidad psicológica
   - Asegurar autenticidad y originalidad

3. **ESCRITURA (20% del tiempo)**
   - Escribir perfil completo
   - Crear prompts de DALL-E
   - Verificar consistencia

## OUTPUTS REQUERIDOS

1. **Archivo**: \`Personajes/${character.name}/${character.name}.txt\`
   - Mínimo 6000 palabras
   - Todas las secciones completas

2. **Archivo**: \`Personajes/${character.name}/dalle_prompts.txt\`
   - Prompts ultra detallados

## ESTÁNDARES DE CALIDAD

✅ MÍNIMO 20 búsquedas documentadas
✅ MÍNIMO 6000 palabras en el perfil
✅ Personaje auténtico y creíble
✅ Complejidad psicológica profunda
✅ Biografía coherente y detallada
✅ System prompt de 800+ palabras
✅ Relaciones desarrolladas
✅ Contradicciones y dualidades
✅ Prompts de DALL-E profesionales

## COMIENZA AHORA

Empieza tu investigación profunda para informar la creación de ${character.name}. Este personaje debe sentirse REAL y COMPLEJO.`;
}

async function launchCharacterAgent(character: CharacterEntry, isHistorical: boolean) {
  console.log(`\n🚀 Lanzando agente para: ${character.name}`);

  // Crear carpeta del personaje
  await createCharacterFolder(character.name);

  // Generar prompt apropiado
  const prompt = isHistorical
    ? generateHistoricalCharacterPrompt(character)
    : generateOriginalCharacterPrompt(character);

  console.log(`   📝 Prompt generado (${prompt.length} caracteres)`);
  console.log(`   🔍 Investigación requerida: 20+ búsquedas web`);
  console.log(`   📊 Complejidad: ${character.complexity}`);
  console.log(`   🎯 Engagement esperado: ${character.engagement}`);

  return {
    characterId: character.id,
    characterName: character.name,
    prompt: prompt,
    isHistorical: isHistorical
  };
}

async function main() {
  console.log('🎭 SISTEMA DE LANZAMIENTO DE AGENTES DE PERSONAJES\n');
  console.log('='.repeat(70));

  // Cargar catálogo
  const catalogPath = path.join(__dirname, 'character-catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

  const allCharacters = [
    ...catalog.historicalCharacters.map((c: CharacterEntry) => ({ ...c, type: 'historical' })),
    ...catalog.originalCharacters.map((c: CharacterEntry) => ({ ...c, type: 'original' }))
  ];

  // Determinar qué personajes procesar
  let charactersToProcess: any[] = [];

  if (batchNumber === 'all') {
    charactersToProcess = allCharacters;
    console.log(`\n📦 Procesando TODOS los personajes (${allCharacters.length})`);
    console.log('⚠️  ADVERTENCIA: Esto tomará MUCHO tiempo (varias horas)');
  } else {
    const batchNum = parseInt(batchNumber);
    if (isNaN(batchNum) || batchNum < 1 || batchNum > 5) {
      console.error('❌ Número de lote inválido. Debe ser 1-5 o "all"');
      process.exit(1);
    }

    const BATCH_SIZE = 10;
    const startIdx = (batchNum - 1) * BATCH_SIZE;
    const endIdx = startIdx + BATCH_SIZE;

    charactersToProcess = allCharacters.slice(startIdx, endIdx);
    console.log(`\n📦 Procesando LOTE ${batchNum} (${charactersToProcess.length} personajes)`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('PERSONAJES EN ESTE LOTE:');
  console.log('='.repeat(70));

  charactersToProcess.forEach((char, idx) => {
    console.log(`\n${idx + 1}. ${char.name}`);
    console.log(`   Tipo: ${char.type === 'historical' ? '📚 Histórico' : '✨ Original'}`);
    console.log(`   Complejidad: ${char.complexity}`);
    console.log(`   Engagement: ${char.engagement}`);
  });

  console.log('\n' + '='.repeat(70));
  console.log(`\n⏱️  Tiempo estimado: ${charactersToProcess.length * 15} - ${charactersToProcess.length * 30} minutos`);
  console.log('💡 Cada agente hará investigación profunda (20+ búsquedas)');
  console.log('\n🚀 Preparando para lanzar agentes...\n');

  // Aquí el usuario puede llamar a los agentes vía Claude Code Task tool
  // Por ahora, solo generamos los prompts y mostramos instrucciones

  console.log('📋 INSTRUCCIONES PARA EJECUTAR:');
  console.log('='.repeat(70));
  console.log('\nEste script ha preparado los prompts. Para ejecutar:');
  console.log('\n1. Los agentes se lanzarán automáticamente en los siguientes pasos');
  console.log('2. Cada agente creará:');
  console.log('   - Carpeta: Personajes/[Nombre del Personaje]/');
  console.log('   - Archivo: [Nombre].txt (perfil completo)');
  console.log('   - Archivo: dalle_prompts.txt (prompts de imágenes)');
  console.log('\n3. Luego podrás generar las imágenes con DALL-E');
  console.log('\n' + '='.repeat(70));

  // Preparar agentes
  const agentPreparations = [];

  for (const char of charactersToProcess) {
    const prep = await launchCharacterAgent(char, char.type === 'historical');
    agentPreparations.push(prep);
  }

  console.log(`\n✅ ${agentPreparations.length} agentes preparados`);
  console.log('\n💾 Guardando configuración...');

  // Guardar configuración de agentes
  const configPath = path.join(__dirname, `batch-${batchNumber}-agents.json`);
  fs.writeFileSync(configPath, JSON.stringify(agentPreparations, null, 2));

  console.log(`\n✅ Configuración guardada en: ${configPath}`);
  console.log('\n🎉 Sistema listo para lanzar agentes!');
  console.log('\n' + '='.repeat(70));
}

main().catch(console.error);
