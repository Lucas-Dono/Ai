/**
 * Sistema de Templates para Creación de Mundos
 * Estructura progresiva: Tipo → Género → Sub-género → Template
 */

import type { WorldType } from './types';

// ============================================
// TIPOS BASE
// ============================================

export type WorldFormat = 'chat' | 'visual_novel';

export type UserTier = 'free' | 'plus' | 'ultra';

// ============================================
// GÉNEROS PRINCIPALES
// ============================================

export interface WorldGenre {
  id: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[]; // Para búsqueda
  availableFor: WorldFormat[]; // 'chat' | 'visual_novel'
  popularity: number; // 1-10 para ordenar
  subGenres: WorldSubGenre[];
}

export interface WorldSubGenre {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: WorldTemplate[];
}

export interface WorldTemplate {
  id: string;
  name: string;
  description: string;
  format: WorldFormat;
  genreId: string;
  subGenreId: string;

  // Restricciones
  requiredTier: UserTier;

  // Configuración base
  suggestedCharacterCount: number;
  complexity: 'simple' | 'medium' | 'complex';

  // Prompts para IA
  aiPromptTemplate: string; // Template para generar con IA
  defaultScenario?: string; // Escenario por defecto si no usan IA

  // Tags
  tags: string[];

  // Estadísticas
  popularity: number; // Número de veces usado
  rating?: number; // Rating promedio
}

// ============================================
// CATÁLOGO DE GÉNEROS
// ============================================

