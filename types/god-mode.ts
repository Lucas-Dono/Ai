/**
 * God Mode Types
 *
 * Types for the "God Mode" feature that allows advanced customization
 * of private characters, including initial relationships, shared memories,
 * character feelings, and NSFW settings.
 */

// ============================================================================
// RELATIONSHIP TIERS
// ============================================================================

export type InitialRelationshipTier =
  | 'stranger'
  | 'acquaintance'
  | 'friend'
  | 'close_friend'
  | 'dating'
  | 'partner'
  | 'married'
  | 'ex_feelings'
  | 'fwb'
  | 'secret_affair';

export interface RelationshipTierOption {
  id: InitialRelationshipTier;
  label: string;
  labelEs: string;
  icon: string;
  description: string;
  descriptionEs: string;
  initialAffinity: number; // 0-100
  nsfw?: boolean;
}

export const RELATIONSHIP_TIERS: RelationshipTierOption[] = [
  {
    id: 'stranger',
    label: 'Just Met',
    labelEs: 'Recién conocidos',
    icon: '🆕',
    description: 'You just met, everything is new',
    descriptionEs: 'Acaban de conocerse, todo es nuevo',
    initialAffinity: 0,
  },
  {
    id: 'acquaintance',
    label: 'Acquaintances',
    labelEs: 'Conocidos',
    icon: '👋',
    description: 'You know each other casually',
    descriptionEs: 'Se conocen de manera casual',
    initialAffinity: 15,
  },
  {
    id: 'friend',
    label: 'Friends',
    labelEs: 'Amigos',
    icon: '🤝',
    description: 'Good friends who hang out',
    descriptionEs: 'Buenos amigos que pasan tiempo juntos',
    initialAffinity: 35,
  },
  {
    id: 'close_friend',
    label: 'Close Friends',
    labelEs: 'Amigos cercanos',
    icon: '💬',
    description: 'Best friends who share everything',
    descriptionEs: 'Mejores amigos que comparten todo',
    initialAffinity: 55,
  },
  {
    id: 'dating',
    label: 'Dating',
    labelEs: 'Saliendo',
    icon: '💕',
    description: 'In the early stages of romance',
    descriptionEs: 'En las primeras etapas del romance',
    initialAffinity: 65,
  },
  {
    id: 'partner',
    label: 'Partners',
    labelEs: 'Pareja',
    icon: '❤️',
    description: 'In a committed relationship',
    descriptionEs: 'En una relación comprometida',
    initialAffinity: 80,
  },
  {
    id: 'married',
    label: 'Married',
    labelEs: 'Casados',
    icon: '💍',
    description: 'Married for years, deep bond',
    descriptionEs: 'Casados hace años, vínculo profundo',
    initialAffinity: 90,
  },
  {
    id: 'ex_feelings',
    label: 'Ex with Feelings',
    labelEs: 'Ex con sentimientos',
    icon: '💔',
    description: 'Broke up but still have feelings',
    descriptionEs: 'Terminaron pero aún sienten algo',
    initialAffinity: 45,
  },
  {
    id: 'fwb',
    label: 'Friends with Benefits',
    labelEs: 'Amigos con beneficios',
    icon: '🔥',
    description: 'Physical intimacy without commitment',
    descriptionEs: 'Intimidad física sin compromiso',
    initialAffinity: 50,
    nsfw: true,
  },
  {
    id: 'secret_affair',
    label: 'Secret Affair',
    labelEs: 'Affair secreto',
    icon: '🤫',
    description: 'A forbidden, hidden relationship',
    descriptionEs: 'Una relación prohibida y oculta',
    initialAffinity: 60,
    nsfw: true,
  },
];

// ============================================================================
// SHARED MEMORIES
// ============================================================================

export type MemoryType =
  | 'first_meeting'
  | 'first_date'
  | 'inside_joke'
  | 'conflict_resolved'
  | 'special_place'
  | 'intimate_moment'
  | 'shared_adventure'
  | 'vulnerable_moment'
  | 'custom';

export interface SharedMemory {
  id: string;
  type: MemoryType;
  description: string;
  emotionalWeight: number; // 0-1, how significant this memory is
  isPositive: boolean;
}

export interface MemoryTemplate {
  type: MemoryType;
  label: string;
  labelEs: string;
  placeholder: string;
  placeholderEs: string;
  icon: string;
  nsfw?: boolean;
}

