/**
 * TEST SETUP - Mock Configuration
 *
 * Provides mocks for:
 * - Prisma Client
 * - NextAuth
 * - Global fetch
 * - Test data factories
 */

import { vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';

// ============================================
// MOCK PRISMA CLIENT
// ============================================

export const mockPrismaClient = {
  agent: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  message: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  episodicMemory: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  internalState: {
    findUnique: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  personalityCore: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  characterGrowth: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  semanticMemory: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  proceduralMemory: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  relation: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  // Community system
  community: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  communityMember: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  communityPost: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  communityComment: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  postVote: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  commentVote: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  postReport: {
    create: vi.fn(),
  },
  postAward: {
    create: vi.fn(),
  },
  communityEvent: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  // Reputation system
  userReputation: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  userBadge: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  // Marketplace
  marketplaceCharacter: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  characterDownload: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  characterRating: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    aggregate: vi.fn(),
  },
  // Messaging
  directConversation: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  directMessage: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  // Notifications
  notification: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  // Research
  researchProject: {
    count: vi.fn(),
    findFirst: vi.fn(),
  },
  researchContributor: {
    count: vi.fn(),
  },
  marketplaceTheme: {
    count: vi.fn(),
    findFirst: vi.fn(),
  },
  $transaction: vi.fn((callback) => callback(mockPrismaClient)),
} as unknown as PrismaClient;

// Mock @/lib/prisma module
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrismaClient,
}));

// ============================================
// MOCK NEXTAUTH
// ============================================

export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(() => Promise.resolve(mockSession)),
}));

// ============================================
// MOCK VENICE CLIENT (for emotional system)
// ============================================

vi.mock('@/lib/emotional-system/llm/venice', () => ({
  getVeniceClient: vi.fn(() => ({
    generateJSON: vi.fn().mockResolvedValue({}),
    generateText: vi.fn().mockResolvedValue('Mock response'),
  })),
}));

vi.mock('@/lib/emotional-system/llm/hybrid-provider', () => ({
  getHybridLLMProvider: vi.fn(() => ({
    generateJSON: vi.fn().mockResolvedValue({
      emotions: { joy: 0.7, trust: 0.6 },
      moodShift: { valence: 0.5, arousal: 0.4, dominance: 0.6 },
      primaryEmotion: 'joy',
      intensity: 0.7,
    }),
    generateText: vi.fn().mockResolvedValue('Mock response'),
    generateWithSystemPrompt: vi.fn().mockResolvedValue('Mock response from system prompt'),
  })),
}));

// ============================================
// MOCK FETCH GLOBAL
// ============================================

global.fetch = vi.fn();

export const mockFetch = (response: any, options?: { ok?: boolean; status?: number }) => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: options?.ok ?? true,
    status: options?.status ?? 200,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
};

export const mockFetchError = (error: Error) => {
  (global.fetch as any).mockRejectedValueOnce(error);
};

// ============================================
// TEST DATA FACTORIES
// ============================================

export const mockUser = (overrides: Partial<any> = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  location: null,
  ...overrides,
});

export const mockAgent = (overrides: Partial<any> = {}) => ({
  id: 'agent-123',
  userId: 'user-123',
  name: 'Test Agent',
  description: 'A test agent',
  personality: 'friendly and helpful',
  systemPrompt: 'You are a helpful assistant',
  referenceImageUrl: null,
  voiceId: null,
  kind: 'companion',
  isPublic: false,
  nsfwMode: false,
  stagePrompts: null,
  tone: 'casual',
  purpose: 'testing',
  createdAt: new Date(),
  updatedAt: new Date(),
  personalityCore: mockPersonalityCore(),
  internalState: mockInternalState(),
  semanticMemory: null,
  characterGrowth: null,
  behaviorProfiles: [],
  user: mockUser(),
  ...overrides,
});

