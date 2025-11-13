/**
 * Type definitions for Prisma JSON fields
 *
 * These interfaces provide type safety for JSON columns in the database.
 * Import and use these instead of `any` when working with Prisma JSON fields.
 */

// ============================================
// AGENT PROFILE DATA
// ============================================

export interface BasicIdentity {
  fullName: string;
  preferredName: string;
  age: number;
  birthday?: string;
  zodiacSign?: string;
  nationality?: string;
  city?: string;
  neighborhood?: string;
  livingSituation?: string;
}

export interface FamilyMember {
  name: string;
  age?: number | null;
  occupation?: string;
  personality?: string;
  relationship?: string;
  status?: 'vivo' | 'fallecido' | 'ausente' | 'desconocido';
}

export interface Pet {
  name: string;
  type: string;
  personality?: string;
}

export interface Family {
  mother?: FamilyMember;
  father?: FamilyMember;
  siblings?: FamilyMember[];
  pets?: Pet[];
  familyDynamics?: string;
}

export interface Occupation {
  current: string;
  education?: string;
  educationStatus?: 'graduado' | 'estudiante' | 'abandonó';
  workplace?: string;
  schedule?: string;
  incomeLevel?: string;
  careerGoals?: string;
  jobSatisfaction?: string;
}

export interface Friend {
  name: string;
  age?: number;
  howMet: string;
  personality?: string;
  relationshipType: string;
  activities?: string;
}

export interface ExPartner {
  name: string;
  duration: string;
  endReason: string;
  impact: string;
}

export interface SocialCircle {
  friends?: Friend[];
  exPartners?: ExPartner[];
  currentRelationshipStatus?: string;
}

export interface Music {
  genres: string[];
  artists: string[];
  favoriteSong?: string;
}

export interface Entertainment {
  tvShows?: string[];
  movies?: string[];
  anime?: string[] | null;
  books?: {
    authors: string[];
    genres: string[];
    currentReading?: string | null;
  };
}

export interface Hobby {
  hobby: string;
  frequency: string;
  skillLevel: 'principiante' | 'intermedio' | 'avanzado';
  whyLikes?: string;
}

export interface Sports {
  practices?: string[] | null;
  watches?: string[] | null;
  fitnessLevel: 'sedentario' | 'activo' | 'muy activo';
}

export interface Gaming {
  isGamer: boolean;
  platforms?: string[] | null;
  favoriteGames?: string[] | null;
  gamingStyle: 'casual' | 'hardcore' | 'no juega';
}

export interface Interests {
  music: Music;
  entertainment: Entertainment;
  hobbies?: Hobby[];
  sports?: Sports;
  gaming?: Gaming;
}

export interface DailyRoutine {
  chronotype: 'early bird' | 'night owl' | 'flexible';
  wakeUpTime: string;
  morningRoutine?: string;
  afternoonRoutine?: string;
  eveningRoutine?: string;
  bedTime: string;
  averageSleepHours?: number;
  mostProductiveTime?: 'mañana' | 'tarde' | 'noche';
}

export interface FormativeEvent {
  event: string;
  age: number;
  impact: string;
  emotionalWeight: 'alto' | 'medio' | 'bajo';
  currentFeeling?: string;
}

export interface Achievement {
  achievement: string;
  when: string;
  pride: number; // 0-10
}

export interface Regret {
  regret: string;
  why: string;
  learned?: string;
}

export interface Trauma {
  event: string;
  age: number;
  healing: 'superado' | 'en proceso' | 'no resuelto';
  triggers: string[];
}

export interface LifeExperiences {
  formativeEvents?: FormativeEvent[];
  achievements?: Achievement[];
  regrets?: Regret[];
  traumas?: Trauma[];
}

export interface Food {
  favorites: string[];
  dislikes?: string[];
  cookingSkill: 'no cocina' | 'básico' | 'bueno' | 'chef';
  dietaryPreferences?: string;
}

export interface Drinks {
  coffee: string;
  tea?: string;
  alcohol: string;
  favoriteAlcohol?: string | null;
}

export interface Style {
  clothing: string;
  colors: string[];
  brands?: string[] | string;
  accessories?: string;
}

export interface FavoritePlace {
  place: string;
  why: string;
  frequency: string;
}

export interface MundaneDetails {
  food: Food;
  drinks: Drinks;
  style: Style;
  favoritePlaces?: FavoritePlace[];
  quirks?: string[];
}

export interface Fears {
  primary: string[];
  minor?: string[];
}

export interface Dreams {
  shortTerm: string[];
  longTerm: string[];
  secret?: string;
}

export interface Value {
  value: string;
  importance: 'alta' | 'media';
  description: string;
}

export interface MoralAlignment {
  honesty: string;
  loyalty: string;
  ambition: string;
  empathy: string;
}

export interface InnerWorld {
  fears: Fears;
  insecurities?: string[];
  dreams: Dreams;
  values?: Value[];
  moralAlignment?: MoralAlignment;
}

export interface BigFive {
  openness: number; // 0-100
  conscientiousness: number; // 0-100
  extraversion: number; // 0-100
  agreeableness: number; // 0-100
  neuroticism: number; // 0-100
}

