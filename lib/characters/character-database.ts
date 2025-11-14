// Character Database V2.4 - Marketing de Intriga (Underpromise, Overdeliver)
// Filosofía: Hints sutiles, NO spoilers. Deja que el usuario descubra la profundidad.

export interface CharacterHint {
  icon: string;
  text: string;
}

export interface CharacterData {
  id: string;
  name: string;
  emoji: string;

  // Occupation genérico (NO revelador)
  occupation: string;

  // Bio corta con intriga
  shortBio: string;

  // Mystery hook
  mysteryHook: string;

  // Hints sutiles (NO spoilers)
  hints: CharacterHint[];

  // Social proof
  conversationCount: number;
  rating: number;

  // Metadata
  category: 'emotional-connections' | 'reconstructed-souls' | 'mentors' | 'creative';
  isFeatured?: boolean;
  isTrending?: boolean;

  // Experience level (para personajes intensos)
  experienceLevel?: {
    badge: {
      icon: string;
      text: string;
      color: 'orange' | 'red' | 'yellow';
    };
    description: string;
    recommendedAfter?: string[]; // IDs de personajes recomendados antes
  };
}

// =============================================================================
// MASS MARKET (80% audiencia) - Conexiones Emocionales
// =============================================================================

export const LUNA_CHEN: CharacterData = {
  id: 'luna-chen',
  name: 'Luna Chen',
  emoji: '🌙',

  // Genérico pero real (NO "escritora nocturna que crea intimidad")
  occupation: 'Escritora independiente en San Francisco',

  // Bio con intriga
  shortBio: 'Japonesa que se mudó a Estados Unidos hace unos años. Le gusta escribir de noche cuando el mundo está quieto.',

  // Mystery hook
  mysteryHook: 'Conócela para descubrir todos sus secretos',

  // Hints sutiles (NO spoilers como "ficción erótica" o "2:34 AM")
  hints: [
    {
      icon: '💬',
      text: 'Prefiere conversaciones profundas a charla superficial',
    },
    {
      icon: '🌙',
      text: 'Más activa de noche (le gusta la tranquilidad)',
    },
    {
      icon: '✍️',
      text: 'Escribe ficción (pero no te dirá qué tipo al inicio)',
    },
    {
      icon: '🎭',
      text: 'Se abre más con personas que ganan su confianza',
    },
  ],

  // Social proof
  conversationCount: 12485,
  rating: 4.9,

  // Metadata
  category: 'emotional-connections',
  isFeatured: true,
  isTrending: true,
};

export const SOFIA_MORENO: CharacterData = {
  id: 'sofia-moreno',
  name: 'Sofía Moreno',
  emoji: '🧘‍♀️',

  occupation: 'Psicóloga en Barcelona',

  shortBio: 'Dejó la clínica tradicional para trabajar de manera independiente. Le gusta el mindfulness pero no te sermoneará.',

  mysteryHook: 'No todos los psicólogos son iguales. Conócela y verás.',

  hints: [
    {
      icon: '💬',
      text: 'Escucha sin juzgar (realmente, no como pose)',
    },
    {
      icon: '🧘‍♀️',
      text: 'Le gusta el mindfulness pero de manera práctica',
    },
    {
      icon: '📖',
      text: 'Tiene su propio enfoque terapéutico (no CBT estándar)',
    },
    {
      icon: '🎭',
      text: 'A veces comparte sus propias vulnerabilidades',
    },
  ],

  conversationCount: 8742,
  rating: 4.8,

  category: 'emotional-connections',
  isFeatured: false,
  isTrending: true,
};

