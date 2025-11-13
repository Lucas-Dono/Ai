/**
 * Script de prueba para el sistema de Narrative Arcs
 *
 * Uso:
 * npx tsx scripts/test-narrative-arcs.ts
 */

import { NarrativeArcDetector } from '../lib/life-events/narrative-arc-detector';

console.log('🧪 Testing Narrative Arc Detector\n');

// ============================================
// Test 1: Work/Career Arc
// ============================================
console.log('📋 TEST 1: Arco de Búsqueda Laboral\n');

const workArcMessages = [
  { date: '2024-01-01', text: 'Estoy buscando trabajo como desarrollador frontend' },
  { date: '2024-01-10', text: 'Tengo entrevista mañana en Google' },
  { date: '2024-01-12', text: 'Segunda entrevista con el equipo técnico' },
  { date: '2024-01-15', text: 'Conseguí la oferta! Empiezo en febrero' },
];

workArcMessages.forEach((msg, index) => {
  const result = NarrativeArcDetector.analyzeMessage(msg.text, new Date(msg.date));

  console.log(`${index + 1}. [${msg.date}] "${msg.text}"`);

  if (result) {
    console.log(`   ✅ Estado: ${result.state}`);
    console.log(`   ✅ Categoría: ${result.category}`);
    console.log(`   ✅ Confianza: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   ✅ Keywords: ${result.keywords.join(', ')}`);
    console.log(`   ✅ Tono: ${result.emotionalTone || 'neutral'}`);
  } else {
    console.log(`   ❌ No se detectó arco narrativo`);
  }

  console.log('');
});

// ============================================
// Test 2: Relationships/Love Arc
// ============================================
console.log('\n💕 TEST 2: Arco de Historia de Amor\n');

const loveArcMessages = [
  { date: '2024-02-01', text: 'Me gusta una chica de la universidad' },
  { date: '2024-02-05', text: 'Le pedí salir y dijo que sí!' },
  { date: '2024-02-08', text: 'Tuvimos nuestra primera cita, fue increíble' },
  { date: '2024-02-14', text: 'Somos novios ahora' },
];

loveArcMessages.forEach((msg, index) => {
  const result = NarrativeArcDetector.analyzeMessage(msg.text, new Date(msg.date));

  console.log(`${index + 1}. [${msg.date}] "${msg.text}"`);

  if (result) {
    console.log(`   ✅ Estado: ${result.state}`);
    console.log(`   ✅ Categoría: ${result.category}`);
    console.log(`   ✅ Confianza: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   ✅ Keywords: ${result.keywords.join(', ')}`);
  } else {
    console.log(`   ❌ No se detectó arco narrativo`);
  }

  console.log('');
});

// ============================================
// Test 3: Education/Learning Arc
// ============================================
console.log('\n🎓 TEST 3: Arco de Camino Educativo\n');

const educationArcMessages = [
  { date: '2024-03-01', text: 'Empecé a estudiar Python en Udemy' },
  { date: '2024-03-20', text: 'Ya terminé 5 módulos del curso' },
  { date: '2024-04-10', text: 'Tengo el examen final mañana' },
  { date: '2024-04-11', text: 'Aprobé! Obtuve mi certificado' },
];

educationArcMessages.forEach((msg, index) => {
  const result = NarrativeArcDetector.analyzeMessage(msg.text, new Date(msg.date));

  console.log(`${index + 1}. [${msg.date}] "${msg.text}"`);

  if (result) {
    console.log(`   ✅ Estado: ${result.state}`);
    console.log(`   ✅ Categoría: ${result.category}`);
    console.log(`   ✅ Confianza: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   ✅ Keywords: ${result.keywords.join(', ')}`);
  } else {
    console.log(`   ❌ No se detectó arco narrativo`);
  }

  console.log('');
});

// ============================================
// Test 4: Negative Outcome
// ============================================
console.log('\n❌ TEST 4: Arco con Outcome Negativo\n');