export const MEMORY_TEMPLATES: MemoryTemplate[] = [
  {
    type: 'first_meeting',
    label: 'How We Met',
    labelEs: 'Cómo nos conocimos',
    placeholder: 'We met when...',
    placeholderEs: 'Nos conocimos cuando...',
    icon: '✨',
  },
  {
    type: 'first_date',
    label: 'First Date',
    labelEs: 'Primera cita',
    placeholder: 'Our first date was...',
    placeholderEs: 'Nuestra primera cita fue...',
    icon: '🌹',
  },
  {
    type: 'inside_joke',
    label: 'Inside Joke',
    labelEs: 'Chiste interno',
    placeholder: 'We always laugh about...',
    placeholderEs: 'Siempre nos reímos de...',
    icon: '😂',
  },
  {
    type: 'conflict_resolved',
    label: 'Conflict We Overcame',
    labelEs: 'Conflicto que superamos',
    placeholder: 'We had a fight about... but we resolved it by...',
    placeholderEs: 'Peleamos por... pero lo resolvimos...',
    icon: '🤝',
  },
  {
    type: 'special_place',
    label: 'Our Special Place',
    labelEs: 'Nuestro lugar especial',
    placeholder: 'Our special place is...',
    placeholderEs: 'Nuestro lugar especial es...',
    icon: '📍',
  },
  {
    type: 'intimate_moment',
    label: 'Intimate Moment',
    labelEs: 'Momento íntimo',
    placeholder: 'A special intimate moment we shared...',
    placeholderEs: 'Un momento íntimo especial que compartimos...',
    icon: '💋',
    nsfw: true,
  },
  {
    type: 'shared_adventure',
    label: 'Shared Adventure',
    labelEs: 'Aventura compartida',
    placeholder: 'That time we went on an adventure...',
    placeholderEs: 'Esa vez que fuimos de aventura...',
    icon: '🌍',
  },
  {
    type: 'vulnerable_moment',
    label: 'Vulnerable Moment',
    labelEs: 'Momento vulnerable',
    placeholder: 'They opened up to me about...',
    placeholderEs: 'Se abrió conmigo sobre...',
    icon: '🥺',
  },
  {
    type: 'custom',
    label: 'Custom Memory',
    labelEs: 'Memoria personalizada',
    placeholder: 'Describe your shared memory...',
    placeholderEs: 'Describe tu memoria compartida...',
    icon: '✏️',
  },
];

// ============================================================================
// CHARACTER FEELINGS
// ============================================================================

export type FeelingType =
  | 'neutral'
  | 'curious'
  | 'interested'
  | 'crushing'
  | 'in_love'
  | 'obsessed'
  | 'protective'
  | 'devoted'
  | 'playful_rival'
  | 'tsundere';

export interface FeelingOption {
  id: FeelingType;
  label: string;
  labelEs: string;
  description: string;
  descriptionEs: string;
  icon: string;
  intensity: number; // 0-1
}

export const FEELING_OPTIONS: FeelingOption[] = [
  {
    id: 'neutral',
    label: 'Neutral',
    labelEs: 'Neutral',
    description: 'No particular feelings yet',
    descriptionEs: 'Sin sentimientos particulares aún',
    icon: '😐',
    intensity: 0,
  },
  {
    id: 'curious',
    label: 'Curious',
    labelEs: 'Curioso/a',
    description: 'Intrigued and wants to know more',
    descriptionEs: 'Intrigado/a y quiere saber más',
    icon: '🤔',
    intensity: 0.2,
  },
  {
    id: 'interested',
    label: 'Interested',
    labelEs: 'Interesado/a',
    description: 'Clearly interested in you',
    descriptionEs: 'Claramente interesado/a en ti',
    icon: '👀',
    intensity: 0.4,
  },
  {
    id: 'crushing',
    label: 'Crushing (In Denial)',
    labelEs: 'Le gustas (lo niega)',
    description: 'Has feelings but tries to hide them',
    descriptionEs: 'Tiene sentimientos pero intenta ocultarlos',
    icon: '🙈',
    intensity: 0.6,
  },
  {
    id: 'in_love',
    label: 'In Love',
    labelEs: 'Enamorado/a',
    description: 'Already deeply in love with you',
    descriptionEs: 'Ya está profundamente enamorado/a de ti',
    icon: '😍',
    intensity: 0.85,
  },
  {
    id: 'obsessed',
    label: 'Obsessed',
    labelEs: 'Obsesionado/a',
    description: 'Intensely fixated, jealous tendencies',
    descriptionEs: 'Fijación intensa, tendencias celosas',
    icon: '🖤',
    intensity: 1.0,
  },
  {
    id: 'protective',
    label: 'Protective',
    labelEs: 'Protector/a',
    description: 'Devoted to keeping you safe',
    descriptionEs: 'Dedicado/a a mantenerte a salvo',
    icon: '🛡️',
    intensity: 0.75,
  },
  {
    id: 'devoted',
    label: 'Completely Devoted',
    labelEs: 'Completamente devoto/a',
    description: 'Would do anything for you',
    descriptionEs: 'Haría cualquier cosa por ti',
    icon: '💝',
    intensity: 0.95,
  },
  {
    id: 'playful_rival',
    label: 'Playful Rival',
    labelEs: 'Rival juguetón/a',
    description: 'Competitive banter with underlying attraction',
    descriptionEs: 'Competencia juguetona con atracción subyacente',
    icon: '😏',
    intensity: 0.5,
  },
  {
    id: 'tsundere',
    label: 'Tsundere',
    labelEs: 'Tsundere',
    description: 'Cold outside, warm inside',
    descriptionEs: 'Frío/a por fuera, cálido/a por dentro',
    icon: '😤',
    intensity: 0.65,
  },
];