export const mockPersonalityCore = (overrides: Partial<any> = {}) => {
  const bigFiveDefaults = {
    openness: 70,
    conscientiousness: 60,
    extraversion: 50,
    agreeableness: 80,
    neuroticism: 30,
  };

  // Allow overriding specific bigFive traits
  const bigFive = {
    ...bigFiveDefaults,
    ...(overrides.openness !== undefined && { openness: overrides.openness }),
    ...(overrides.conscientiousness !== undefined && { conscientiousness: overrides.conscientiousness }),
    ...(overrides.extraversion !== undefined && { extraversion: overrides.extraversion }),
    ...(overrides.agreeableness !== undefined && { agreeableness: overrides.agreeableness }),
    ...(overrides.neuroticism !== undefined && { neuroticism: overrides.neuroticism }),
  };

  return {
    id: 'personality-123',
    agentId: 'agent-123',
    ...bigFiveDefaults, // Keep flat properties for Prisma compatibility
    bigFive, // Add bigFive object for emotional system
    coreValues: [{ value: 'honesty', weight: 0.9, description: 'Being truthful' }],
    moralSchemas: [],
    backstory: null,
    baselineEmotions: {
      joy: 0.5,
      trust: 0.6,
      fear: 0.2,
      surprise: 0.3,
      sadness: 0.1,
      disgust: 0.1,
      anger: 0.1,
      anticipation: 0.4,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

export const mockInternalState = (overrides: Partial<any> = {}) => ({
  id: 'state-123',
  agentId: 'agent-123',
  currentEmotions: {
    joy: 0.5,
    trust: 0.6,
    fear: 0.2,
    surprise: 0.3,
    sadness: 0.1,
    disgust: 0.1,
    anger: 0.1,
    anticipation: 0.4,
  },
  moodValence: 0.5,
  moodArousal: 0.5,
  moodDominance: 0.5,
  emotionDecayRate: 0.1,
  emotionInertia: 0.3,
  needConnection: 0.5,
  needAutonomy: 0.5,
  needCompetence: 0.5,
  needNovelty: 0.5,
  activeGoals: [],
  conversationBuffer: [],
  lastUpdated: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockMessage = (overrides: Partial<any> = {}) => ({
  id: 'message-123',
  agentId: 'agent-123',
  userId: 'user-123',
  role: 'user',
  content: 'Hello!',
  metadata: {},
  createdAt: new Date(),
  ...overrides,
});

export const mockEpisodicMemory = (overrides: Partial<any> = {}) => ({
  id: 'memory-123',
  agentId: 'agent-123',
  event: 'User shared something important',
  userEmotion: 'joy',
  characterEmotion: 'empathy',
  emotionalValence: 0.7,
  importance: 0.8,
  decayFactor: 1.0,
  embedding: null,
  metadata: {},
  createdAt: new Date(),
  ...overrides,
});

export const mockRelation = (overrides: Partial<any> = {}) => ({
  id: 'relation-123',
  subjectId: 'agent-123',
  targetId: 'user-123',
  targetType: 'user',
  trust: 0.5,
  affinity: 0.5,
  respect: 0.5,
  privateState: { love: 0, curiosity: 0 },
  visibleState: { trust: 0.5, affinity: 0.5, respect: 0.5 },
  stage: 'stranger',
  totalInteractions: 0,
  lastInteractionAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockAppraisal = (overrides: Partial<any> = {}) => ({
  desirability: 0.5,
  desirabilityForUser: 0.5,
  praiseworthiness: 0.5,
  appealingness: 0.5,
  likelihood: 0.5,
  relevanceToGoals: 0.5,
  valueAlignment: 0.5,
  novelty: 0.5,
  urgency: 0.5,
  socialAppropriateness: 0.9,
  ...overrides,
});

export const mockEmotionState = (overrides: Partial<any> = {}) => ({
  joy: 0.5,
  trust: 0.6,
  fear: 0.2,
  surprise: 0.3,
  sadness: 0.1,
  disgust: 0.1,
  anger: 0.1,
  anticipation: 0.4,
  ...overrides,
});

// ============================================
// HELPER FUNCTIONS
// ============================================

export const resetAllMocks = () => {
  vi.clearAllMocks();
  (global.fetch as any).mockClear();

  // Reset Prisma mocks
  Object.values(mockPrismaClient).forEach((model: any) => {
    if (typeof model === 'object') {
      Object.values(model).forEach((method: any) => {
        if (typeof method?.mockClear === 'function') {
          method.mockClear();
        }
      });
    }
  });
};

export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
