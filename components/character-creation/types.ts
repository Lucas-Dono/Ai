export interface CharacterDraft {
  // Identity (Required)
  name: string;
  age: number | undefined;
  gender: 'male' | 'female' | 'non-binary' | undefined;
  origin: string;
  generalDescription: string; // Descripción general del personaje (prompt maestro)
  physicalDescription: string; // Solo apariencia física/visual (para avatar)
  avatarUrl: string | null;

  // Work (Required)
  occupation: string;
  skills: Skill[]; // Skills con niveles de proficiencia
  achievements: string[];

  // Personality (Optional)
  bigFive: {
    openness: number; // 0-100
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  coreValues: string[];
  fears: string[];
  cognitivePrompt: string; // Descripción del pensamiento y comportamiento

  // Moral Alignment (Optional) - Sistema D&D 9 alineamientos
  moralAlignment: {
    lawfulness: number; // 0 (Chaotic) - 50 (Neutral) - 100 (Lawful)
    morality: number; // 0 (Evil) - 50 (Neutral) - 100 (Good)
  };

  // Personality Conflicts (Optional) - Contradicciones internas y variaciones situacionales
  personalityConflicts: PersonalityConflicts;

  // Personality Evolution (Optional) - Cómo ha cambiado la personalidad con el tiempo
  personalityEvolution?: PersonalityEvolution;

  // Relationships (Optional)
  importantPeople: ImportantPerson[];
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'complicated' | undefined;

  // History (Optional)
  importantEvents: HistoryEvent[];
  traumas: string[];
  personalAchievements: string[];
}

export interface Skill {
  name: string;
  level: number; // 0-100: 0-20 Novice, 21-40 Beginner, 41-60 Intermediate, 61-80 Advanced, 81-100 Expert
}

// Internal Contradictions - Lo que hace al personaje humano y complejo
export interface InternalContradiction {
  id: string;
  trait: string; // "Altamente organizado en el trabajo"
  butAlso: string; // "Caótico absoluto en vida personal"
  trigger?: string; // "Necesidad de control externo vs libertad interna"
  manifestation: string; // "Escritorio impecable, apartamento hecho un desastre"
}

// Variación situacional - Personalidad cambia según contexto
export interface SituationalVariation {
  context: string; // "En el trabajo", "Con familia", "Con desconocidos"
  personalityShift: {
    extraversion?: number; // Override del Big Five base
    conscientiousness?: number;
    agreeableness?: number;
    openness?: number;
    neuroticism?: number;
  };
  description: string; // "Profesional y carismático, muy diferente a su yo privado"
}

// Contenedor de conflictos de personalidad
export interface PersonalityConflicts {
  internalContradictions: InternalContradiction[];
  situationalVariations: SituationalVariation[];
}

// Snapshot de personalidad en un momento del tiempo
export interface PersonalitySnapshot {
  id: string;
  age: number;
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  moment: string; // Ej: "Bachiller - Pre-trauma", "Post-accidente", "Actualidad"
  descriptor: string; // Descripción corta del estado mental
  trigger?: string; // Evento o razón del cambio (opcional para el primero)
}

// Evolución de personalidad a través del tiempo
export interface PersonalityEvolution {
  snapshots: PersonalitySnapshot[]; // Ordenados cronológicamente
  currentTrajectory?: string; // Ej: "Recuperación ascendente", "Estable", "Declive"
}

export interface ImportantPerson {
  id: string;
  name: string;
  relationship: string; // "Padre", "Mejor amigo", "Mentor", etc.
  description: string;
  type: 'family' | 'friend' | 'romantic' | 'rival' | 'mentor' | 'colleague' | 'other';
  closeness: number; // 0-100: qué tan cercana es la relación
  status: 'active' | 'estranged' | 'deceased' | 'distant'; // Estado actual de la relación

  // Influencia en el personaje
  influenceOn?: {
    values: string[]; // Valores que esta persona influyó/inculcó
    fears: string[]; // Miedos que esta persona causó/generó
    skills: string[]; // Habilidades que enseñó o inspiró
    personalityImpact?: string; // Descripción de cómo moldeó la personalidad
  };

  // Historia compartida
  sharedHistory?: HistoryEvent[]; // Eventos importantes en común

  // Dinámica actual
  currentDynamic?: string; // Ej: "Hablan 2 veces al mes, relación distante pero cordial"

  // Conflicto/Tensión (opcional)
  conflict?: {
    active: boolean;
    description: string; // Ej: "Discrepancia sobre valores religiosos"
    intensity: number; // 0-100
  };
}

export interface HistoryEvent {
  id: string;
  year: number;
  title: string;
  description: string;
}

export interface SectionProps {
  data: CharacterDraft;
  onChange: (updates: Partial<CharacterDraft>) => void;
  isGenerating: boolean;
  onGenerate: (generating: boolean) => void;
}
