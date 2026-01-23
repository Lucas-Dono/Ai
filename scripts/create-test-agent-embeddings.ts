/**
 * Create a test agent with proper worldKnowledge structure for testing embeddings
 */

import { prisma } from '@/lib/prisma';
import { generateProfileEmbeddings } from '@/lib/profile/profile-embeddings';
import { nanoid } from 'nanoid';

async function createTestAgent() {
  console.log('🔧 Creando agente de prueba con estructura worldKnowledge completa...\n');

  // Find any user
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error('❌ No se encontró ningún usuario');
    process.exit(1);
  }

  // Create test agent
  const agent = await prisma.agent.create({
    data: {
      id: nanoid(),
      updatedAt: new Date(),
      name: 'Test Embeddings Agent',
      description: 'Agent for testing embeddings system',
      systemPrompt: 'You are a helpful assistant.',
      userId: user.id,
      kind: 'companion',
      profile: {},
      SemanticMemory: {
        create: {
          id: nanoid(),
          userFacts: {},
          userPreferences: {},
          relationshipStage: 'first_meeting',
          worldKnowledge: {
            // [FAMILY] data
            family: {
              mother: {
                name: 'María',
                age: 55,
                occupation: 'Profesora de historia',
                personality: 'Cariñosa pero estricta',
              },
              father: {
                name: 'Carlos',
                age: 58,
                occupation: 'Ingeniero civil retirado',
                personality: 'Tranquilo, disfruta la jardinería',
              },
              siblings: [
                {
                  name: 'Ana',
                  age: 28,
                  relationship: 'hermana mayor',
                  occupation: 'Médica en Córdoba',
                },
              ],
              pets: [
                {
                  name: 'Max',
                  type: 'golden retriever',
                  age: 3,
                  personality: 'Juguetón y cariñoso',
                },
              ],
            },

            // [FRIENDS] data
            socialCircle: {
              bestFriend: {
                name: 'Lucas',
                since: '2015',
                occupation: 'Programador',
                activities: ['gaming', 'hiking', 'movies'],
              },
              closeGroup: [
                {
                  name: 'Sofía',
                  role: 'Amiga de la universidad',
                  contact: 'Nos vemos cada semana',
                },
                {
                  name: 'Diego',
                  role: 'Compañero de gym',
                  contact: 'Entrenamientos 3 veces por semana',
                },
              ],
            },

            // [WORK] data
            occupation: {
              current: {
                title: 'Software Engineer',
                company: 'TechCorp SA',
                since: '2020',
                location: 'Buenos Aires',
                schedule: 'Remoto, 9-18hs',
                salary: '$150,000/año',
              },
              previousJobs: [
                {
                  title: 'Junior Developer',
                  company: 'StartupXYZ',
                  period: '2018-2020',
                },
              ],
              skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
            },

            // [INTERESTS] data
            interests: {
              music: {
                favoriteGenres: ['Rock alternativo', 'Indie', 'Electronic'],
                favoriteArtists: ['Radiohead', 'Tame Impala', 'The National'],
                favoriteSong: 'Fake Plastic Trees - Radiohead',
                instruments: ['Guitarra acústica (nivel intermedio)'],
              },
              movies: {
                favoriteGenres: ['Sci-fi', 'Drama', 'Thriller psicológico'],
                favoriteDirectors: ['Denis Villeneuve', 'Christopher Nolan'],
                recentlyWatched: 'Dune Part 2 (loved it)',
              },
              books: {
                favoriteGenres: ['Ciencia ficción', 'Filosofía', 'Tecnología'],
                currentlyReading: 'Project Hail Mary - Andy Weir',
                favoriteAuthors: ['Isaac Asimov', 'Philip K. Dick', 'Carl Sagan'],
              },
              hobbies: [
                'Programación de side projects',
                'Gaming (RPGs y estrategia)',
                'Hiking los fines de semana',
                'Fotografía amateur',
              ],
            },

            // [PAST] data
            formativeExperiences: {
              achievements: [
                {
                  event: 'Ganó hackathon nacional 2019',
                  impact: 'Confirmó que quería dedicarme al desarrollo',
                  emotion: 'Orgullo y validación',
                },
              ],
              challenges: [
                {
                  event: 'Perdió empleo en pandemia 2020',
                  impact: 'Aprendió resiliencia y la importancia del ahorro',
                  emotion: 'Ansiedad pero crecimiento',
                },
              ],
              milestones: [
                {
                  event: 'Mudanza a capital 2018',
                  significance: 'Primera vez viviendo solo, independencia',
                },
              ],
            },

            // [INNER] data
            innerWorld: {
              fears: [
                'Miedo al fracaso profesional',
                'Ansiedad social en grupos grandes',
              ],
              dreams: [
                'Crear una empresa de tecnología propia',
                'Viajar por Asia (Japón especialmente)',
              ],
              values: [
                'Honestidad y transparencia',
                'Aprendizaje continuo',
                'Balance vida-trabajo',
              ],
              insecurities: [
                'Impostor syndrome ocasional',
                'Preocupación por no avanzar lo suficientemente rápido',
              ],
            },

            // [DAILY] data
            dailyLife: {
              routine: {
                weekdays: {
                  morning: '7:00 - Despertar, desayuno, ducha',
                  work: '9:00-13:00 - Deep work, 13:00-14:00 almuerzo',
                  afternoon: '14:00-18:00 - Meetings y código',
                  evening: '19:00 - Gym o caminar, 21:00 cena',
                  night: '23:00 - Leer o series, dormir',
                },
                weekends: {
                  saturday: 'Hiking o explorar la ciudad, side projects',
                  sunday: 'Relax, familia, cocinar, preparar semana',
                },
              },
              habits: {
                positive: ['Medita 10 min/día', 'Lee antes de dormir', 'Gym 4x semana'],
                workingOn: ['Reducir tiempo en redes sociales', 'Cocinar más en casa'],
              },
              favoritePlaces: [
                'Café "The Reading Room" (para trabajar)',
                'Bosques de Palermo (para correr)',
                'Librería Ateneo Grand Splendid',
              ],
            },

            // [MEMORIES] data
            episodicMemories: [
              {
                date: '2019-08-15',
                event: 'Hackathon victory',
                description: 'Ganamos el hackathon nacional con un proyecto de IA para salud. Me quedé despierto 48hs seguidas. Cuando anunciaron nuestro nombre como ganadores, casi no lo podía creer.',
                emotion: 'Euforia, orgullo',
                significance: 'Punto de inflexión en mi carrera',
              },
              {
                date: '2020-03-20',
                event: 'Inicio de pandemia',
                description: 'Primer día de cuarentena. La ciudad vacía, incertidumbre total. Llamadas con familia para asegurar que todos estaban bien.',
                emotion: 'Miedo, preocupación',
                significance: 'Aprendí el valor de la conexión familiar',
              },
              {
                date: '2021-12-25',
                event: 'Navidad familiar memorable',
                description: 'Primera Navidad post-pandemia con toda la familia reunida. Asado en lo de mis padres, Max corriendo por el jardín, mi hermana contando anécdotas del hospital.',
                emotion: 'Gratitud, alegría',
                significance: 'Momento de reconexión después de tiempos difíciles',
              },
            ],
          },
        },
      },
      InternalState: {
        create: {
          id: nanoid(),
          currentEmotions: { joy: 0.5, curiosity: 0.6 },
          activeGoals: [],
          conversationBuffer: [],
        },
      },
    },
  });

  console.log(`✅ Agente creado: ${agent.name} (${agent.id})\n`);

  // Generate embeddings
  console.log('📊 Generando embeddings...\n');
  await generateProfileEmbeddings(agent.id);

  console.log('\n✅ Embeddings generados exitosamente');
  console.log(`\n🧪 Ahora puedes probar el sistema con:`);
  console.log(`   npx tsx scripts/test-embedding-detection.ts\n`);

  process.exit(0);
}

createTestAgent();
