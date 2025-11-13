/**
 * Script to fix Next.js 15 params async API
 * Converts: { params }: { params: { id: string } }
 * To: { params }: { params: Promise<{ id: string }> }
 * And adds await params
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: Fix function signature with single param (id, slug, etc.)
  const pattern1 = /\{\s*params\s*\}:\s*\{\s*params:\s*\{\s*(\w+):\s*string\s*\}\s*\}/g;
  if (pattern1.test(content)) {
    content = content.replace(
      pattern1,
      '{ params }: { params: Promise<{ $1: string }> }'
    );
    modified = true;
  }

  // Pattern 2: Fix params usage - find const { id } = params; or params.id
  // Replace with: const { id } = await params;
  const usagePattern1 = /const\s+\{\s*(\w+)\s*\}\s*=\s*params;/g;
  if (usagePattern1.test(content)) {
    content = content.replace(
      usagePattern1,
      'const { $1 } = await params;'
    );
    modified = true;
  }

  // Pattern 3: Direct params.id access
  const usagePattern2 = /const\s+(\w+)\s*=\s*params\.(\w+);/g;
  if (usagePattern2.test(content)) {
    content = content.replace(
      usagePattern2,
      'const { $2: $1 } = await params;'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }

  return false;
}

async function main() {
  console.log('🔍 Finding route files with dynamic params...\n');

  const files = await glob('app/api/**/*\\[*\\]*/route.ts', {
    ignore: ['node_modules/**', '.next/**'],
    absolute: true,
    cwd: process.cwd()
  });

  console.log(`Found ${files.length} route files\n`);

  let fixedCount = 0;
  for (const file of files) {
    const fixed = await fixFile(file);
    if (fixed) fixedCount++;
  }

  console.log(`\n✨ Fixed ${fixedCount} files`);
}

main().catch(console.error);
