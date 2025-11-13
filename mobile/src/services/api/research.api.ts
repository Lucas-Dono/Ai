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
    const response: any = await apiClient.get('/api/community/research', { params });
    return response.data as any;
  },

  /**
   * Obtener proyecto por ID
   */
  async getById(id: string) {
    const response: any = await apiClient.get(`/community/research/${id}`);
    return response.data as any;
  },

  /**
   * Crear proyecto
   */
  async create(data: CreateProjectData) {
    const response: any = await apiClient.post('/api/community/research', data);
    return response.data as any;
  },

  /**
   * Actualizar proyecto
   */
  async update(id: string, data: Partial<CreateProjectData>) {
    const response: any = await apiClient.patch(`/community/research/${id}`, data);
    return response.data as any;
  },

  /**
   * Solicitar unirse como colaborador
   */
  async requestToJoin(id: string, message: string) {
    const response: any = await apiClient.post(`/community/research/${id}/join`, { message });
    return response.data as any;
  },

  /**
   * Aceptar colaborador (líder)
   */
  async acceptContributor(projectId: string, userId: string, role?: string) {
    const response: any = await apiClient.patch(
      `/community/research/${projectId}/contributors/${userId}`,
      { role }
    );
    return response.data as any;
  },

  /**
   * Remover colaborador (líder)
   */
  async removeContributor(projectId: string, userId: string) {
    const response: any = await apiClient.delete(
      `/community/research/${projectId}/contributors/${userId}`
    );
    return response.data as any;
  },

  /**
   * Añadir dataset
   */
  async addDataset(projectId: string, data: any) {
    const response: any = await apiClient.post(`/community/research/${projectId}/datasets`, data);
    return response.data as any;
  },

  /**
   * Revisar proyecto
   */
  async review(id: string, rating: number, review: string) {
    const response: any = await apiClient.post(`/community/research/${id}/review`, {
      rating,
      review,
    });
    return response.data as any;
  },

  /**
   * Publicar proyecto
   */
  async publish(id: string) {
    const response: any = await apiClient.post(`/community/research/${id}/publish`);
    return response.data as any;
  },

  /**
   * Completar proyecto
   */
  async complete(id: string) {
    const response: any = await apiClient.post(`/community/research/${id}/complete`);
    return response.data as any;
  },
};
