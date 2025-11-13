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
    const response: any = await apiClient.get('/api/community/events', { params });
    return response.data as any;
  },

  /**
   * Obtener evento por ID
   */
  async getById(id: string) {
    const response: any = await apiClient.get(`/community/events/${id}`);
    return response.data as any;
  },

  /**
   * Crear evento
   */
  async create(data: CreateEventData) {
    const response: any = await apiClient.post('/api/community/events', data);
    return response.data as any;
  },

  /**
   * Actualizar evento
   */
  async update(id: string, data: Partial<CreateEventData>) {
    const response: any = await apiClient.patch(`/community/events/${id}`, data);
    return response.data as any;
  },

  /**
   * Registrarse en evento
   */
  async register(id: string, teamName?: string) {
    const response: any = await apiClient.post(`/community/events/${id}/register`, { teamName });
    return response.data as any;
  },

  /**
   * Cancelar registro
   */
  async unregister(id: string) {
    const response: any = await apiClient.delete(`/community/events/${id}/register`);
    return response.data as any;
  },

  /**
   * Enviar submission
   */
  async submit(id: string, submission: any) {
    const response: any = await apiClient.post(`/community/events/${id}/submit`, submission);
    return response.data as any;
  },

  /**
   * Declarar ganadores (organizador)
   */
  async declareWinners(id: string, winners: Array<{ userId: string; position: number; prize?: string }>) {
    const response: any = await apiClient.post(`/community/events/${id}/winners`, { winners });
    return response.data as any;
  },

  /**
   * Obtener participantes
   */
  async getParticipants(id: string) {
    const response: any = await apiClient.get(`/community/events/${id}/participants`);
    return response.data as any;
  },
};
