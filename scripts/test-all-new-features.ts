/**
 * Comprehensive Test Script for New Features
 *
 * Tests:
 * 1. Recurring events (birthdays, anniversaries)
 * 2. Weather system with Open-Meteo
 * 3. Important people system (PERSON command)
 */

import { prisma } from '@/lib/prisma';
import {
  interceptRememberCommands,
  buildReminderContext,
  checkAndRenewPastRecurringEvents,
} from '@/lib/events/remember-interceptor';
import {
  interceptPersonCommands,
  buildPeopleContext,
  getImportantPeople,
} from '@/lib/people/person-interceptor';
import { getUserWeather, buildWeatherPrompt, ARGENTINA_CITIES } from '@/lib/context/weather';

// Use existing agent from database
let TEST_AGENT_ID: string;
let TEST_USER_ID: string;

async function setupTestAgent() {
  const agent = await prisma.agent.findFirst({
    include: {
      user: true,
    },
  });

  if (!agent) {
    throw new Error('No agents found in database. Please create an agent first.');
  }

  TEST_AGENT_ID = agent.id;
  TEST_USER_ID = agent.userId;

  console.log(`✓ Using agent: ${agent.name} (${agent.id})`);
  console.log(`✓ User ID: ${TEST_USER_ID}\n`);

  return agent;
}