export const WORLD_GENRES: WorldGenre[] = [
  // ─────────────────────────────────────────
  // ROMANCE
  // ─────────────────────────────────────────
  {
    id: 'romance',
    name: 'Romance',
    description: 'Historias de amor, relaciones y drama romántico',
    icon: '💕',
    keywords: ['romance', 'amor', 'pareja', 'citas', 'relaciones', 'dating'],
    availableFor: ['chat', 'visual_novel'],
    popularity: 10,
    subGenres: [
      {
        id: 'romance_school',
        name: 'Romance Escolar',
        description: 'Romance en ambiente escolar/universitario',
        icon: '🎒',
        templates: [
          {
            id: 'high_school_romance',
            name: 'Romance de Secundaria',
            description: 'Escuela secundaria con drama romántico y amistades',
            format: 'chat',
            genreId: 'romance',
            subGenreId: 'romance_school',
            requiredTier: 'free',
            suggestedCharacterCount: 4,
            complexity: 'simple',
            aiPromptTemplate: 'Un mundo de escuela secundaria con {characterCount} estudiantes que experimentan romance, amistad y los desafíos típicos de la adolescencia. Incluye situaciones cotidianas como clases, clubes escolares, y eventos sociales.',
            tags: ['escuela', 'adolescentes', 'comedia', 'slice-of-life'],
            popularity: 0,
          },
          {
            id: 'college_romance',
            name: 'Romance Universitario',
            description: 'Universidad con relaciones más maduras',
            format: 'chat',
            genreId: 'romance',
            subGenreId: 'romance_school',
            requiredTier: 'free',
            suggestedCharacterCount: 4,
            complexity: 'medium',
            aiPromptTemplate: 'Un ambiente universitario con {characterCount} estudiantes explorando relaciones, responsabilidades adultas, y sus pasiones. Incluye vida en dormitorios, proyectos grupales, y eventos sociales universitarios.',
            tags: ['universidad', 'adultos-jóvenes', 'independencia'],
            popularity: 0,
          },
        ],
      },
      {
        id: 'romance_workplace',
        name: 'Romance de Oficina',
        description: 'Relaciones en el ambiente laboral',
        icon: '💼',
        templates: [
          {
            id: 'office_romance',
            name: 'Romance Corporativo',
            description: 'Oficina moderna con relaciones profesionales que cruzan líneas',
            format: 'chat',
            genreId: 'romance',
            subGenreId: 'romance_workplace',
            requiredTier: 'free',
            suggestedCharacterCount: 4,
            complexity: 'medium',
            aiPromptTemplate: 'Una oficina corporativa donde {characterCount} empleados equilibran profesionalismo con atracción romántica. Incluye tensión profesional, conflictos de interés, y dinámicas de poder.',
            tags: ['oficina', 'profesional', 'adultos', 'drama'],
            popularity: 0,
          },
        ],
      },
      {
        id: 'romance_fantasy',
        name: 'Romance Fantástico',
        description: 'Romance en mundos fantásticos',
        icon: '✨',
        templates: [
          {
            id: 'magical_academy_romance',
            name: 'Academia de Magia Romántica',
            description: 'Escuela de magia con romance y aventuras',
            format: 'visual_novel',
            genreId: 'romance',
            subGenreId: 'romance_fantasy',
            requiredTier: 'plus',
            suggestedCharacterCount: 6,
            complexity: 'complex',
            aiPromptTemplate: 'Una academia mágica donde {characterCount} estudiantes con poderes especiales estudian hechicería mientras navegan romance, rivalidades y amenazas místicas. Incluye clases de magia, torneos, y secretos oscuros.',
            tags: ['magia', 'fantasía', 'academia', 'poderes', 'aventura'],
            popularity: 0,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // ACCIÓN / AVENTURA
  // ─────────────────────────────────────────
  {
    id: 'action',
    name: 'Acción',
    description: 'Combates, aventuras y adrenalina',
    icon: '⚔️',
    keywords: ['acción', 'combate', 'pelea', 'batalla', 'aventura', 'guerra'],
    availableFor: ['chat', 'visual_novel'],
    popularity: 9,
    subGenres: [
      {
        id: 'action_military',
        name: 'Militar / Bélico',
        description: 'Operaciones militares y combate táctico',
        icon: '🎖️',
        templates: [
          {
            id: 'military_squad',
            name: 'Escuadrón Militar',
            description: 'Equipo táctico en misiones peligrosas',
            format: 'chat',
            genreId: 'action',
            subGenreId: 'action_military',
            requiredTier: 'free',
            suggestedCharacterCount: 5,
            complexity: 'medium',
            aiPromptTemplate: 'Un escuadrón militar de élite con {characterCount} operadores en misiones de alto riesgo. Incluye combate táctico, camaradería bajo fuego, y decisiones difíciles en el campo de batalla.',
            tags: ['militar', 'táctico', 'combate', 'equipo'],
            popularity: 0,
          },
        ],
      },
      {
        id: 'action_superhero',
        name: 'Superhéroes',
        description: 'Poderes extraordinarios y villanos',
        icon: '🦸',
        templates: [
          {
            id: 'hero_academy',
            name: 'Academia de Héroes',
            description: 'Entrenamiento de futuros superhéroes',
            format: 'chat',
            genreId: 'action',
            subGenreId: 'action_superhero',
            requiredTier: 'free',
            suggestedCharacterCount: 5,
            complexity: 'medium',
            aiPromptTemplate: 'Una academia donde {characterCount} jóvenes con superpoderes aprenden a ser héroes. Incluye entrenamiento, rivalidades, descubrimiento de habilidades, y amenazas emergentes.',
            tags: ['superhéroes', 'poderes', 'entrenamiento', 'escuela'],
            popularity: 0,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // CIENCIA FICCIÓN
  // ─────────────────────────────────────────
  {
    id: 'scifi',
    name: 'Ciencia Ficción',
    description: 'Tecnología futurista, espacio y distopías',
    icon: '🚀',
    keywords: ['ciencia ficción', 'sci-fi', 'futuro', 'espacio', 'tecnología', 'robots', 'aliens'],
    availableFor: ['chat', 'visual_novel'],
    popularity: 8,
    subGenres: [
      {
        id: 'scifi_space',
        name: 'Exploración Espacial',
        description: 'Viajes espaciales y civilizaciones alienígenas',
        icon: '🌌',
        templates: [
          {
            id: 'space_crew',
            name: 'Tripulación Espacial',
            description: 'Nave explorando el espacio profundo',
            format: 'chat',
            genreId: 'scifi',
            subGenreId: 'scifi_space',
            requiredTier: 'free',
            suggestedCharacterCount: 5,
            complexity: 'medium',
            aiPromptTemplate: 'La tripulación de {characterCount} miembros de una nave espacial explorando galaxias desconocidas. Incluye descubrimientos alienígenas, dilemas morales, y la soledad del espacio profundo.',
            tags: ['espacio', 'nave', 'exploración', 'aliens'],
            popularity: 0,
          },
        ],
      },
      {
        id: 'scifi_cyberpunk',
        name: 'Cyberpunk',
        description: 'Futuro distópico con alta tecnología',
        icon: '🌃',
        templates: [
          {
            id: 'neon_city',
            name: 'Ciudad de Neón',
            description: 'Metrópolis cyberpunk con hackers y corporaciones',
            format: 'chat',
            genreId: 'scifi',
            subGenreId: 'scifi_cyberpunk',
            requiredTier: 'free',
            suggestedCharacterCount: 4,
            complexity: 'medium',
            aiPromptTemplate: 'Una ciudad futurista distópica donde {characterCount} individuos navegan entre megacorporaciones, hackers, y el submundo criminal. Incluye tecnología avanzada, implantes cibernéticos, y la lucha por la libertad.',
            tags: ['cyberpunk', 'hackers', 'distopía', 'tecnología'],
            popularity: 0,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // FANTASÍA
  // ─────────────────────────────────────────
  {
    id: 'fantasy',
    name: 'Fantasía',
    description: 'Magia, dragones y mundos místicos',
    icon: '🏰',
    keywords: ['fantasía', 'magia', 'medieval', 'dragones', 'elfos', 'hechicería'],
    availableFor: ['chat', 'visual_novel'],
    popularity: 9,
    subGenres: [
      {
        id: 'fantasy_medieval',
        name: 'Fantasía Medieval',
        description: 'Reinos, caballeros y magia clásica',
        icon: '⚔️',
        templates: [
          {
            id: 'fantasy_tavern',
            name: 'La Taberna del Aventurero',
            description: 'Punto de encuentro de aventureros',
            format: 'chat',
            genreId: 'fantasy',
            subGenreId: 'fantasy_medieval',
            requiredTier: 'free',
            suggestedCharacterCount: 4,
            complexity: 'simple',
            aiPromptTemplate: 'Una taberna en un reino medieval fantástico donde {characterCount} aventureros se encuentran. Incluye misiones, criaturas mágicas, y la formación de un grupo de aventureros.',
            tags: ['medieval', 'aventura', 'taberna', 'grupo'],
            popularity: 0,
          },
          {
            id: 'royal_court',
            name: 'Corte Real',
            description: 'Intriga política en un reino mágico',
            format: 'visual_novel',
            genreId: 'fantasy',
            subGenreId: 'fantasy_medieval',
            requiredTier: 'plus',
            suggestedCharacterCount: 6,
            complexity: 'complex',
            aiPromptTemplate: 'La corte de un reino mágico donde {characterCount} nobles, magos y consejeros compiten por poder e influencia. Incluye intriga política, magia prohibida, y amenazas al trono.',
            tags: ['realeza', 'política', 'intriga', 'corte'],
            popularity: 0,
          },
        ],
      },
      {
        id: 'fantasy_urban',
        name: 'Fantasía Urbana',
        description: 'Magia en el mundo moderno',
        icon: '🌆',
        templates: [
          {
            id: 'hidden_magic',
            name: 'Magia Oculta',
            description: 'Mundo mágico secreto en ciudad moderna',
            format: 'chat',
            genreId: 'fantasy',
            subGenreId: 'fantasy_urban',
            requiredTier: 'free',
            suggestedCharacterCount: 4,
            complexity: 'medium',
            aiPromptTemplate: 'Una ciudad moderna donde {characterCount} individuos descubren un mundo mágico oculto. Incluye sociedades secretas, criaturas místicas disfrazadas, y el equilibrio entre dos mundos.',
            tags: ['urbano', 'moderno', 'secreto', 'magia-oculta'],
            popularity: 0,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // JUEGO DE ROL (RPG)
  // ─────────────────────────────────────────
  {
    id: 'rpg',
    name: 'Juego de Rol',
    description: 'Aventuras estilo RPG con progresión',
    icon: '🎲',
    keywords: ['rpg', 'juego de rol', 'aventura', 'dungeon', 'quest', 'misión'],
    availableFor: ['chat', 'visual_novel'],
    popularity: 8,
    subGenres: [
      {
        id: 'rpg_dungeon',
        name: 'Dungeon Crawler',
        description: 'Exploración de mazmorras',
        icon: '🗝️',
        templates: [
          {
            id: 'dungeon_party',
            name: 'Grupo de Mazmorra',
            description: 'Grupo explorando mazmorras peligrosas',
            format: 'chat',
            genreId: 'rpg',
            subGenreId: 'rpg_dungeon',
            requiredTier: 'free',
            suggestedCharacterCount: 4,
            complexity: 'medium',
            aiPromptTemplate: 'Un grupo de {characterCount} aventureros explorando mazmorras peligrosas. Incluye combates tácticos, trampas, tesoros, y misterios antiguos por descubrir.',
            tags: ['dungeon', 'exploración', 'combate', 'tesoros'],
            popularity: 0,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // MUNDO ABIERTO
  // ─────────────────────────────────────────
  {
    id: 'open_world',
    name: 'Mundo Abierto',
    description: 'Exploración libre sin guión fijo',
    icon: '🌍',
    keywords: ['mundo abierto', 'sandbox', 'libre', 'exploración', 'sandbox'],
    availableFor: ['chat'],
    popularity: 7,
    subGenres: [
      {
        id: 'open_modern',
        name: 'Mundo Moderno',
        description: 'Ciudad o comunidad contemporánea',
        icon: '🏙️',
        templates: [
          {
            id: 'modern_city',
            name: 'Ciudad Moderna',
            description: 'Vida cotidiana en una ciudad contemporánea',
            format: 'chat',
            genreId: 'open_world',
            subGenreId: 'open_modern',
            requiredTier: 'free',
            suggestedCharacterCount: 5,
            complexity: 'simple',
            aiPromptTemplate: 'Una ciudad moderna donde {characterCount} residentes viven sus vidas cotidianas. Incluye trabajo, relaciones, hobbies, y eventos comunitarios en un entorno realista.',
            tags: ['moderno', 'ciudad', 'slice-of-life', 'realista'],
            popularity: 0,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // TERROR / HORROR
  // ─────────────────────────────────────────
  {
    id: 'horror',
    name: 'Terror',
    description: 'Suspenso, miedo y lo sobrenatural',
    icon: '👻',
    keywords: ['terror', 'horror', 'miedo', 'suspenso', 'sobrenatural', 'zombies'],
    availableFor: ['chat', 'visual_novel'],
    popularity: 6,
    subGenres: [
      {
        id: 'horror_survival',
        name: 'Supervivencia',
        description: 'Sobrevivir contra amenazas terroríficas',
        icon: '🧟',
        templates: [
          {
            id: 'zombie_outbreak',
            name: 'Apocalipsis Zombie',
            description: 'Supervivencia en mundo post-apocalíptico',
            format: 'chat',
            genreId: 'horror',
            subGenreId: 'horror_survival',
            requiredTier: 'free',
            suggestedCharacterCount: 4,
            complexity: 'medium',
            aiPromptTemplate: 'Un grupo de {characterCount} supervivientes en un apocalipsis zombie. Incluye escasez de recursos, decisiones morales difíciles, y la constante amenaza de los no-muertos.',
            tags: ['zombies', 'supervivencia', 'apocalipsis', 'post-apocalíptico'],
            popularity: 0,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // MISTERIO / DETECTIVESCO
  // ─────────────────────────────────────────
  {
    id: 'mystery',
    name: 'Misterio',
    description: 'Crímenes, investigaciones y enigmas',
    icon: '🔍',
    keywords: ['misterio', 'detective', 'crimen', 'investigación', 'asesinato', 'noir'],
    availableFor: ['chat', 'visual_novel'],
    popularity: 7,
    subGenres: [
      {
        id: 'mystery_detective',
        name: 'Detectivesco',
        description: 'Investigaciones policiales y de detectives',
        icon: '🕵️',
        templates: [
          {
            id: 'detective_office',
            name: 'Oficina de Detective',
            description: 'Detective privado resolviendo casos',
            format: 'chat',
            genreId: 'mystery',
            subGenreId: 'mystery_detective',
            requiredTier: 'free',
            suggestedCharacterCount: 3,
            complexity: 'medium',
            aiPromptTemplate: 'Una oficina de detective donde {characterCount} personas trabajan resolviendo casos misteriosos. Incluye pistas, interrogatorios, y giros inesperados.',
            tags: ['detective', 'crimen', 'investigación', 'misterio'],
            popularity: 0,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // SLICE OF LIFE
  // ─────────────────────────────────────────
  {
    id: 'slice_of_life',
    name: 'Slice of Life',
    description: 'Vida cotidiana y relaciones personales',
    icon: '☕',
    keywords: ['slice of life', 'cotidiano', 'realista', 'vida diaria', 'casual'],
    availableFor: ['chat'],
    popularity: 8,
    subGenres: [
      {
        id: 'slice_cafe',
        name: 'Café / Restaurante',
        description: 'Ambiente acogedor de café o restaurante',
        icon: '☕',
        templates: [
          {
            id: 'cozy_cafe',
            name: 'Café Acogedor',
            description: 'Café local con clientes regulares',
            format: 'chat',
            genreId: 'slice_of_life',
            subGenreId: 'slice_cafe',
            requiredTier: 'free',
            suggestedCharacterCount: 4,
            complexity: 'simple',
            aiPromptTemplate: 'Un café acogedor donde {characterCount} personas (baristas, clientes regulares) comparten sus vidas y crean conexiones. Incluye conversaciones casuales, historias personales, y momentos cotidianos.',
            tags: ['café', 'casual', 'conversación', 'acogedor'],
            popularity: 0,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // COMEDIA
  // ─────────────────────────────────────────
  {
    id: 'comedy',
    name: 'Comedia',
    description: 'Humor, situaciones divertidas y personajes cómicos',
    icon: '😂',
    keywords: ['comedia', 'humor', 'divertido', 'gracioso', 'parodia'],
    availableFor: ['chat'],
    popularity: 7,
    subGenres: [
      {
        id: 'comedy_sitcom',
        name: 'Sitcom',
        description: 'Comedia situacional estilo serie de TV',
        icon: '📺',
        templates: [
          {
            id: 'friend_group',
            name: 'Grupo de Amigos',
            description: 'Amigos en situaciones cómicas cotidianas',
            format: 'chat',
            genreId: 'comedy',
            subGenreId: 'comedy_sitcom',
            requiredTier: 'free',
            suggestedCharacterCount: 4,
            complexity: 'simple',
            aiPromptTemplate: 'Un grupo de {characterCount} amigos con personalidades únicas en situaciones cómicas cotidianas. Incluye malentendidos, bromas, y la dinámica divertida del grupo.',
            tags: ['amigos', 'comedia', 'casual', 'sitcom'],
            popularity: 0,
          },
        ],
      },
    ],
  },
];

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtiene géneros disponibles según formato y tier del usuario
 */
export function getAvailableGenres(
  format: WorldFormat,
  userTier: UserTier = 'free'
): WorldGenre[] {
  return WORLD_GENRES.filter(genre =>
    genre.availableFor.includes(format)
  ).map(genre => ({
    ...genre,
    subGenres: genre.subGenres.map(subGenre => ({
      ...subGenre,
      templates: subGenre.templates.filter(template =>
        template.format === format &&
        canAccessTemplate(template, userTier)
      ),
    })).filter(subGenre => subGenre.templates.length > 0),
  })).filter(genre => genre.subGenres.length > 0);
}

/**
 * Verifica si un usuario puede acceder a un template
 */
export function canAccessTemplate(
  template: WorldTemplate,
  userTier: UserTier
): boolean {
  const tierOrder: Record<UserTier, number> = {
    free: 0,
    plus: 1,
    ultra: 2,
  };

  return tierOrder[userTier] >= tierOrder[template.requiredTier];
}

/**
 * Busca templates por keywords
 */
export function searchTemplates(
  query: string,
  format: WorldFormat,
  userTier: UserTier = 'free'
): WorldTemplate[] {
  const lowerQuery = query.toLowerCase();
  const results: WorldTemplate[] = [];

  for (const genre of WORLD_GENRES) {
    if (!genre.availableFor.includes(format)) continue;

    // Buscar en keywords del género
    const genreMatches = genre.keywords.some(k => k.includes(lowerQuery)) ||
                        genre.name.toLowerCase().includes(lowerQuery);

    for (const subGenre of genre.subGenres) {
      for (const template of subGenre.templates) {
        if (template.format !== format) continue;
        if (!canAccessTemplate(template, userTier)) continue;

        // Buscar en múltiples campos
        const matches =
          genreMatches ||
          template.name.toLowerCase().includes(lowerQuery) ||
          template.description.toLowerCase().includes(lowerQuery) ||
          template.tags.some(t => t.includes(lowerQuery));

        if (matches) {
          results.push(template);
        }
      }
    }
  }

  return results;
}

/**
 * Obtiene template por ID
 */
export function getTemplateById(templateId: string): WorldTemplate | null {
  for (const genre of WORLD_GENRES) {
    for (const subGenre of genre.subGenres) {
      const template = subGenre.templates.find(t => t.id === templateId);
      if (template) return template;
    }
  }
  return null;
}

/**
 * Obtiene templates populares
 */
export function getPopularTemplates(
  format: WorldFormat,
  userTier: UserTier = 'free',
  limit: number = 10
): WorldTemplate[] {
  const allTemplates: WorldTemplate[] = [];

  for (const genre of WORLD_GENRES) {
    if (!genre.availableFor.includes(format)) continue;

    for (const subGenre of genre.subGenres) {
      for (const template of subGenre.templates) {
        if (template.format === format && canAccessTemplate(template, userTier)) {
          allTemplates.push(template);
        }
      }
    }
  }

  return allTemplates
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Inicializa templates extendidos (lazy loading)
 */
let extendedTemplatesLoaded = false;

export async function loadExtendedTemplates() {
  if (extendedTemplatesLoaded) return;

  try {
    const { ALL_EXTENDED_TEMPLATES } = await import('./templates-extended');

    // Integrar templates extendidos en los géneros existentes
    for (const extTemplate of ALL_EXTENDED_TEMPLATES) {
      const genre = WORLD_GENRES.find(g => g.id === extTemplate.genreId);
      if (!genre) continue;

      const subGenre = genre.subGenres.find(sg => sg.id === extTemplate.subGenreId);
      if (!subGenre) continue;

      // Evitar duplicados
      if (!subGenre.templates.find(t => t.id === extTemplate.id)) {
        subGenre.templates.push(extTemplate);
      }
    }

    extendedTemplatesLoaded = true;
    console.log(`[Templates] Loaded ${ALL_EXTENDED_TEMPLATES.length} extended templates`);
  } catch (error) {
    console.error('[Templates] Failed to load extended templates:', error);
  }
}

/**
 * Obtiene el conteo total de templates por género
 */
export function getGenreTemplateCounts(
  format: WorldFormat,
  userTier: UserTier = 'free'
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const genre of WORLD_GENRES) {
    if (!genre.availableFor.includes(format)) continue;

    let count = 0;
    for (const subGenre of genre.subGenres) {
      count += subGenre.templates.filter(t =>
        t.format === format && canAccessTemplate(t, userTier)
      ).length;
    }

    counts[genre.id] = count;
  }

  return counts;
}