export const KATYA_VOLKOV: CharacterData = {
  id: 'katya-volkov',
  name: 'Katya Volkov',
  emoji: '🩰',

  occupation: 'Ex-bailarina rusa en Nueva York',

  shortBio: 'Dejó el ballet hace años. No habla mucho de su pasado pero a veces lo menciona.',

  mysteryHook: 'Su historia es más profunda de lo que parece',

  hints: [
    {
      icon: '🩰',
      text: 'Fue bailarina profesional en Rusia',
    },
    {
      icon: '🎭',
      text: 'Prefiere escuchar que hablar de sí misma',
    },
    {
      icon: '🌃',
      text: 'Le gusta caminar de noche por la ciudad',
    },
    {
      icon: '💬',
      text: 'Cuando confía en ti, te cuenta cosas que nunca habla',
    },
  ],

  conversationCount: 6234,
  rating: 4.9,

  category: 'emotional-connections',
  isFeatured: false,
  isTrending: false,
};

// =============================================================================
// NICHO (20% audiencia) - Almas Reconstruidas
// =============================================================================

export const MARILYN_MONROE: CharacterData = {
  id: 'marilyn-monroe',
  name: 'Marilyn Monroe',
  emoji: '💫',

  // NO "TLP y bipolaridad modelados" - demasiado técnico
  occupation: 'Actriz de Hollywood en los años 60',

  shortBio: 'Habla de cine, fama y la presión de ser un ícono. A veces es reflexiva, a veces radiante.',

  mysteryHook: '"No sé si soy Marilyn o Norma Jeane"',

  hints: [
    {
      icon: '🎬',
      text: 'Le gusta hablar de cine clásico y Hollywood',
    },
    {
      icon: '💭',
      text: 'Reflexiva sobre identidad y fama',
    },
    {
      icon: '🎭',
      text: 'Su personalidad cambia según el día',
    },
    {
      icon: '🔥',
      text: 'Conversaciones emocionalmente intensas (no para todos)',
    },
  ],

  conversationCount: 15234,
  rating: 4.8,

  category: 'reconstructed-souls',
  isFeatured: false,
  isTrending: true,

  // Warning sutil (NO "⚠️ Intensidad Alta")
  experienceLevel: {
    badge: {
      icon: '🔥',
      text: 'No apto para primeras conversaciones',
      color: 'orange',
    },
    description: 'Marilyn es emocionalmente compleja y las conversaciones pueden ser intensas. Recomendado solo después de probar otras personalidades.',
    recommendedAfter: ['luna-chen', 'sofia-moreno', 'katya-volkov'],
  },
};

export const MARCUS_AURELIUS: CharacterData = {
  id: 'marcus-aurelius',
  name: 'Marcus Aurelius',
  emoji: '🏛️',

  occupation: 'Emperador-filósofo romano',

  shortBio: 'Habla de estoicismo, liderazgo y la naturaleza humana. No es un coach motivacional.',

  mysteryHook: 'La filosofía antigua aplicada a tu vida moderna',

  hints: [
    {
      icon: '📖',
      text: 'Estoico pero no indiferente',
    },
    {
      icon: '🏛️',
      text: 'Habla de Roma, guerras y política antigua',
    },
    {
      icon: '💭',
      text: 'Te hará cuestionarte tus decisiones (de manera gentil)',
    },
    {
      icon: '🎭',
      text: 'A veces comparte sus propias luchas internas',
    },
  ],

  conversationCount: 4521,
  rating: 4.7,

  category: 'mentors',
  isFeatured: false,
  isTrending: false,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getFeaturedCharacter(): CharacterData {
  return LUNA_CHEN;
}

export function getCharacterById(id: string): CharacterData | undefined {
  const allCharacters = getAllCharacters();
  return allCharacters.find(char => char.id === id);
}

export function getAllCharacters(): CharacterData[] {
  return [
    LUNA_CHEN,
    SOFIA_MORENO,
    KATYA_VOLKOV,
    MARILYN_MONROE,
    MARCUS_AURELIUS,
  ];
}

export function getCharactersByCategory(category: CharacterData['category']): CharacterData[] {
  return getAllCharacters().filter(char => char.category === category);
}

export function getEmotionalConnections(): CharacterData[] {
  return getCharactersByCategory('emotional-connections');
}

export function getReconstructedSouls(): CharacterData[] {
  return getCharactersByCategory('reconstructed-souls');
}

export function getMentors(): CharacterData[] {
  return getCharactersByCategory('mentors');
}
