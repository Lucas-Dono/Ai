/**
 * Mapeo de componentes Minecraft para cada personaje
 * Basado en los 15 estilos probados del showcase
 *
 * Este archivo define qué componentes usar para cada personaje
 * según su hairStyle, género y clothingStyle
 */

// Mapeo de hairStyle genérico a componentes específicos probados
export const HAIR_STYLE_TO_COMPONENTS: Record<string, {
  hairFront?: string;
  hairBody?: string;
  hairBack?: string;
  headBase?: string;
  notes: string;
}> = {
  // Cortos
  'short': {
    hairFront: 'hair_short_01_pixie',
    notes: 'Pixie cut - versátil para hombres y mujeres',
  },
  'short_male': {
    hairFront: 'hair_short_06_undercut',
    notes: 'Undercut - más masculino',
  },
  'short_female': {
    hairFront: 'hair_short_02_bob',
    notes: 'Bob cut - más femenino',
  },
  'buzz': {
    hairFront: 'hair_short_03_buzz',
    headBase: 'head_buzz_cut',
    notes: 'Rapado completo',
  },
  'caesar': {
    headBase: 'head_caesar_13',
    notes: 'Pelo pintado en capa base, sin overlay',
  },

  // Medios
  'medium': {
    hairFront: 'hair_medium_01_lob',
    notes: 'Lob - long bob',
  },
  'shag': {
    hairFront: 'hair_medium_03_shag',
    notes: 'Shag - look bohemio con capas',
  },

  // Largos
  'long': {
    hairFront: 'hair_long_02_wavy',
    hairBody: 'hair_long_body_02_wavy',
    notes: 'Largo ondulado - versátil',
  },
  'long_straight': {
    hairFront: 'hair_long_straight_07',
    hairBody: 'hair_body_long_07',
    notes: 'Largo liso - extraído de backup',
  },
  'long_black': {
    hairFront: 'hair_long_black_14',
    notes: 'Largo negro gótico',
  },

  // Rizados
  'curly': {
    hairFront: 'hair_curly_red_09',
    hairBody: 'hair_body_curly_09',
    notes: 'Rizado - colores originales del backup',
  },

  // Recogidos
  'ponytail': {
    hairBack: 'hair_updo_01_high_ponytail',
    notes: 'Coleta alta',
  },
  'bun': {
    hairFront: 'hair_messy_bun_12',
    notes: 'Moño desprolijo',
  },

  // Especiales
  'bald': {
    headBase: 'head_base_01',
    notes: 'Sin pelo - usar head base estándar',
  },
};

// Mapeo de clothingStyle a componentes de ropa
export const CLOTHING_STYLE_TO_COMPONENTS: Record<string, {
  shirt?: string;
  tShirt?: string;
  jacket?: string;
  pants?: string;
  shoes?: string;
  notes: string;
}> = {
  'casual': {
    tShirt: 't_shirt_01',
    pants: 'pants_01',
    shoes: 'shoes_01',
    notes: 'Look casual diario',
  },
  'formal': {
    shirt: 'shirt_01',
    pants: 'pants_01',
    shoes: 'shoes_02',
    notes: 'Look formal de oficina',
  },
  'athletic': {
    tShirt: 't_shirt_02',
    pants: 'pants_01',
    shoes: 'shoes_01',
    notes: 'Look deportivo',
  },
  'fantasy': {
    shirt: 'outfit_wavy_sleeves_01',
    pants: 'pants_01',
    shoes: 'shoes_01',
    notes: 'Look fantástico/medieval ligero',
  },
  'medieval': {
    shirt: 'shirt_01',
    pants: 'pants_01',
    shoes: 'boots_01',
    notes: 'Look medieval',
  },
};

// Componentes base por género
export const GENDER_BASE_COMPONENTS: Record<string, {
  headBase?: string;
  eyes: string;
  mouth: string;
  torso: string;
  arms: string;
  legs: string;
}> = {
  'male': {
    headBase: 'head_base_01',
    eyes: 'eyes_01',
    mouth: 'mouth_02',
    torso: 'torso_athletic_01',
    arms: 'arms_classic_01',
    legs: 'legs_average_01',
  },
  'female': {
    headBase: 'head_female_01',
    eyes: 'eyes_female_01',
    mouth: 'mouth_empty',
    torso: 'torso_slim_01',
    arms: 'arms_slim_01',
    legs: 'legs_average_01',
  },
};

// Tipo para el mapeo completo de un personaje
export interface CharacterComponentMapping {
  characterName: string;
  components: {
    headBase?: string;
    eyes: string;
    mouth: string;
    torso: string;
    arms: string;
    legs: string;
    hairFront?: string;
    hairBody?: string;
    hairBack?: string;
    hairTop?: string;
    shirt?: string;
    tShirt?: string;
    jacket?: string;
    pants?: string;
    shoes?: string;
    glasses?: string;
    hat?: string;
  };
  notes: string;
}

