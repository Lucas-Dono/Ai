#!/usr/bin/env tsx

import { generateAllComponents } from '../lib/minecraft/component-generator';
import path from 'path';

const outputDir = path.join(process.cwd(), 'public', 'minecraft', 'components');

console.log('Regenerando todos los componentes...');
generateAllComponents(outputDir)
  .then(() => {
    console.log('✅ Componentes generados exitosamente');
  })
  .catch((error) => {
    console.error('❌ Error generando componentes:', error);
    process.exit(1);
  });