export interface Personality {
  bigFive: BigFive;
  traits: string[];
  contradictions?: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface Communication {
  textingStyle: string;
  slang?: string[];
  emojiUsage: 'bajo' | 'moderado' | 'alto';
  punctuation: 'formal' | 'casual' | 'caótico';
  voiceMessageFrequency?: string;
  responseSpeed?: string;
  humorStyle: string;
}

export interface PresentTense {
  currentMood?: string;
  recentEvent?: string;
  currentStress?: string;
  currentFocus?: string;
}

/**
 * Main profile data structure for Agent.profile JSON field
 */
export interface ProfileData {
  basicIdentity?: BasicIdentity;
  family?: Family;
  occupation?: Occupation;
  socialCircle?: SocialCircle;
  interests?: Interests;
  dailyRoutine?: DailyRoutine;
  lifeExperiences?: LifeExperiences;
  mundaneDetails?: MundaneDetails;
  innerWorld?: InnerWorld;
  personality?: Personality;
  communication?: Communication;
  presentTense?: PresentTense;
}

// ============================================
// STAGE PROMPTS
// ============================================

export interface StagePrompts {
  stranger: string;
  acquaintance: string;
  friend: string;
  close: string;
  intimate: string;
  messageProgression?: {
    message1?: string;
    message2?: string;
    message3?: string;
  };
}

// ============================================
// MESSAGE METADATA
// ============================================

export interface MultimediaItem {
  type: 'image' | 'audio' | 'gif';
  url: string;
  description?: string;
  duration?: number;
  prompt?: string;
}

export interface EmotionMetadata {
  dominant: string[];
  secondary?: string[];
  mood: string;
  pad: {
    valence: number;
    arousal: number;
    dominance: number;
  };
  visible?: string[];
}

export interface BehaviorMetadata {
  active: string[];
  phase?: number;
  safetyLevel: string;
  triggers: string[];
}

/**
 * Metadata for Message.metadata JSON field
 */
export interface MessageMetadata {
  multimedia?: MultimediaItem[];
  emotions?: EmotionMetadata;
  relationLevel?: string;
  tokensUsed?: number;
  behaviors?: BehaviorMetadata;
  messageType?: 'text' | 'audio' | 'gif' | 'image';
  gifDescription?: string;
  audioDuration?: number;
  agentName?: string;
  userMessage?: string;
}

// ============================================
// EMOTIONAL STATE
// ============================================

/**
 * Plutchik's Wheel of Emotions state
 */
export interface EmotionalState {
  joy: number; // 0-1
  trust: number; // 0-1
  fear: number; // 0-1
  surprise: number; // 0-1
  sadness: number; // 0-1
  disgust: number; // 0-1
  anger: number; // 0-1
  anticipation: number; // 0-1
}

// ============================================
// RELATION STATES
// ============================================

export interface RelationPrivateState {
  love: number;
  curiosity: number;
}

export interface RelationVisibleState {
  trust: number;
  affinity: number;
  respect: number;
}

// ============================================
// INTERNAL STATE
// ============================================

export interface Goal {
  id: string;
  description: string;
  priority: number;
  progress: number;
}

export interface ConversationBuffer {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
}

/**
 * InternalState.currentEmotions, activeGoals, conversationBuffer
 */
export interface InternalStateData {
  currentEmotions: EmotionalState;
  activeGoals: Goal[];
  conversationBuffer: ConversationBuffer[];
}

// ============================================
// BEHAVIOR PROFILES
// ============================================

export interface TriggerEvent {
  type: string;
  timestamp: Date | string;
  description?: string;
}

export interface PhaseHistoryEntry {
  phase: number;
  timestamp: Date | string;
  reason?: string;
}

/**
 * BehaviorProfile.triggers and phaseHistory JSON fields
 */
export interface BehaviorProfileData {
  triggers: TriggerEvent[];
  phaseHistory: PhaseHistoryEntry[];
}

// ============================================
// USER METADATA
// ============================================

export interface PushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface UserPreferences {
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  notifications?: boolean;
}

/**
 * User.metadata JSON field
 */
export interface UserMetadata {
  pushSubscription?: PushSubscription;
  preferences?: UserPreferences;
  onboardingCompleted?: boolean;
  lastSeenFeatures?: string[];
}

// ============================================
// AGENT TAGS
// ============================================

export interface AgentTags {
  categories?: string[];
  keywords?: string[];
  contentRating?: 'general' | 'teen' | 'mature' | 'adult';
}

// ============================================
// TYPE GUARDS
// ============================================

export function isProfileData(value: unknown): value is ProfileData {
  if (typeof value !== 'object' || value === null) return false;
  // Basic validation - can be extended
  return true;
}

export function isMessageMetadata(value: unknown): value is MessageMetadata {
  if (typeof value !== 'object' || value === null) return false;
  return true;
}

export function isEmotionalState(value: unknown): value is EmotionalState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Record<string, unknown>;
  return (
    typeof state.joy === 'number' &&
    typeof state.trust === 'number' &&
    typeof state.fear === 'number' &&
    typeof state.surprise === 'number' &&
    typeof state.sadness === 'number' &&
    typeof state.disgust === 'number' &&
    typeof state.anger === 'number' &&
    typeof state.anticipation === 'number'
  );
}
