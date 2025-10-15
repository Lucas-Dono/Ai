const { execSync } = require('child_process');

console.log('🗑️  Resetting database...');
console.log('⚠️  This will delete all data!\n');

try {
  // Set environment variable and run reset
  process.env.PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION = 'No hay nada importante, este proyecto unicamente lo tengo yo y lo voy a lanzar cuando todo funcione bien, ahora no esta listo para el publico general';
  
  execSync('npx prisma migrate reset --force --skip-seed', { 
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('\n✅ Database reset complete!');
} catch (error) {
  console.error('❌ Error resetting database:', error.message);
  process.exit(1);
}
