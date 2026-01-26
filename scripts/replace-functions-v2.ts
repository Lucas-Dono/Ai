import fs from 'fs';

// Leer el archivo original
let content = fs.readFileSync('lib/minecraft/component-generator.ts', 'utf8');

// Leer las nuevas funciones
const headFunction = fs.readFileSync('/tmp/head-only.txt', 'utf8');
const hatFunction = fs.readFileSync('/tmp/hat-only.txt', 'utf8');

// === REEMPLAZAR generateHead_Base_01 ===

// Encontrar el inicio de la función (incluye el comentario /** */)
const headStartMarker = '/**\n * Genera sprite de cabeza base - Todas las caras\n * Se recolorea con skinTone\n */\nexport function generateHead_Base_01(): string {';
const headStartIdx = content.indexOf(headStartMarker);

if (headStartIdx === -1) {
  console.error('❌ No se encontró generateHead_Base_01');
  process.exit(1);
}

// Encontrar el final de la función (la siguiente línea que empieza con "// =====")
const headEndMarker = '\n\n// ============================================================================\n// BIBLIOTECA DE SPRITES - OJOS';
const headEndIdx = content.indexOf(headEndMarker, headStartIdx);

if (headEndIdx === -1) {
  console.error('❌ No se encontró el final de generateHead_Base_01');
  process.exit(1);
}

// Reemplazar la función HEAD
content = content.substring(0, headStartIdx) + headFunction.trim() + content.substring(headEndIdx);

console.log('✅ generateHead_Base_01 reemplazada');

// === REEMPLAZAR generateHairShort_02_BobCut ===

// Encontrar el inicio de la función
const hatStartMarker = '/**\n * Genera sprite de pelo corto - Tipo 2: Bob Cut';
const hatStartIdx = content.indexOf(hatStartMarker);

if (hatStartIdx === -1) {
  console.error('❌ No se encontró generateHairShort_02_BobCut');
  process.exit(1);
}

// Encontrar el final de la función (la siguiente función que empieza con /**\n * Genera)
const hatEndMarker = '\n\n/**\n * Genera sprite de pelo corto - Tipo 3: Buzz Cut';
const hatEndIdx = content.indexOf(hatEndMarker, hatStartIdx);

if (hatEndIdx === -1) {
  console.error('❌ No se encontró el final de generateHairShort_02_BobCut');
  process.exit(1);
}

// Reemplazar la función HAT
content = content.substring(0, hatStartIdx) + hatFunction.trim() + content.substring(hatEndIdx);

console.log('✅ generateHairShort_02_BobCut reemplazada');

// Guardar el archivo
fs.writeFileSync('lib/minecraft/component-generator.ts', content, 'utf8');

console.log('\n✅ Archivo guardado exitosamente');
