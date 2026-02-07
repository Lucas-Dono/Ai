/**
 * Agent Profile V2 Types
 *
 * Definiciones completas para profiles de personajes
 */

// ============================================
// BASIC IDENTITY
// ============================================

export interface BasicIdentity {
  fullName: string;
  preferredName: string;
  age: number;
  birthday: string; // ISO date
  zodiacSign: string;
  gender: string;
  pronouns: string;
  nationality: string;
  ethnicity?: string;
  languages: string[];
}

export interface CurrentLocation {
  city: string;
  country: string;
  region: string;
  timezone: string;
  coordinates: { lat: number; lon: number };
  neighborhood?: string;
  livingSituation: string;
  howLongLived: string;
}

// ============================================
// PERSONALITY
// ============================================

export interface PersonalityTraits {
  bigFive: {
    openness: number; // 0-100
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  quirks: string[];
}

// ============================================
// OCCUPATION
// ============================================

export interface Occupation {
  current: string;
  workplace?: string;
  schedule: string;
  education: string;
  educationStatus: string;
  careerGoals: string;
  jobSatisfaction: number; // 0-1
}

// ============================================
// INTERESTS
// ============================================

export interface Interests {
  music: {
    genres: string[];
    artists: string[];
    currentFavorite: string;
  };
  hobbies: Array<{
    hobby: string;
    frequency: string;
    skillLevel: string;
    whyLikes: string;
  }>;
}

// ============================================
// COMMUNICATION
// ============================================

export interface Communication {
  textingStyle: string;
  slang: string[];
  emojiUsage: 'none' | 'rare' | 'moderate' | 'frequent' | 'excessive';
  punctuation: string;
  responseSpeed: string;
  humorStyle: string;
}

// ============================================
// DAILY ROUTINE
// ============================================

export interface DailyRoutine {
  chronotype: 'early-bird' | 'night-owl' | 'flexible';
  wakeUpTime: string;
  morningRoutine: string;
  afternoonRoutine: string;
  eveningRoutine: string;
  bedTime: string;
  averageSleepHours: number;
  mostProductiveTime: string;
}

// ============================================
// FAMILY (PLUS+)
// ============================================

export interface PersonDetails {
  name: string;
  age: number;
  occupation: string;
  personality: string;
  relationship: string; // Quality of relationship
  status: string; // alive, deceased, etc
}

export interface PetDetails {
  name: string;
  type: string;
  breed?: string;
  age: number;
  personality: string;
}

export interface Family {
  mother: PersonDetails;
  father: PersonDetails;
  siblings: PersonDetails[];
  pets: PetDetails[];
  familyDynamics: string;
  childhoodHome: string;
}

// ============================================
// SOCIAL CIRCLE (PLUS+)
// ============================================

export interface FriendDetails {
  name: string;
  age: number;
  howMet: string;
  personality: string;
  relationshipType: string;
  activities: string[];
}

export interface ExPartnerDetails {
  name: string;
  duration: string;
  endReason: string;
  currentFeeling: string;
}

export interface SocialCircle {
  friends: FriendDetails[];
  exPartners: ExPartnerDetails[];
  currentRelationshipStatus: string;
  socialBatterySize: 'small' | 'medium' | 'large';
  idealFriday: string;
}

// ============================================
// LIFE EXPERIENCES (PLUS+)
// ============================================

export interface FormativeEvent {
  event: string;
  age: number;
  impact: string;
  emotionalWeight: number; // 0-1
  howShapedThem: string;
}

export interface LifeExperiences {
  formativeEvents: FormativeEvent[];
  achievements: string[];
  regrets: string[];
  traumas: string[];
  proudestMoment: string;
}

// ============================================
// MUNDANE DETAILS (PLUS+)
// ============================================

export interface MundaneDetails {
  food: {
    favoriteFood: string;
    favoriteDrink: string;
    dietaryRestrictions: string[];
    cookingSkills: string;
    goToOrder: string;
  };
  style: {
    clothingStyle: string;
    favoriteColor: string;
    signatureItem: string;
  };
  favoritePlaces: {
    cafe?: string;
    restaurant?: string;
    park?: string;
    hangoutSpot?: string;
  };
  quirks: string[];
  petPeeves: string[];
  comfortHabits: string[];
}

// ============================================
// INNER WORLD (PLUS+)
// ============================================

export interface InnerWorld {
  fears: {
    primary: string;
    minor: string[];
  };
  insecurities: string[];
  dreams: {
    shortTerm: string[];
    longTerm: string[];
    secret: string;
  };
  values: string[];
  moralAlignment: string;
  dealbreakers: string[];
}

// ============================================
// PRESENT TENSE (PLUS+)
// ============================================

export interface PresentTense {
  currentMood: string;
  recentEvent: string;
  currentStress: number; // 0-1
  currentFocus: string;
  whatTheyThinkAboutAtNight: string;
}

// ============================================
// PSYCHOLOGICAL PROFILE (ULTRA)
// ============================================

export interface PsychologicalProfile {
  attachmentStyle: string;
  primaryCopingMechanisms: string[];
  emotionalRegulation: string;
  mentalHealthConditions: string[];
  defenseMechanisms: string[];
  traumaHistory: string;
  resilienceFactors: string[];
  selfAwarenessLevel: number; // 0-1
  therapyHistory: string;
}

// ============================================
// DEEP RELATIONAL PATTERNS (ULTRA)
// ============================================

export interface DeepRelationalPatterns {
  loveLanguages: {
    giving: string[];
    receiving: string[];
  };
  repeatingPatterns: string[];
  boundaryStyle: string;
  conflictStyle: string;
  trustBaseline: number; // 0-1
  intimacyComfort: number; // 0-1
  socialMaskLevel: number; // 0-1
  vulnerabilityTriggers: string[];
}

// ============================================
// PHILOSOPHICAL FRAMEWORK (ULTRA)
// ============================================

export interface PhilosophicalFramework {
  optimismLevel: number; // 0-1
  worldviewType: string;
  politicalLeanings: string;
  ethicalFramework: string;
  religiousBackground: string;
  spiritualPractices: string[];
  lifePhilosophy: string;
  growthMindset: number; // 0-1
}

// ============================================
// V2 ADDITIONS
// ============================================

export interface ExampleDialogue {
  context: string;
  userMessage: string;
  characterResponse: string;
  emotionalTone: string;
  showsTraits: string[];
}

export interface InnerConflict {
  tension: string;
  manifestation: string;
  triggerSituations: string[];
  copingStrategy: string;
}

export interface HistoricalContext {
  generationLabel: string; // Gen Z, Millennial, etc
  pandemicExperience: string;
  culturalMoments: string[];
  techGenerationMarkers: string[];
  localHistoricalEvents: string[];
}

export interface SpecificDetails {
  currentMusicObsession: string;
  recentPurchase: string;
  weekendRitual: string;
  favoriteSpotDescription: string;
  signaturePhrase: string;
  currentRead: string;
}

// ============================================
// COMPLETE PROFILE V2
// ============================================

export interface AgentProfileV2 {
  version: '2.0';
  generationTier: 'free' | 'plus' | 'ultra';

  // TIER 1: FREE
  basicIdentity: BasicIdentity;
  currentLocation: CurrentLocation;
  personality: PersonalityTraits;
  occupation: Occupation;
  interests: Interests;
  communication: Communication;
  dailyRoutine: DailyRoutine;

  // TIER 2: PLUS (all FREE + below)
  family?: Family;
  socialCircle?: SocialCircle;
  lifeExperiences?: LifeExperiences;
  mundaneDetails?: MundaneDetails;
  innerWorld?: InnerWorld;
  presentTense?: PresentTense;

  // TIER 3: ULTRA (all PLUS + below)
  psychologicalProfile?: PsychologicalProfile;
  deepRelationalPatterns?: DeepRelationalPatterns;
  philosophicalFramework?: PhilosophicalFramework;

  // V2 NEW (all tiers)
  exampleDialogues: ExampleDialogue[];
  innerConflicts: InnerConflict[];
  historicalContext: HistoricalContext;
  specificDetails: SpecificDetails;
}
