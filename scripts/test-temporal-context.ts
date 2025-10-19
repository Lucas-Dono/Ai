/**
 * Test script for temporal context system
 *
 * Run with: npx tsx scripts/test-temporal-context.ts
 */

import { buildTemporalPrompt, getCurrentDateTime } from '../lib/context/temporal';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🕐 TEMPORAL CONTEXT TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Current datetime
console.log('📅 Test 1: Current Date/Time');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const context = getCurrentDateTime();
console.log(`Fecha: ${context.date}`);
console.log(`Hora: ${context.time}`);
console.log(`Día: ${context.dayOfWeek}`);
console.log(`Mes: ${context.month}`);

if (context.specialDay) {
  console.log(`\n🎉 Evento especial detectado:`);
  console.log(`  Nombre: ${context.specialDay.name}`);
  console.log(`  Categoría: ${context.specialDay.category}`);
  console.log(`  Tono emocional: ${context.specialDay.emotionalTone}`);
  console.log(`  Intimidad requerida: ${context.specialDay.intimacyRequired}`);
} else {
  console.log('\n(No hay eventos especiales hoy)');
}

// Test 2: Relationship stage modulation
console.log('\n\n🔄 Test 2: Stage-based Event Mention');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const stages = ['stranger', 'acquaintance', 'friend', 'intimate'];

stages.forEach(stage => {
  console.log(`\n--- ${stage.toUpperCase()} ---`);
  const prompt = buildTemporalPrompt(stage);
  console.log(prompt);
});

// Test 3: Simulate specific dates
console.log('\n\n📆 Test 3: Simulated Special Days');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const testDates = [
  { name: 'Navidad', month: 12, day: 25 },
  { name: 'Año Nuevo', month: 1, day: 1 },
  { name: 'San Valentín', month: 2, day: 14 },
  { name: 'Independencia', month: 7, day: 9 },
];

// Note: This would require modifying the function to accept a date parameter
// For now, just showing what dates we'd test
testDates.forEach(date => {
  console.log(`\n${date.name}: ${date.day}/${date.month}`);
  console.log('(Para probar, cambia la fecha del sistema o modifica temporal.ts)');
});

console.log('\n\n✅ Tests completados');
console.log('\n💡 Tips:');
console.log('  - Los eventos se muestran solo si el relationship stage es apropiado');
console.log('  - Stranger: Solo eventos muy generales (Navidad, Año Nuevo)');
console.log('  - Acquaintance: Eventos públicos y celebraciones');
console.log('  - Friend: Puede mencionar eventos más personales');
console.log('  - Intimate: Conexión emocional profunda con los eventos');
