import fs from 'fs';

// Leer el archivo original
const original = fs.readFileSync('lib/minecraft/component-generator.ts', 'utf8');
const headFunction = fs.readFileSync('/tmp/head-only.txt', 'utf8');
const hatFunction = fs.readFileSync('/tmp/hat-only.txt', 'utf8');

// Función para reemplazar una función completa
function replaceFunction(content: string, functionName: string, newFunction: string): string {
  // Regex para capturar la función completa incluyendo su comentario
  const regex = new RegExp(
    `(/\\*\\*[\\s\\S]*?\\*/\\s*)?export function ${functionName}\\(\\)[\\s\\S]*?\\n\\}`,
    'g'
  );

  return content.replace(regex, newFunction.trim());
}

// Reemplazar generateHead_Base_01
let modified = replaceFunction(original, 'generateHead_Base_01', headFunction);

// Reemplazar generateHairShort_02_BobCut
modified = replaceFunction(modified, 'generateHairShort_02_BobCut', hatFunction);

// Guardar el archivo modificado
fs.writeFileSync('lib/minecraft/component-generator.ts', modified, 'utf8');

console.log('✅ Funciones reemplazadas exitosamente');
console.log('   - generateHead_Base_01');
console.log('   - generateHairShort_02_BobCut');
