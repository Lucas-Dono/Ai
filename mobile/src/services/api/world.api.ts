import { apiClient } from './client';

export interface World {
  id: string;
  name: string;
  description: string;
  genre?: string;
  format?: 'chat' | 'visual-novel';
  imageUrl?: string;
  status: 'active' | 'paused' | 'stopped';
  userId: string;
  agents: any[];
  messageCount: number;
  lastActivity?: Date;
  isPredefined?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorldDto {
  name: string;
  description: string;
  genre?: string;
  format?: 'chat' | 'visual-novel';
  agentIds?: string[];
  templateId?: string;
}

export interface WorldMessage {
  content: string;
  worldId: string;
}

export interface PredefinedWorld {
  id: string;
  name: string;
  description: string;
  genre: string;
  imageUrl?: string;
  agentCount: number;
}

const worldApi = {
  // Listar mundos del usuario
  async getWorlds() {
    const data = await apiClient.get<World[]>('/api/worlds');
    return data;
  },

  // Obtener mundo por ID
  async getWorld(id: string) {
    const data = await apiClient.get<World>(`/api/worlds/${id}`);
    return data;
  },

  // Crear mundo
  async createWorld(worldData: CreateWorldDto) {
    const data = await apiClient.post<World>('/api/worlds', worldData);
    return data;
  },

  // Actualizar mundo
  async updateWorld(id: string, worldData: Partial<CreateWorldDto>) {
    const data = await apiClient.put<World>(`/api/worlds/${id}`, worldData);
    return data;
  },

  // Eliminar mundo
  async deleteWorld(id: string) {
    await apiClient.delete(`/api/worlds/${id}`);
  },

  // Enviar mensaje a mundo
  async sendMessage(worldId: string, content: string) {
    const data = await apiClient.post<any>(`/api/worlds/${worldId}/message`, {
      content,
    });
    return data;
  },

  // Iniciar simulación
  async startSimulation(worldId: string) {
    const data = await apiClient.post(`/api/worlds/${worldId}/start`);
    return data;
  },

  // Detener simulación
  async stopSimulation(worldId: string) {
    const data = await apiClient.post(`/api/worlds/${worldId}/stop`);
    return data;
  },

  // Pausar simulación
  async pauseSimulation(worldId: string) {
    const data = await apiClient.post(`/api/worlds/${worldId}/pause`);
    return data;
  },

  // Obtener mundos predefinidos (templates)
  async getPredefinedWorlds() {
    const data = await apiClient.get<PredefinedWorld[]>('/api/worlds/predefined');
    return data;
  },

  // Obtener mundos trending
  async getTrendingWorlds() {
    const data = await apiClient.get<World[]>('/api/worlds/trending');
    return data;
  },

  // Clonar mundo
  async cloneWorld(worldId: string) {
    const data = await apiClient.post<World>(`/api/worlds/${worldId}/clone`);
    return data;
  },

  // Obtener agentes del mundo
  async getWorldAgents(worldId: string) {
    const data = await apiClient.get<any[]>(`/api/worlds/${worldId}/agents`);
    return data;
  },

  // Obtener interacciones del mundo
  async getWorldInteractions(worldId: string) {
    const data = await apiClient.get<any[]>(`/api/worlds/${worldId}/interactions`);
    return data;
  },

  // Track view
  async trackView(worldId: string) {
    await apiClient.post(`/api/worlds/${worldId}/track-view`);
  },
};

export default worldApi;