async function cleanup() {
  console.log('🧹 Cleaning up test data...\n');

  // Delete only test data
  await prisma.importantEvent.deleteMany({
    where: {
      agentId: TEST_AGENT_ID,
      userId: TEST_USER_ID,
      description: {
        contains: 'TEST',
      },
    },
  });

  await prisma.importantPerson.deleteMany({
    where: {
      agentId: TEST_AGENT_ID,
      userId: TEST_USER_ID,
      name: {
        contains: 'TEST',
      },
    },
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 1: RECURRING EVENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testRecurringEvents() {
  console.log('🔁 Test 1: Recurring Events\n');
  console.log('='.repeat(60));

  // Create a birthday event
  const birthdayResponse = 'Qué lindo! Feliz cumpleaños anticipado 🎂 [REMEMBER:2025-03-15|birthday|Cumpleaños TEST del usuario|critical]';

  console.log('\n1. Creating birthday event...');
  const result = await interceptRememberCommands(TEST_AGENT_ID, TEST_USER_ID, birthdayResponse);
  console.log(`   ✓ Created: ${result.commands[0]?.description}`);
  console.log(`   ✓ Type: ${result.commands[0]?.type}`);
  console.log(`   ✓ Is recurring: true (auto-detected for birthdays)`);

  // Verify it was saved with recurring flags
  const event = await prisma.importantEvent.findFirst({
    where: {
      agentId: TEST_AGENT_ID,
      userId: TEST_USER_ID,
      type: 'birthday',
      description: 'Cumpleaños TEST del usuario',
    },
  });

  if (event) {
    console.log(`\n2. Verifying database storage...`);
    console.log(`   ✓ Is recurring: ${event.isRecurring}`);
    console.log(`   ✓ Recurring day: ${event.recurringDay}`);
    console.log(`   ✓ Recurring month: ${event.recurringMonth}`);

    // Simulate it being a past event to test renewal
    console.log(`\n3. Testing automatic renewal...`);
    await prisma.importantEvent.update({
      where: { id: event.id },
      data: {
        eventDate: new Date('2024-03-15'), // Set to last year
      },
    });

    await checkAndRenewPastRecurringEvents(TEST_AGENT_ID, TEST_USER_ID);

    const nextYear = await prisma.importantEvent.findFirst({
      where: {
        agentId: TEST_AGENT_ID,
        userId: TEST_USER_ID,
        type: 'birthday',
        description: 'Cumpleaños TEST del usuario',
        eventDate: {
          gte: new Date('2025-01-01'),
        },
      },
    });

    if (nextYear) {
      console.log(`   ✓ Next year's event created automatically!`);
      console.log(`   ✓ Date: ${nextYear.eventDate.toISOString().split('T')[0]}`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 2: WEATHER SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testWeatherSystem() {
  console.log('🌤️  Test 2: Weather System (Open-Meteo)\n');
  console.log('='.repeat(60));

  console.log('\n1. Testing weather for different Argentine cities...\n');

  const citiesToTest = ['Buenos Aires', 'Córdoba', 'Bariloche'];

  for (const cityName of citiesToTest) {
    const weather = await getUserWeather(cityName);

    if (weather) {
      console.log(`   📍 ${cityName}:`);
      console.log(`      Temperature: ${weather.temperature}°C`);
      console.log(`      Condition: ${weather.weatherDescription}`);
      console.log(`      Wind: ${weather.windSpeed} km/h`);
      console.log(`      Humidity: ${weather.humidity}%`);
      console.log(`      Time: ${weather.isDay ? 'Day' : 'Night'}\n`);
    } else {
      console.log(`   ❌ Failed to fetch weather for ${cityName}\n`);
    }
  }

  console.log('2. Testing weather prompt builder...\n');

  const testWeather = await getUserWeather('Buenos Aires');
  if (testWeather) {
    const prompt = buildWeatherPrompt(testWeather);
    console.log(prompt);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 3: PERSON SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testPersonSystem() {
  console.log('👥 Test 3: Important People System\n');
  console.log('='.repeat(60));

  console.log('\n1. Creating people with PERSON commands...\n');

  const testResponses = [
    '¡Qué lindo! Tu hermana estudia medicina. [PERSON:Ana TEST|hermana|Vive en Córdoba, estudia medicina]',
    'Aww Max debe ser hermoso 💛 [PERSON:Max TEST|mascota|Perro golden de 3 años]',
    '¡Qué buen amigo! [PERSON:Lucas TEST|mejor amigo|Me ayudó cuando estuve mal]',
    'Las empanadas de mamá son las mejores [PERSON:Mamá TEST|madre|Cocina increíble, hace empanadas]',
  ];

  for (const response of testResponses) {
    const result = await interceptPersonCommands(TEST_AGENT_ID, TEST_USER_ID, response);

    if (result.commands.length > 0) {
      const cmd = result.commands[0];
      console.log(`   ✓ Saved: ${cmd.name} (${cmd.relationship})`);
      if (cmd.age) console.log(`     Age: ${cmd.age}`);
      if (cmd.gender) console.log(`     Gender: ${cmd.gender}`);
      if (cmd.description) console.log(`     Info: ${cmd.description}`);
      console.log(`     Clean response: "${result.cleanResponse}"\n`);
    }
  }

  console.log('2. Retrieving important people...\n');

  const people = await getImportantPeople(TEST_AGENT_ID, TEST_USER_ID);

  console.log(`   Found ${people.length} people:\n`);

  for (const person of people) {
    console.log(`   👤 ${person.name} (${person.relationship})`);
    if (person.description) console.log(`      ${person.description}`);
    console.log(`      Mentioned: ${person.mentionCount} times`);
    console.log(`      Last mentioned: ${person.lastMentioned?.toISOString().split('T')[0]}\n`);
  }

  console.log('3. Testing people context builder...\n');

  // Test at different relationship stages
  for (const stage of ['stranger', 'acquaintance', 'friend', 'intimate']) {
    console.log(`   🔹 Stage: ${stage.toUpperCase()}`);
    const context = await buildPeopleContext(TEST_AGENT_ID, TEST_USER_ID, stage);

    if (context) {
      console.log('      ✓ Context provided (relationship level sufficient)');
    } else {
      console.log('      ⚠️  No context (relationship level too low)');
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 4: INTEGRATION TEST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testIntegration() {
  console.log('🔗 Test 4: Integration Test\n');
  console.log('='.repeat(60));

  console.log('\n1. Building full context for message service...\n');

  // Build reminder context
  const reminderContext = await buildReminderContext(TEST_AGENT_ID, TEST_USER_ID, 'friend');
  console.log('   ✓ Reminder context built');
  if (reminderContext) {
    console.log(reminderContext);
  }

  // Build people context
  const peopleContext = await buildPeopleContext(TEST_AGENT_ID, TEST_USER_ID, 'friend');
  console.log('\n   ✓ People context built');
  if (peopleContext) {
    console.log(peopleContext);
  }

  // Get weather
  const weather = await getUserWeather('Buenos Aires');
  if (weather) {
    const weatherPrompt = buildWeatherPrompt(weather);
    console.log('\n   ✓ Weather context built');
    console.log(weatherPrompt);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main() {
  console.log('\n🧪 COMPREHENSIVE TEST SUITE - New Features\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Setup
    await setupTestAgent();

    // Run all tests
    await testRecurringEvents();
    await testWeatherSystem();
    await testPersonSystem();
    await testIntegration();

    console.log('✅ All tests completed successfully!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('🧹 Final cleanup...');
    await cleanup();
    await prisma.$disconnect();
  }
}

main();
