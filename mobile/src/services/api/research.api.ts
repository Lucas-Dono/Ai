/**
 * Research API Client - Wrapper para endpoints de investigación
 */

import { apiClient } from './client';

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  objectives: string;
  methodology: string;
  findings?: string;
  conclusions?: string;
  isPublic: boolean;
  lookingForCollaborators: boolean;
  requiredSkills: string[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  leaderId: string;
  contributorCount: number;
  createdAt: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  objectives: string;
  methodology: string;
  isPublic: boolean;
  lookingForCollaborators: boolean;
  requiredSkills?: string[];
}

export const researchApi = {
  /**
   * Listar proyectos
   */
  async list(params?: {
    category?: string;
    tags?: string;
    leaderId?: string;
    status?: string;
    search?: string;
    lookingForCollaborators?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get('/api/community/research', { params }) as any;
    return response.data;
  },

  /**
   * Obtener proyecto por ID
   */
  async getById(id: string) {
    const response = await apiClient.get(`/community/research/${id}`) as any;
    return response.data;
  },

  /**
   * Crear proyecto
   */
  async create(data: CreateProjectData) {
    const response = await apiClient.post('/api/community/research', data) as any;
    return response.data;
  },

  /**
   * Actualizar proyecto
   */
  async update(id: string, data: Partial<CreateProjectData>) {
    const response = await apiClient.patch(`/community/research/${id}`, data) as any;
    return response.data;
  },

  /**
   * Solicitar unirse como colaborador
   */
  async requestToJoin(id: string, message: string) {
    const response = await apiClient.post(`/community/research/${id}/join`, { message }) as any;
    return response.data;
  },

  /**
   * Aceptar colaborador (líder)
   */
  async acceptContributor(projectId: string, userId: string, role?: string) {
    const response = await apiClient.patch(
      `/community/research/${projectId}/contributors/${userId}`,
      { role }
    );
    return response.data;
  },

  /**
   * Remover colaborador (líder)
   */
  async removeContributor(projectId: string, userId: string) {
    const response = await apiClient.delete(
      `/community/research/${projectId}/contributors/${userId}`
    );
    return response.data;
  },

  /**
   * Añadir dataset
   */
  async addDataset(projectId: string, data: any) {
    const response = await apiClient.post(`/community/research/${projectId}/datasets`, data) as any;
    return response.data;
  },

  /**
   * Revisar proyecto
   */
  async review(id: string, rating: number, review: string) {
    const response = await apiClient.post(`/community/research/${id}/review`, {
      rating,
      review,
    });
    return response.data;
  },

  /**
   * Publicar proyecto
   */
  async publish(id: string) {
    const response = await apiClient.post(`/community/research/${id}/publish`) as any;
    return response.data;
  },

  /**
   * Completar proyecto
   */
  async complete(id: string) {
    const response = await apiClient.post(`/community/research/${id}/complete`) as any;
    return response.data;
  },
};
