/**
 * Event API Client - Wrapper para endpoints de eventos
 */

import { apiClient } from './client';

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'challenge' | 'competition' | 'meetup' | 'hackathon' | 'workshop';
  communityId?: string;
  organizerId: string;
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  participantCount: number;
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  prizes?: any;
  rules?: string;
  createdAt: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  type: 'challenge' | 'competition' | 'meetup' | 'hackathon' | 'workshop';
  communityId?: string;
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  rules?: string;
  prizes?: any;
  requirements?: string;
}

export const eventApi = {
  /**
   * Listar eventos
   */
  async list(params?: {
    communityId?: string;
    type?: string;
    status?: string;
    upcoming?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get('/api/community/events', { params }) as any;
    return response.data;
  },

  /**
   * Obtener evento por ID
   */
  async getById(id: string) {
    const response = await apiClient.get(`/community/events/${id}`) as any;
    return response.data;
  },

  /**
   * Crear evento
   */
  async create(data: CreateEventData) {
    const response = await apiClient.post('/api/community/events', data) as any;
    return response.data;
  },

  /**
   * Actualizar evento
   */
  async update(id: string, data: Partial<CreateEventData>) {
    const response = await apiClient.patch(`/community/events/${id}`, data) as any;
    return response.data;
  },

  /**
   * Registrarse en evento
   */
  async register(id: string, teamName?: string) {
    const response = await apiClient.post(`/community/events/${id}/register`, { teamName }) as any;
    return response.data;
  },

  /**
   * Cancelar registro
   */
  async unregister(id: string) {
    const response = await apiClient.delete(`/community/events/${id}/register`) as any;
    return response.data;
  },

  /**
   * Enviar submission
   */
  async submit(id: string, submission: any) {
    const response = await apiClient.post(`/community/events/${id}/submit`, submission) as any;
    return response.data;
  },

  /**
   * Declarar ganadores (organizador)
   */
  async declareWinners(id: string, winners: Array<{ userId: string; position: number; prize?: string }>) {
    const response = await apiClient.post(`/community/events/${id}/winners`, { winners }) as any;
    return response.data;
  },

  /**
   * Obtener participantes
   */
  async getParticipants(id: string) {
    const response = await apiClient.get(`/community/events/${id}/participants`) as any;
    return response.data;
  },
};