/**
 * Genera el mapeo de componentes para un personaje basado en sus traits
 */
export function generateComponentMapping(traits: {
  characterName: string;
  gender: string;
  hairStyle: string;
  clothingStyle: string;
  hasGlasses?: boolean;
  hasHat?: boolean;
}): CharacterComponentMapping {
  const { characterName, gender, hairStyle, clothingStyle, hasGlasses, hasHat } = traits;

  // Base por género
  const genderBase = GENDER_BASE_COMPONENTS[gender] || GENDER_BASE_COMPONENTS['male'];

  // Determinar estilo de pelo específico
  let hairKey = hairStyle;
  if (hairStyle === 'short') {
    hairKey = gender === 'female' ? 'short_female' : 'short_male';
  }

  const hairComponents = HAIR_STYLE_TO_COMPONENTS[hairKey] || HAIR_STYLE_TO_COMPONENTS['short'];
  const clothingComponents = CLOTHING_STYLE_TO_COMPONENTS[clothingStyle] || CLOTHING_STYLE_TO_COMPONENTS['casual'];

  return {
    characterName,
    components: {
      headBase: hairComponents.headBase || genderBase.headBase,
      eyes: genderBase.eyes,
      mouth: genderBase.mouth,
      torso: genderBase.torso,
      arms: genderBase.arms,
      legs: genderBase.legs,
      hairFront: hairComponents.hairFront,
      hairBody: hairComponents.hairBody,
      hairBack: hairComponents.hairBack,
      shirt: clothingComponents.shirt,
      tShirt: clothingComponents.tShirt,
      jacket: clothingComponents.jacket,
      pants: clothingComponents.pants,
      shoes: clothingComponents.shoes,
      glasses: hasGlasses ? 'glasses_01' : undefined,
      hat: hasHat ? 'hat_01' : undefined,
    },
    notes: `${hairComponents.notes} | ${clothingComponents.notes}`,
  };
}

// Mapeos específicos para personajes históricos que necesitan ajustes especiales
export const SPECIAL_CHARACTER_OVERRIDES: Record<string, Partial<CharacterComponentMapping['components']>> = {
  // Einstein - pelo rizado blanco icónico
  'albert-einstein': {
    hairFront: 'hair_curly_red_09', // Usamos curly, se recolorea a blanco
    hairBody: 'hair_body_curly_09',
  },

  // Marilyn Monroe - rubio ondulado icónico
  'marilyn-monroe': {
    hairFront: 'hair_medium_01_lob', // Lob rubio
  },

  // Frida Kahlo - pelo largo oscuro con flores
  'frida-kahlo': {
    hairFront: 'hair_long_black_14',
  },

  // Leonardo Da Vinci - pelo largo canoso
  'leonardo-da-vinci': {
    hairFront: 'hair_long_straight_07',
    hairBody: 'hair_body_long_07',
  },

  // Mozart - pelo blanco con coleta
  'wolfgang-amadeus-mozart': {
    hairBack: 'hair_updo_01_high_ponytail',
  },

  // Beethoven - pelo rizado oscuro icónico
  'ludwig-van-beethoven': {
    hairFront: 'hair_curly_red_09',
    hairBody: 'hair_body_curly_09',
  },

  // Sócrates - calvo
  'socrates': {
    headBase: 'head_base_01',
    hairFront: undefined,
  },

  // Buda - calvo
  'buda-siddhartha-gautama': {
    headBase: 'head_base_01',
    hairFront: undefined,
  },

  // Mark Twain - pelo blanco rizado
  'mark-twain': {
    hairFront: 'hair_curly_red_09',
    hairBody: 'hair_body_curly_09',
  },

  // Van Gogh - pelo corto pelirrojo
  'vincent-van-gogh': {
    hairFront: 'hair_short_06_undercut',
  },

  // Oscar Wilde - pelo largo elegante
  'oscar-wilde': {
    hairFront: 'hair_long_straight_07',
    hairBody: 'hair_body_long_07',
  },

  // Virginia Woolf - pelo corto/bob
  'virginia-woolf': {
    hairFront: 'hair_short_02_bob',
  },

  // Cleopatra - pelo largo negro
  'cleopatra-vii': {
    hairFront: 'hair_long_black_14',
  },

  // Juana de Arco - pelo corto
  'juana-de-arco': {
    hairFront: 'hair_short_01_pixie',
  },

  // Confucio - pelo largo canoso con sombrero
  'confucio': {
    hairFront: 'hair_long_straight_07',
    hairBody: 'hair_body_long_07',
    hat: 'hat_01',
  },

  // Sun Tzu - pelo largo
  'sun-tzu': {
    hairFront: 'hair_long_straight_07',
    hairBody: 'hair_body_long_07',
  },
};
