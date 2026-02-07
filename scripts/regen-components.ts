import { generateAllComponents } from '../lib/minecraft/component-generator';
import path from 'path';

async function main() {
  const outputDir = path.join(process.cwd(), 'public/minecraft/components');
  console.log('Regenerando componentes...\n');
  await generateAllComponents(outputDir);
  console.log('\n✅ Componentes regenerados');
}

main().catch(console.error);
