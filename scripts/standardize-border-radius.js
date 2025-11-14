#!/usr/bin/env node
/**
 * SCRIPT: Estandarizar Border Radius
 *
 * Reemplaza border radius inconsistentes con el nuevo estándar:
 * - rounded-2xl (16px) para componentes principales
 *
 * Uso: node scripts/standardize-border-radius.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// ============================================
// CONFIGURACIÓN
// ============================================

const DRY_RUN = process.argv.includes('--dry-run');

// Directorios a procesar
const DIRECTORIES = ['components', 'app'];

// Patrones de reemplazo
const REPLACEMENTS = [
  // CARDS & CONTAINERS: rounded-lg → rounded-2xl
  {
    pattern: /className="([^"]*)(rounded-lg)([^"]*)"/g,
    replacement: (match, before, rounded, after) => {
      // Excluir si está en tooltip, badge o tag explícitamente
      if (before.includes('tooltip') || before.includes('badge') || before.includes('tag')) {
        return match; // No cambiar
      }
      // Excluir si ya tiene rounded-2xl cerca
      if (before.includes('rounded-2xl') || after.includes('rounded-2xl')) {
        return match;
      }
      return `className="${before}rounded-2xl${after}"`;
    },
    description: 'rounded-lg → rounded-2xl (cards, containers)',
  },

  // INPUTS & FORMS: rounded-xl → rounded-2xl
  {
    pattern: /className="([^"]*)(rounded-xl)([^"]*)"/g,
    replacement: (match, before, rounded, after) => {
      // Excluir chips y dropdowns pequeños
      if (before.includes('chip') || before.includes('dropdown-item')) {
        return match;
      }
      return `className="${before}rounded-2xl${after}"`;
    },
    description: 'rounded-xl → rounded-2xl (inputs, forms)',
  },

  // MODALS & DIALOGS: rounded-md → rounded-2xl
  {
    pattern: /className="([^"]*)(rounded-md)([^"]*)"/g,
    replacement: (match, before, rounded, after) => {
      // Solo cambiar en modals, dialogs, panels
      if (
        before.includes('modal') ||
        before.includes('dialog') ||
        before.includes('panel') ||
        before.includes('card')
      ) {
        return `className="${before}rounded-2xl${after}"`;
      }
      return match; // No cambiar badges pequeños
    },
    description: 'rounded-md → rounded-2xl (modals, dialogs)',
  },

  // TEMPLATE LITERALS: similar replacements
  {
    pattern: /className={`([^`]*)(rounded-lg)([^`]*)`}/g,
    replacement: (match, before, rounded, after) => {
      if (before.includes('tooltip') || before.includes('badge') || before.includes('tag')) {
        return match;
      }
      return `className={\`${before}rounded-2xl${after}\`}`;
    },
    description: 'Template literals: rounded-lg → rounded-2xl',
  },

  {
    pattern: /className={`([^`]*)(rounded-xl)([^`]*)`}/g,
    replacement: (match, before, rounded, after) => {
      if (before.includes('chip') || before.includes('dropdown-item')) {
        return match;
      }
      return `className={\`${before}rounded-2xl${after}\`}`;
    },
    description: 'Template literals: rounded-xl → rounded-2xl',
  },

  // CN() UTILITY: rounded-lg → rounded-2xl
  {
    pattern: /cn\(([^)]*)(rounded-lg)([^)]*)\)/g,
    replacement: (match, before, rounded, after) => {
      if (before.includes('tooltip') || before.includes('badge') || before.includes('tag')) {
        return match;
      }
      return `cn(${before}rounded-2xl${after})`;
    },
    description: 'cn() utility: rounded-lg → rounded-2xl',
  },
];

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Encuentra todos los archivos .tsx recursivamente
 */
function findTsxFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Saltar node_modules y .next
      if (file !== 'node_modules' && file !== '.next' && file !== 'build') {
        results = results.concat(findTsxFiles(filePath));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(filePath);
    }
  }

  return results;
}

/**
 * Procesa un archivo aplicando los reemplazos
 */
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const changes = [];

  for (const replacement of REPLACEMENTS) {
    const originalContent = content;
    const matches = content.match(replacement.pattern);

    if (matches && matches.length > 0) {
      if (typeof replacement.replacement === 'function') {
        content = content.replace(replacement.pattern, replacement.replacement);
      } else {
        content = content.replace(replacement.pattern, replacement.replacement);
      }

      if (content !== originalContent) {
        modified = true;
        changes.push({
          description: replacement.description,
          count: matches.length,
        });
      }
    }
  }

  return { content, modified, changes };
}

/**
 * Formatea el reporte de cambios
 */
function formatChanges(changes) {
  return changes.map((c) => `  - ${c.description}: ${c.count} cambios`).join('\n');
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🎨 Estandarizando Border Radius...\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No se guardarán cambios\n');
  }

  let totalFiles = 0;
  let modifiedFiles = 0;
  let totalChanges = 0;

  // Procesar cada directorio
  for (const dir of DIRECTORIES) {
    const dirPath = path.join(process.cwd(), dir);

    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Directorio no encontrado: ${dir}\n`);
      continue;
    }

    console.log(`📂 Procesando: ${dir}/`);

    const files = findTsxFiles(dirPath);
    totalFiles += files.length;

    for (const filePath of files) {
      const relativePath = path.relative(process.cwd(), filePath);
      const { content, modified, changes } = processFile(filePath);

      if (modified) {
        modifiedFiles++;
        const changeCount = changes.reduce((sum, c) => sum + c.count, 0);
        totalChanges += changeCount;

        console.log(`\n✏️  ${relativePath}`);
        console.log(formatChanges(changes));

        if (!DRY_RUN) {
          fs.writeFileSync(filePath, content, 'utf8');
        }
      }
    }

    console.log('');
  }

  // Reporte final
  console.log('━'.repeat(60));
  console.log('📊 RESUMEN');
  console.log('━'.repeat(60));
  console.log(`Total archivos analizados: ${totalFiles}`);
  console.log(`Archivos modificados: ${modifiedFiles}`);
  console.log(`Total de cambios: ${totalChanges}`);

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN - Ejecuta sin --dry-run para aplicar cambios');
  } else {
    console.log('\n✅ Cambios aplicados exitosamente');
    console.log('\n💡 Siguiente paso:');
    console.log('   Revisa los cambios con: git diff');
    console.log('   Si todo está bien: git add . && git commit -m "style: estandarizar border radius a rounded-2xl"');
  }
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
