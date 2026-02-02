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
  skills: string[];
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

  // Relationships (Optional)
  importantPeople: ImportantPerson[];
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'complicated' | undefined;

  // History (Optional)
  importantEvents: HistoryEvent[];
  traumas: string[];
  personalAchievements: string[];
}

export interface ImportantPerson {
  id: string;
  name: string;
  relationship: string; // "Padre", "Mejor amigo", "Mentor", etc.
  description: string;
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
