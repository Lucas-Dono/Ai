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

export interface ImportantPerson {
  id: string;
  name: string;
  relationship: string; // "Padre", "Mejor amigo", "Mentor", etc.
  description: string;
  type: 'family' | 'friend' | 'romantic' | 'rival' | 'mentor' | 'colleague' | 'other';
  closeness: number; // 0-100: qué tan cercana es la relación
  status: 'active' | 'estranged' | 'deceased' | 'distant'; // Estado actual de la relación
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
