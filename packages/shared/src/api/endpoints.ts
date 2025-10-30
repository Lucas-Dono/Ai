/**
 * Definiciones de endpoints del API
 */

export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },

  // Agentes
  AGENTS: {
    LIST: '/api/agents',
    CREATE: '/api/agents',
    GET: (id: string) => `/api/agents/${id}`,
    UPDATE: (id: string) => `/api/agents/${id}`,
    DELETE: (id: string) => `/api/agents/${id}`,
    RATING: (id: string) => `/api/agents/${id}/rating`,
    REVIEWS: (id: string) => `/api/agents/${id}/reviews`,
  },

  // Mundos
  WORLDS: {
    LIST: '/api/worlds',
    CREATE: '/api/worlds',
    GET: (id: string) => `/api/worlds/${id}`,
    UPDATE: (id: string) => `/api/worlds/${id}`,
    DELETE: (id: string) => `/api/worlds/${id}`,
    MESSAGE: (id: string) => `/api/worlds/${id}/message`,
    START: (id: string) => `/api/worlds/${id}/start`,
    STOP: (id: string) => `/api/worlds/${id}/stop`,
    PAUSE: (id: string) => `/api/worlds/${id}/pause`,
    CLONE: (id: string) => `/api/worlds/${id}/clone`,
    AGENTS: (id: string) => `/api/worlds/${id}/agents`,
    TRENDING: '/api/worlds/trending',
    PREDEFINED: '/api/worlds/predefined',
  },

  // Mensajes
  MESSAGES: {
    LIST: (worldId: string) => `/api/messages?worldId=${worldId}`,
    GET: (id: string) => `/api/messages/${id}`,
    DELETE: (id: string) => `/api/messages/${id}`,
  },

  // Recomendaciones
  RECOMMENDATIONS: {
    GET: '/api/recommendations',
    TRENDING_AGENTS: '/api/recommendations/trending-agents',
    SIMILAR_AGENTS: (agentId: string) => `/api/recommendations/similar-agents/${agentId}`,
  },

  // Usuario
  USER: {
    PROFILE: '/api/user/profile',
    ACCOUNT: '/api/user/account',
    UPDATE_PROFILE: '/api/user/profile',
    UPDATE_ACCOUNT: '/api/user/account',
  },

  // TTS (Text-to-Speech)
  TTS: {
    GENERATE: (worldId: string) => `/api/worlds/${worldId}/tts`,
  },
} as const;