// ============================================================================
// POWER DYNAMICS
// ============================================================================

export type PowerDynamic =
  | 'balanced'
  | 'devoted_to_you'
  | 'you_pursue'
  | 'hard_to_get'
  | 'push_pull'
  | 'dominant'
  | 'submissive';

export interface PowerDynamicOption {
  id: PowerDynamic;
  label: string;
  labelEs: string;
  description: string;
  descriptionEs: string;
  icon: string;
  nsfw?: boolean;
}

export const POWER_DYNAMICS: PowerDynamicOption[] = [
  {
    id: 'balanced',
    label: 'Balanced',
    labelEs: 'Equilibrado',
    description: 'Equal partners in the relationship',
    descriptionEs: 'Compañeros iguales en la relación',
    icon: '⚖️',
  },
  {
    id: 'devoted_to_you',
    label: 'Devoted to You',
    labelEs: 'Devoto/a a ti',
    description: 'Would do anything for you',
    descriptionEs: 'Haría cualquier cosa por ti',
    icon: '🥺',
  },
  {
    id: 'you_pursue',
    label: 'You Pursue Them',
    labelEs: 'Tú lo/la persigues',
    description: 'They play hard to get',
    descriptionEs: 'Se hace el/la difícil',
    icon: '🏃',
  },
  {
    id: 'hard_to_get',
    label: 'Hard to Get',
    labelEs: 'Difícil de conquistar',
    description: 'They need convincing',
    descriptionEs: 'Necesita ser convencido/a',
    icon: '🏔️',
  },
  {
    id: 'push_pull',
    label: 'Push and Pull',
    labelEs: 'Tira y afloja',
    description: 'Hot and cold dynamic',
    descriptionEs: 'Dinámica de caliente y frío',
    icon: '🔄',
  },
  {
    id: 'dominant',
    label: 'They Lead',
    labelEs: 'Ellos lideran',
    description: 'They take charge in the relationship',
    descriptionEs: 'Toman el control en la relación',
    icon: '👑',
    nsfw: true,
  },
  {
    id: 'submissive',
    label: 'You Lead',
    labelEs: 'Tú lideras',
    description: 'They follow your lead',
    descriptionEs: 'Siguen tu liderazgo',
    icon: '🎀',
    nsfw: true,
  },
];

// ============================================================================
// STARTING SCENARIOS
// ============================================================================

export type ScenarioId =
  | 'none'
  | 'trapped_elevator'
  | 'fake_dating'
  | 'snowed_in'
  | 'reunion'
  | 'roommates'
  | 'one_night'
  | 'work_trip'
  | 'blind_date'
  | 'online_finally_meeting'
  | 'forbidden'
  | 'bodyguard'
  | 'custom';

export interface StartingScenario {
  id: ScenarioId;
  label: string;
  labelEs: string;
  description: string;
  descriptionEs: string;
  icon: string;
  viral?: boolean;
  nsfw?: boolean;
  setupPrompt: string; // Prompt to inject into context
}

