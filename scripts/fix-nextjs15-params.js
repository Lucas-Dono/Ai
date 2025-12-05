#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Buscando archivos con params antiguos...\n');

let files;
try {
  const output = execSync(
    'grep -r "params: { id: string }" app/api --include="*.ts" -l | grep -v "Promise"',
    { encoding: 'utf-8' }
  );
  files = output.trim().split('\n').filter(Boolean);
} catch (error) {
  console.log('✅ No se encontraron archivos para corregir');
  process.exit(0);
}

if (files.length === 0) {
  console.log('✅ No se encontraron archivos para corregir');
  process.exit(0);
}

console.log(`📁 Archivos encontrados: ${files.length}\n`);

let totalFixed = 0;

files.forEach(file => {
  console.log(`📝 ${file}`);
  
  try {
    let content = fs.readFileSync(file, 'utf-8');
    const original = content;
    
    // Cambiar tipo de params
    content = content.replace(
      /\{ params \}: \{ params: \{ id: string \} \}/g,
      '{ params }: { params: Promise<{ id: string }> }'
    );
    
    // Agregar await params después de la firma de función
    content = content.replace(
      /(export async function (?:GET|POST|PUT|DELETE|PATCH)\([^)]+\) \{)\n/g,
      '$1\n  const { id } = await params;\n\n'
    );
    
    // Reemplazar params.id por id
    content = content.replace(/params\.id/g, 'id');
    
    if (content !== original) {
      fs.writeFileSync(file + '.bak', original);
      fs.writeFileSync(file, content);
      console.log(`  ✅ Corregido\n`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}\n`);
  }
});

console.log(`\n✨ Completado! ${totalFixed}/${files.length} archivos corregidos\n`);
