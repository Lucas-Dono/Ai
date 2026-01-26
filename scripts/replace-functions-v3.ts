import fs from 'fs';

// Leer el archivo original
let content = fs.readFileSync('lib/minecraft/component-generator.ts', 'utf8');

// Leer las nuevas funciones
const headFunction = fs.readFileSync('/tmp/head-only.txt', 'utf8');
const hatFunction = fs.readFileSync('/tmp/hat-only.txt', 'utf8');

// === REEMPLAZAR generateHead_Base_01 ===

// Buscar la línea exacta
const headFunctionLine = 'export function generateHead_Base_01(): string {';
const headStart = content.indexOf(headFunctionLine);

if (headStart === -1) {
  console.error('❌ No se encontró generateHead_Base_01');
  process.exit(1);
}

// Retroceder para incluir el comentario (buscar hacia atrás el último /**)
const commentStart = content.lastIndexOf('/**', headStart);

// Buscar el final de la función (cierre con };)
let braceCount = 0;
let inFunction = false;
let headEnd = headStart;

for (let i = headStart; i < content.length; i++) {
  if (content[i] === '{') {
    braceCount++;
    inFunction = true;
  } else if (content[i] === '}') {
    braceCount--;
    if (inFunction && braceCount === 0) {
      headEnd = i + 1;
      break;
    }
  }
}

// Reemplazar la función HEAD
const before = content.substring(0, commentStart);
const after = content.substring(headEnd);
content = before + headFunction.trim() + '\n' + after;

console.log('✅ generateHead_Base_01 reemplazada');

// === REEMPLAZAR generateHairShort_02_BobCut ===

const hatFunctionLine = 'export function generateHairShort_02_BobCut(): string {';
const hatStart = content.indexOf(hatFunctionLine);

if (hatStart === -1) {
  console.error('❌ No se encontró generateHairShort_02_BobCut');
  process.exit(1);
}

// Retroceder para incluir el comentario
const hatCommentStart = content.lastIndexOf('/**', hatStart);

// Buscar el final de la función
braceCount = 0;
inFunction = false;
let hatEnd = hatStart;

for (let i = hatStart; i < content.length; i++) {
  if (content[i] === '{') {
    braceCount++;
    inFunction = true;
  } else if (content[i] === '}') {
    braceCount--;
    if (inFunction && braceCount === 0) {
      hatEnd = i + 1;
      break;
    }
  }
}

// Reemplazar la función HAT
const beforeHat = content.substring(0, hatCommentStart);
const afterHat = content.substring(hatEnd);
content = beforeHat + hatFunction.trim() + '\n' + afterHat;

console.log('✅ generateHairShort_02_BobCut reemplazada');

// Guardar el archivo
fs.writeFileSync('lib/minecraft/component-generator.ts', content, 'utf8');

console.log('\n✅ Archivo guardado exitosamente');
