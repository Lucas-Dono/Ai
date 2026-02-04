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

  // Grupos (anteriormente Mundos)
  WORLDS: {
    LIST: '/api/groups',
    CREATE: '/api/groups',
    GET: (id: string) => `/api/groups/${id}`,
    UPDATE: (id: string) => `/api/groups/${id}`,
    DELETE: (id: string) => `/api/groups/${id}`,
    MESSAGE: (id: string) => `/api/groups/${id}/messages`,
    START: (id: string) => `/api/groups/${id}/start`,
    STOP: (id: string) => `/api/groups/${id}/stop`,
    PAUSE: (id: string) => `/api/groups/${id}/pause`,
    CLONE: (id: string) => `/api/groups/${id}/clone`,
    AGENTS: (id: string) => `/api/groups/${id}/agents`,
    TRENDING: '/api/groups/trending',
  },

  // Alias para compatibilidad (GROUPS es lo mismo que WORLDS)
  GROUPS: {
    LIST: '/api/groups',
    CREATE: '/api/groups',
    GET: (id: string) => `/api/groups/${id}`,
    UPDATE: (id: string) => `/api/groups/${id}`,
    DELETE: (id: string) => `/api/groups/${id}`,
    MESSAGE: (id: string) => `/api/groups/${id}/messages`,
    MESSAGES: (id: string) => `/api/groups/${id}/messages`,
    START: (id: string) => `/api/groups/${id}/start`,
    STOP: (id: string) => `/api/groups/${id}/stop`,
    PAUSE: (id: string) => `/api/groups/${id}/pause`,
    CLONE: (id: string) => `/api/groups/${id}/clone`,
    AGENTS: (id: string) => `/api/groups/${id}/agents`,
    TRENDING: '/api/groups/trending',
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
