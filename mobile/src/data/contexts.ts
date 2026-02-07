/**
 * Context Taxonomy Data
 *
 * Defines character contexts (Historical Figure, Cultural Icon, Fictional, Real Person, Original)
 * Context represents WHO/WHAT the character is, not the relationship type
 */

// ============================================================================
// TYPES
// ============================================================================

export type ContextCategoryId =
  | 'historical'
  | 'cultural-icon'
  | 'fictional'
  | 'real-person'
  | 'original';

export interface ContextSubcategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface ContextCategory {
  id: ContextCategoryId;
  name: string;
  icon: string;
  color: string;
  description: string;
  subcategories: ContextSubcategory[];
}

// ============================================================================
// CONTEXTS DATA
// ============================================================================

export const CONTEXTS: ContextCategory[] = [
  {
    id: 'historical',
    name: 'Figura Histórica',
    icon: '🏛️',
    color: '#8b5cf6',
    description: 'Personas reales de importancia histórica (pre-2000)',
    subcategories: [
      {
        id: 'scientist',
        name: 'Científico/Inventor',
        icon: '🔬',
        description: 'Einstein, Tesla, Curie, Darwin',
      },
      {
        id: 'artist',
        name: 'Artista/Performer',
        icon: '🎨',
        description: 'Marilyn Monroe, Frida Kahlo, Mozart, Van Gogh',
      },
      {
        id: 'leader',
        name: 'Líder/Activista',
        icon: '⚖️',
        description: 'Gandhi, MLK, Mandela, Churchill',
      },
      {
        id: 'writer',
        name: 'Escritor/Filósofo',
        icon: '📝',
        description: 'Shakespeare, Nietzsche, Virginia Woolf',
      },
      {
        id: 'explorer',
        name: 'Explorador/Aventurero',
        icon: '🧭',
        description: 'Amelia Earhart, Shackleton, Marco Polo',
      },
      {
        id: 'other',
        name: 'Otro',
        icon: '🌟',
        description: 'Otra figura histórica',
      },
    ],
  },
  {
    id: 'cultural-icon',
    name: 'Ícono Cultural',
    icon: '⭐',
    color: '#f59e0b',
    description: 'Celebridades y figuras públicas contemporáneas',
    subcategories: [
      {
        id: 'celebrity',
        name: 'Celebridad/Actor',
        icon: '🎬',
        description: 'Actores y actrices contemporáneos',
      },
      {
        id: 'musician',
        name: 'Músico/Artista',
        icon: '🎵',
        description: 'Cantantes, rappers, compositores',
      },
      {
        id: 'influencer',
        name: 'Influencer/Creador',
        icon: '📱',
        description: 'YouTubers, streamers, creadores de contenido',
      },
      {
        id: 'athlete',
        name: 'Atleta',
        icon: '🏆',
        description: 'Deportistas profesionales',
      },
      {
        id: 'public-figure',
        name: 'Figura Pública',
        icon: '🎙️',
        description: 'Políticos, CEOs, activistas actuales',
      },
      {
        id: 'other',
        name: 'Otro',
        icon: '✨',
        description: 'Otra figura pública',
      },
    ],
  },
  {
    id: 'fictional',
    name: 'Personaje Ficticio',
    icon: '📖',
    color: '#06b6d4',
    description: 'Personajes de medios de ficción',
    subcategories: [
      {
        id: 'literature',
        name: 'Literatura',
        icon: '📚',
        description: 'Novelas, cuentos, poesía',
      },
      {
        id: 'movies',
        name: 'Películas',
        icon: '🎬',
        description: 'Personajes de cine',
      },
      {
        id: 'tv',
        name: 'Series de TV',
        icon: '📺',
        description: 'Personajes de televisión',
      },
      {
        id: 'anime',
        name: 'Anime/Manga',
        icon: '🎌',
        description: 'Animación y cómics japoneses',
      },
      {
        id: 'games',
        name: 'Videojuegos',
        icon: '🎮',
        description: 'Personajes de juegos',
      },
      {
        id: 'comics',
        name: 'Comics/Novelas Gráficas',
        icon: '💭',
        description: 'Superhéroes, cómics',
      },
      {
        id: 'theater',
        name: 'Teatro',
        icon: '🎭',
        description: 'Personajes teatrales',
      },
      {
        id: 'other',
        name: 'Otro',
        icon: '📜',
        description: 'Otro medio ficticio',
      },
    ],
  },
  {
    id: 'real-person',
    name: 'Persona Real',
    icon: '👤',
    color: '#10b981',
    description: 'Personas comunes o conocidos (no famosos)',
    subcategories: [
      {
        id: 'friend',
        name: 'Amigo/Conocido',
        icon: '🤝',
        description: 'Alguien que conocés',
      },
      {
        id: 'crush',
        name: 'Crush/Interés Romántico',
        icon: '💕',
        description: 'Alguien que te atrae',
      },
      {
        id: 'family',
        name: 'Familiar',
        icon: '👨‍👩‍👧‍👦',
        description: 'Miembro de tu familia',
      },
      {
        id: 'colleague',
        name: 'Colega/Compañero',
        icon: '💼',
        description: 'Compañero de trabajo o estudio',
      },
      {
        id: 'stranger',
        name: 'Desconocido',
        icon: '🚶',
        description: 'Alguien que conociste brevemente',
      },
      {
        id: 'ideal',
        name: 'Persona Ideal',
        icon: '✨',
        description: 'Tu persona ideal imaginada',
      },
    ],
  },
  {
    id: 'original',
    name: 'Creación Original',
    icon: '✨',
    color: '#ec4899',
    description: 'Personajes completamente originales creados por vos',
    subcategories: [
      {
        id: 'fantasy',
        name: 'Fantasy',
        icon: '🐉',
        description: 'Medieval, magia, dragones',
      },
      {
        id: 'sci-fi',
        name: 'Sci-Fi',
        icon: '🚀',
        description: 'Futurista, espacio, cyberpunk',
      },
      {
        id: 'modern',
        name: 'Contemporáneo',
        icon: '🌆',
        description: 'Mundo actual, realista',
      },
      {
        id: 'historical-setting',
        name: 'Época Histórica',
        icon: '⏳',
        description: 'Ambientación en otra época',
      },
      {
        id: 'supernatural',
        name: 'Supernatural',
        icon: '🦇',
        description: 'Vampiros, hombres lobo, paranormal',
      },
      {
        id: 'abstract',
        name: 'Abstracto/Conceptual',
        icon: '🌌',
        description: 'Concepto, idea, abstracto',
      },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getContextById(id: ContextCategoryId): ContextCategory | undefined {
  return CONTEXTS.find((c) => c.id === id);
}

export function getSubcategoriesByContextId(contextId: ContextCategoryId): ContextSubcategory[] {
  const context = getContextById(contextId);
  return context?.subcategories || [];
}

export function getSubcategoryById(
  contextId: ContextCategoryId,
  subcategoryId: string
): ContextSubcategory | undefined {
  const subcategories = getSubcategoriesByContextId(contextId);
  return subcategories.find((s) => s.id === subcategoryId);
}

export function getContextLabel(
  category: ContextCategoryId,
  subcategory?: string,
  occupation?: string,
  era?: string
): string {
  const context = getContextById(category);
  if (!context) return 'Desconocido';

  const parts: string[] = [context.name];

  // Add subcategory or occupation
  if (subcategory && subcategory !== 'other') {
    const sub = getSubcategoryById(category, subcategory);
    if (sub) {
      parts.push(sub.name);
    }
  } else if (occupation) {
    parts.push(occupation);
  }

  // Add era if available
  if (era && era !== 'Various' && era !== 'Contemporary') {
    parts.push(`(${era})`);
  }

  return parts.join(' - ');
}