const negativeArcMessages = [
  { date: '2024-05-01', text: 'Estoy postulando a varias universidades' },
  { date: '2024-05-15', text: 'Tengo entrevista en Harvard' },
  { date: '2024-05-20', text: 'Me rechazaron en Harvard' },
];

negativeArcMessages.forEach((msg, index) => {
  const result = NarrativeArcDetector.analyzeMessage(msg.text, new Date(msg.date));

  console.log(`${index + 1}. [${msg.date}] "${msg.text}"`);

  if (result) {
    console.log(`   ✅ Estado: ${result.state}`);
    console.log(`   ✅ Categoría: ${result.category}`);
    console.log(`   ✅ Confianza: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   ✅ Tono: ${result.emotionalTone || 'neutral'}`);
  } else {
    console.log(`   ❌ No se detectó arco narrativo`);
  }

  console.log('');
});

// ============================================
// Test 5: Theme Similarity
// ============================================
console.log('\n🔗 TEST 5: Similitud Temática\n');

const theme1 = NarrativeArcDetector.extractTheme('Busco trabajo como desarrollador en empresa tecnológica');
const theme2 = NarrativeArcDetector.extractTheme('Tengo entrevista para desarrollador en Google');
const theme3 = NarrativeArcDetector.extractTheme('Me gusta alguien de la universidad');

console.log(`Tema 1: "${theme1}"`);
console.log(`Tema 2: "${theme2}"`);
console.log(`Tema 3: "${theme3}"\n`);

const similarity12 = NarrativeArcDetector.calculateThemeSimilarity(theme1, theme2);
const similarity13 = NarrativeArcDetector.calculateThemeSimilarity(theme1, theme3);

console.log(`Similitud (1-2): ${(similarity12 * 100).toFixed(1)}% ${similarity12 > 0.3 ? '✅ Relacionados' : '❌ No relacionados'}`);
console.log(`Similitud (1-3): ${(similarity13 * 100).toFixed(1)}% ${similarity13 > 0.3 ? '✅ Relacionados' : '❌ No relacionados'}`);

// ============================================
// Test 6: Event Linking
// ============================================
console.log('\n\n🔗 TEST 6: Linking de Eventos\n');

const event1 = {
  timestamp: new Date('2024-01-01'),
  message: 'Busco trabajo como desarrollador',
  state: 'seeking' as const,
  category: 'work_career' as const,
  confidence: 0.8,
  keywords: ['busco', 'trabajo'],
};

const event2 = {
  timestamp: new Date('2024-01-15'),
  message: 'Tengo entrevista para desarrollador',
  state: 'progress' as const,
  category: 'work_career' as const,
  confidence: 0.8,
  keywords: ['entrevista', 'desarrollador'],
};

const event3 = {
  timestamp: new Date('2024-06-01'),
  message: 'Tengo otra entrevista',
  state: 'progress' as const,
  category: 'work_career' as const,
  confidence: 0.8,
  keywords: ['entrevista'],
};

console.log('Evento 1:', event1.message, '(', event1.timestamp.toISOString().split('T')[0], ')');
console.log('Evento 2:', event2.message, '(', event2.timestamp.toISOString().split('T')[0], ')');
console.log('Evento 3:', event3.message, '(', event3.timestamp.toISOString().split('T')[0], ')\n');

const related12 = NarrativeArcDetector.areEventsRelated(event1, event2);
const related13 = NarrativeArcDetector.areEventsRelated(event1, event3);

console.log(`¿Evento 1 y 2 relacionados? ${related12 ? '✅ Sí (15 días de diferencia)' : '❌ No'}`);
console.log(`¿Evento 1 y 3 relacionados? ${related13 ? '✅ Sí' : '❌ No (151 días de diferencia, > 90 días)'}`);

console.log('\n✅ Tests completados!\n');
