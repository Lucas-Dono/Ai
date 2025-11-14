/**
 * Seed Email Sequences
 *
 * Populates the database with predefined email sequences and templates
 *
 * Usage: npx tsx scripts/seed-email-sequences.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding email sequences...');

  // 1. WELCOME SEQUENCE
  console.log('1️⃣ Creating Welcome sequence...');
  const welcomeSequence = await prisma.emailSequence.upsert({
    where: { name: 'welcome' },
    create: {
      name: 'welcome',
      description: 'Welcome new users and guide them through onboarding',
      category: 'onboarding',
      triggerEvent: 'signup',
      targetPlans: [],
      priority: 10,
      active: true,
      emails: {
        create: [
          {
            name: 'welcome_1',
            subject: 'Bienvenido a Circuit Prompt AI, {{userName}}!',
            templateId: 'welcome_1',
            previewText: 'Tu guía rápida para empezar',
            delayDays: 0,
            delayHours: 0,
            sendTimeStart: 9,
            sendTimeEnd: 18,
            order: 0,
            active: true,
            requiresPreviousEmail: false,
          },
          {
            name: 'welcome_2',
            subject: 'Tips para conversaciones increíbles',
            templateId: 'welcome_2',
            previewText: 'Aprende a sacar el máximo provecho',
            delayDays: 1,
            delayHours: 0,
            sendTimeStart: 9,
            sendTimeEnd: 18,
            order: 1,
            active: true,
            requiresPreviousEmail: true,
          },
          {
            name: 'welcome_3',
            subject: 'Descubre los mundos virtuales',
            templateId: 'welcome_3',
            previewText: 'Una experiencia completamente nueva',
            delayDays: 3,
            delayHours: 0,
            sendTimeStart: 9,
            sendTimeEnd: 18,
            order: 2,
            active: true,
            requiresPreviousEmail: true,
          },
          {
            name: 'welcome_4',
            subject: 'Únete a nuestra comunidad',
            templateId: 'welcome_4',
            previewText: 'Conecta con otros creadores',
            delayDays: 7,
            delayHours: 0,
            sendTimeStart: 9,
            sendTimeEnd: 18,
            order: 3,
            active: true,
            requiresPreviousEmail: true,
          },
          {
            name: 'welcome_5',
            subject: 'Desbloquea todo el potencial',
            templateId: 'welcome_5',
            previewText: '20% OFF en tu primer mes',
            delayDays: 14,
            delayHours: 0,
            sendTimeStart: 9,
            sendTimeEnd: 18,
            order: 4,
            active: true,
            requiresPreviousEmail: true,
          },
        ],
      },
    },
    update: {},
  });
  console.log('   ✅ Welcome sequence created');

  // 2. REACTIVATION SEQUENCE
  console.log('2️⃣ Creating Reactivation sequence...');
  const reactivationSequence = await prisma.emailSequence.upsert({
    where: { name: 'reactivation' },
    create: {
      name: 'reactivation',
      description: 'Re-engage inactive users',
      category: 'retention',
      triggerEvent: 'inactive_7d',
      targetPlans: [],
      priority: 8,
      active: true,
      emails: {
        create: [
          {
            name: 'reactivation_1',
            subject: 'Te extrañamos, {{userName}}',
            templateId: 'reactivation_1',
            previewText: 'Tus IAs te esperan',
            delayDays: 0,
            delayHours: 0,
            sendTimeStart: 10,
            sendTimeEnd: 16,
            order: 0,
            active: true,
            requiresPreviousEmail: false,
          },
          {
            name: 'reactivation_2',
            subject: 'Nuevas features que te encantarán',
            templateId: 'reactivation_2',
            previewText: 'Mira todo lo nuevo',
            delayDays: 7,
            delayHours: 0,
            sendTimeStart: 10,
            sendTimeEnd: 16,
            order: 1,
            active: true,
            requiresPreviousEmail: true,
          },
          {
            name: 'reactivation_3',
            subject: '50% OFF si vuelves hoy',
            templateId: 'reactivation_3',
            previewText: 'Oferta especial solo para ti',
            delayDays: 7,
            delayHours: 0,
            sendTimeStart: 10,
            sendTimeEnd: 16,
            order: 2,
            active: true,
            requiresPreviousEmail: true,
          },
          {
            name: 'reactivation_4',
            subject: 'Última oportunidad',
            templateId: 'reactivation_4',
            previewText: 'Danos tu feedback',
            delayDays: 9,
            delayHours: 0,
            sendTimeStart: 10,
            sendTimeEnd: 16,
            order: 3,
            active: true,
            requiresPreviousEmail: true,
          },
        ],
      },
    },
    update: {},
  });
  console.log('   ✅ Reactivation sequence created');

  // 3. UPGRADE NUDGE SEQUENCE
  console.log('3️⃣ Creating Upgrade Nudge sequence...');
  const upgradeSequence = await prisma.emailSequence.upsert({
    where: { name: 'upgrade_nudge' },
    create: {
      name: 'upgrade_nudge',
      description: 'Encourage free users to upgrade',
      category: 'conversion',
      triggerEvent: 'limit_reached_90',
      targetPlans: ['free'],
      priority: 9,
      active: true,
      emails: {
        create: [
          {
            name: 'upgrade_nudge_1',
            subject: 'Casi alcanzaste tu límite de mensajes',
            templateId: 'upgrade_nudge_1',
            previewText: 'Continúa conversando sin límites',
            delayDays: 0,
            delayHours: 0,
            sendTimeStart: 9,
            sendTimeEnd: 18,
            order: 0,
            active: true,
            requiresPreviousEmail: false,
          },
          {
            name: 'upgrade_nudge_2',
            subject: 'Unlock los mundos virtuales',
            templateId: 'upgrade_nudge_2',
            previewText: 'Lleva tus conversaciones al siguiente nivel',
            delayDays: 10,
            delayHours: 0,
            sendTimeStart: 9,
            sendTimeEnd: 18,
            order: 1,
            active: true,
            requiresPreviousEmail: false,
          },
          {
            name: 'upgrade_nudge_3',
            subject: 'Oferta especial: 20% OFF',
            templateId: 'upgrade_nudge_3',
            previewText: 'Tu descuento exclusivo',
            delayDays: 10,
            delayHours: 0,
            sendTimeStart: 9,
            sendTimeEnd: 18,
            order: 2,
            active: true,
            requiresPreviousEmail: false,
          },
        ],
      },
    },
    update: {},
  });
  console.log('   ✅ Upgrade Nudge sequence created');

  // 4. TRIAL ENDING SEQUENCE
  console.log('4️⃣ Creating Trial Ending sequence...');
  const trialSequence = await prisma.emailSequence.upsert({
    where: { name: 'trial_ending' },
    create: {
      name: 'trial_ending',
      description: 'Alert users about trial ending',
      category: 'conversion',
      triggerEvent: 'trial_ending_3d',
      targetPlans: ['plus', 'ultra'],
      priority: 10,
      active: true,
      emails: {
        create: [
          {
            name: 'trial_ending_1',
            subject: 'Tu trial termina en 3 días',
            templateId: 'trial_ending_1',
            previewText: 'Mantén tus features premium',
            delayDays: 0,
            delayHours: 0,
            sendTimeStart: 9,
            sendTimeEnd: 18,
            order: 0,
            active: true,
            requiresPreviousEmail: false,
          },
          {
            name: 'trial_ending_2',
            subject: 'Última oportunidad: Tu trial termina mañana',
            templateId: 'trial_ending_2',
            previewText: 'No pierdas tus features',
            delayDays: 2,
            delayHours: 0,
            sendTimeStart: 9,
            sendTimeEnd: 18,
            order: 1,
            active: true,
            requiresPreviousEmail: false,
          },
          {
            name: 'trial_ending_3',
            subject: 'Tu plan ha cambiado a Free',
            templateId: 'trial_ending_3',
            previewText: 'Reactiva con 25% de descuento',
            delayDays: 1,
            delayHours: 12,
            sendTimeStart: 9,
            sendTimeEnd: 18,
            order: 2,
            active: true,
            requiresPreviousEmail: false,
          },
        ],
      },
    },
    update: {},
  });
  console.log('   ✅ Trial Ending sequence created');

  console.log('\n✅ Email sequences seeded successfully!');
  console.log('\nSequences created:');
  console.log(`  - Welcome (5 emails)`);
  console.log(`  - Reactivation (4 emails)`);
  console.log(`  - Upgrade Nudge (3 emails)`);
  console.log(`  - Trial Ending (3 emails)`);
  console.log('\nTotal: 15 email templates');
}

main()
  .catch((error) => {
    console.error('❌ Error seeding email sequences:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