export const STARTING_SCENARIOS: StartingScenario[] = [
  {
    id: 'none',
    label: 'No Scenario',
    labelEs: 'Sin escenario',
    description: 'Start naturally, no specific situation',
    descriptionEs: 'Empezar naturalmente, sin situación específica',
    icon: '💬',
    setupPrompt: '',
  },
  {
    id: 'trapped_elevator',
    label: 'Trapped in Elevator',
    labelEs: 'Atrapados en el ascensor',
    description: 'Stuck together, no signal, tension rising...',
    descriptionEs: 'Atrapados juntos, sin señal, la tensión sube...',
    icon: '🛗',
    viral: true,
    setupPrompt: 'The scenario begins with both of you trapped in an elevator. The power is out, there is no cell signal, and it could be hours before help arrives. The space is small and intimate, forcing close proximity.',
  },
  {
    id: 'fake_dating',
    label: 'Fake Dating',
    labelEs: 'Fingir ser pareja',
    description: 'Pretending to date, feelings become real',
    descriptionEs: 'Fingiendo salir, los sentimientos se vuelven reales',
    icon: '💑',
    viral: true,
    setupPrompt: 'You have agreed to pretend to be in a relationship (for a family event, to make an ex jealous, or another reason). As you play the part, the line between acting and reality begins to blur.',
  },
  {
    id: 'snowed_in',
    label: 'Snowed In',
    labelEs: 'Atrapados por la tormenta',
    description: 'One cabin, one storm, one bed...',
    descriptionEs: 'Una cabaña, una tormenta, una cama...',
    icon: '❄️',
    viral: true,
    setupPrompt: 'A sudden snowstorm has trapped you both in a remote cabin. The heating is minimal, there is limited food, and you will need to stay close to keep warm. Outside, the storm rages on.',
  },
  {
    id: 'reunion',
    label: 'Reunion After Years',
    labelEs: 'Reencuentro años después',
    description: 'Meeting someone from your past',
    descriptionEs: 'Encontrarse con alguien del pasado',
    icon: '🔄',
    setupPrompt: 'You are unexpectedly reuniting after years apart. Old feelings resurface, mixed with curiosity about how much you have both changed.',
  },
  {
    id: 'roommates',
    label: 'Roommates with Tension',
    labelEs: 'Roommates con tensión',
    description: 'Living together with undeniable chemistry',
    descriptionEs: 'Viviendo juntos con química innegable',
    icon: '🏠',
    viral: true,
    setupPrompt: 'You are roommates sharing an apartment. The chemistry between you is undeniable, but neither has made a move. Every shared moment is charged with unspoken tension.',
  },
  {
    id: 'one_night',
    label: '"Just One Night"',
    labelEs: '"Solo una noche"',
    description: 'That keeps happening again and again...',
    descriptionEs: 'Que se repite... y se repite...',
    icon: '🌙',
    nsfw: true,
    setupPrompt: 'What was supposed to be a one-time thing keeps happening. Neither of you can stay away, but you have not defined what this is.',
  },
  {
    id: 'work_trip',
    label: 'Work Trip',
    labelEs: 'Viaje de trabajo',
    description: 'Colleagues on a business trip, one hotel room',
    descriptionEs: 'Colegas en viaje de negocios, una habitación',
    icon: '✈️',
    setupPrompt: 'You are on a work trip together. Due to a booking error, you are sharing a hotel room. Professional boundaries are being tested.',
  },
  {
    id: 'blind_date',
    label: 'Blind Date',
    labelEs: 'Cita a ciegas',
    description: 'Set up by friends, first impressions matter',
    descriptionEs: 'Organizada por amigos, las primeras impresiones importan',
    icon: '🎯',
    setupPrompt: 'Your friends set you up on a blind date. You are meeting for the first time, both nervous but intrigued by what they have heard about each other.',
  },
  {
    id: 'online_finally_meeting',
    label: 'Online Friends Meet',
    labelEs: 'Amigos online se conocen',
    description: 'Finally meeting your online friend IRL',
    descriptionEs: 'Por fin conociendo a tu amigo online en persona',
    icon: '💻',
    setupPrompt: 'You have been close online friends for a long time, sharing everything. Now you are finally meeting in person for the first time. Will the connection translate to real life?',
  },
  {
    id: 'forbidden',
    label: 'Forbidden',
    labelEs: 'Prohibido',
    description: "You shouldn't, but you can't help it",
    descriptionEs: 'No deberían, pero no pueden evitarlo',
    icon: '🚫',
    nsfw: true,
    setupPrompt: 'This relationship is forbidden for some reason (social status, rival families, workplace policy, etc.). The danger only makes it more exciting.',
  },
  {
    id: 'bodyguard',
    label: 'Protector',
    labelEs: 'Protector/Guardaespaldas',
    description: 'They are assigned to protect you',
    descriptionEs: 'Asignado/a para protegerte',
    icon: '🛡️',
    setupPrompt: 'They have been assigned as your protector/bodyguard. Professional boundaries exist, but the close proximity and danger create an intense bond.',
  },
  {
    id: 'custom',
    label: 'Custom Scenario',
    labelEs: 'Escenario personalizado',
    description: 'Describe your own starting situation',
    descriptionEs: 'Describe tu propia situación inicial',
    icon: '✏️',
    setupPrompt: '',
  },
];

// ============================================================================
// NSFW SETTINGS
// ============================================================================

export type NSFWLevel =
  | 'sfw'
  | 'romantic'
  | 'suggestive'
  | 'explicit'
  | 'unrestricted';

export interface NSFWLevelOption {
  id: NSFWLevel;
  label: string;
  labelEs: string;
  description: string;
  descriptionEs: string;
  icon: string;
  requiresPrivate: boolean;
}

export const NSFW_LEVELS: NSFWLevelOption[] = [
  {
    id: 'sfw',
    label: 'Safe for Work',
    labelEs: 'Para todo público',
    description: 'No adult content',
    descriptionEs: 'Sin contenido adulto',
    icon: '😇',
    requiresPrivate: false,
  },
  {
    id: 'romantic',
    label: 'Romantic',
    labelEs: 'Romántico intenso',
    description: 'Kissing, tension, fade to black',
    descriptionEs: 'Besos, tensión, fade to black',
    icon: '💋',
    requiresPrivate: false,
  },
  {
    id: 'suggestive',
    label: 'Suggestive',
    labelEs: 'Sugestivo',
    description: 'Implied scenes, innuendo',
    descriptionEs: 'Escenas implícitas, insinuaciones',
    icon: '🔥',
    requiresPrivate: true,
  },
  {
    id: 'explicit',
    label: 'Explicit',
    labelEs: 'Explícito',
    description: 'Detailed adult content',
    descriptionEs: 'Contenido adulto detallado',
    icon: '🌶️',
    requiresPrivate: true,
  },
  {
    id: 'unrestricted',
    label: 'Unrestricted',
    labelEs: 'Sin restricciones',
    description: 'No content limits',
    descriptionEs: 'Sin límites de contenido',
    icon: '⛓️',
    requiresPrivate: true,
  },
];

// ============================================================================
// GOD MODE CONFIG (Main Export)
// ============================================================================

export interface GodModeConfig {
  enabled: boolean;
  visibility: 'public' | 'private';

  // Relationship settings
  initialRelationship: InitialRelationshipTier;
  sharedMemories: SharedMemory[];

  // Character feelings
  characterFeelings: FeelingType;
  feelingIntensity: number; // 0-1, overrides default if set

  // Power dynamics
  powerDynamic: PowerDynamic;

  // Starting scenario
  scenario: ScenarioId;
  customScenario?: string; // If scenario === 'custom'

  // NSFW settings
  nsfwLevel: NSFWLevel;

  // Advanced (optional)
  firstMessageFrom?: 'user' | 'character';
  characterKnowsUser?: boolean; // Does character have pre-existing knowledge of user?
}

export const DEFAULT_GOD_MODE_CONFIG: GodModeConfig = {
  enabled: false,
  visibility: 'private',
  initialRelationship: 'stranger',
  sharedMemories: [],
  characterFeelings: 'neutral',
  feelingIntensity: 0,
  powerDynamic: 'balanced',
  scenario: 'none',
  nsfwLevel: 'sfw',
  firstMessageFrom: 'user',
  characterKnowsUser: false,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getRelationshipTierById(id: InitialRelationshipTier): RelationshipTierOption | undefined {
  return RELATIONSHIP_TIERS.find(tier => tier.id === id);
}

export function getFeelingById(id: FeelingType): FeelingOption | undefined {
  return FEELING_OPTIONS.find(feeling => feeling.id === id);
}

export function getScenarioById(id: ScenarioId): StartingScenario | undefined {
  return STARTING_SCENARIOS.find(scenario => scenario.id === id);
}

export function getNSFWLevelById(id: NSFWLevel): NSFWLevelOption | undefined {
  return NSFW_LEVELS.find(level => level.id === id);
}

export function requiresPrivateMode(config: Partial<GodModeConfig>): boolean {
  // Check if any selected option requires private mode
  const tier = config.initialRelationship ? getRelationshipTierById(config.initialRelationship) : null;
  const scenario = config.scenario ? getScenarioById(config.scenario) : null;
  const nsfwLevel = config.nsfwLevel ? getNSFWLevelById(config.nsfwLevel) : null;

  return (
    (tier?.nsfw ?? false) ||
    (scenario?.nsfw ?? false) ||
    (nsfwLevel?.requiresPrivate ?? false)
  );
}

export function isConfigValid(config: GodModeConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // If NSFW content is selected but visibility is public
  if (requiresPrivateMode(config) && config.visibility === 'public') {
    errors.push('Selected options require private visibility');
  }

  // Custom scenario needs description
  if (config.scenario === 'custom' && !config.customScenario?.trim()) {
    errors.push('Custom scenario requires a description');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
