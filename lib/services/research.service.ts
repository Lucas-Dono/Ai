/**
 * Research Service - Sistema de investigación colaborativa
 */

import { prisma } from '@/lib/prisma';

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

export interface UpdateProjectData {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  objectives?: string;
  methodology?: string;
  findings?: string;
  conclusions?: string;
  isPublic?: boolean;
  lookingForCollaborators?: boolean;
  requiredSkills?: string[];
  status?: 'draft' | 'active' | 'completed' | 'archived';
}

export interface CreateDatasetData {
  name: string;
  description: string;
  dataType: string;
  format: string;
  url?: string;
  size?: number;
  license?: string;
}

export const ResearchService = {
  /**
   * Crear proyecto de investigación
   */
  async createProject(leaderId: string, data: CreateProjectData) {
    const project = await prisma.researchProject.create({
      data: {
        leaderId,
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags,
        objectives: data.objectives,
        methodology: data.methodology,
        isPublic: data.isPublic,
        lookingForCollaborators: data.lookingForCollaborators,
        requiredSkills: data.requiredSkills || [],
        status: 'draft',
      },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Añadir líder como colaborador
    await prisma.researchContributor.create({
      data: {
        projectId: project.id,
        userId: leaderId,
        role: 'lead',
        canEdit: true,
      },
    });

    return project;
  },

  /**
   * Actualizar proyecto
   */
  async updateProject(projectId: string, userId: string, data: UpdateProjectData) {
    // Verificar permisos
    const contributor = await prisma.researchContributor.findFirst({
      where: {
        projectId,
        userId,
        canEdit: true,
      },
    });

    if (!contributor) {
      throw new Error('No tienes permisos para editar este proyecto');
    }

    const updated = await prisma.researchProject.update({
      where: { id: projectId },
      data,
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        contributors: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return updated;
  },

  /**
   * Obtener proyecto
   */
  async getProject(projectId: string, userId?: string) {
    const project = await prisma.researchProject.findUnique({
      where: { id: projectId },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        contributors: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        datasets: {
          orderBy: { uploadedAt: 'desc' },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    // Verificar si es público o si el usuario es colaborador
    if (!project.isPublic) {
      const isContributor = project.contributors.some(c => c.userId === userId);
      if (!isContributor) {
        throw new Error('Este proyecto es privado');
      }
    }

    return project;
  },

  /**
   * Listar proyectos
   */
  async listProjects(filters: {
    category?: string;
    tags?: string[];
    leaderId?: string;
    status?: string;
    search?: string;
    lookingForCollaborators?: boolean;
    isPublic?: boolean;
  } = {}, page = 1, limit = 25) {
    const where: any = {
      isPublic: true,
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters.leaderId) {
      where.leaderId = filters.leaderId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.lookingForCollaborators !== undefined) {
      where.lookingForCollaborators = filters.lookingForCollaborators;
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { objectives: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.researchProject.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          leader: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              contributors: true,
              datasets: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.researchProject.count({ where }),
    ]);

    return {
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Solicitar unirse como colaborador
   */
  async requestToJoin(projectId: string, userId: string, message: string) {
    const project = await prisma.researchProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    if (!project.lookingForCollaborators) {
      throw new Error('Este proyecto no está buscando colaboradores');
    }

    // Verificar si ya es colaborador
    const existing = await prisma.researchContributor.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existing) {
      throw new Error('Ya eres colaborador de este proyecto');
    }

    // Crear solicitud (como contributor pendiente)
    const contributor = await prisma.researchContributor.create({
      data: {
        projectId,
        userId,
        role: 'pending',
        contribution: message,
        canEdit: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return contributor;
  },

  /**
   * Aceptar colaborador (solo líder)
   */
  async acceptContributor(projectId: string, contributorUserId: string, leaderId: string, role: string = 'contributor') {
    const project = await prisma.researchProject.findUnique({
      where: { id: projectId },
    });

    if (!project || project.leaderId !== leaderId) {
      throw new Error('No tienes permisos para aceptar colaboradores');
    }

    const contributor = await prisma.researchContributor.update({
      where: {
        projectId_userId: {
          projectId,
          userId: contributorUserId,
        },
      },
      data: {
        role,
        canEdit: role === 'co-lead',
      },
    });

    // Incrementar contador
    await prisma.researchProject.update({
      where: { id: projectId },
      data: {
        contributorCount: { increment: 1 },
      },
    });

    return contributor;
  },

  /**
   * Rechazar/remover colaborador
   */
  async removeContributor(projectId: string, contributorUserId: string, leaderId: string) {
    const project = await prisma.researchProject.findUnique({
      where: { id: projectId },
    });

    if (!project || project.leaderId !== leaderId) {
      throw new Error('No tienes permisos para remover colaboradores');
    }

    if (contributorUserId === leaderId) {
      throw new Error('No puedes remover al líder del proyecto');
    }

    await prisma.researchContributor.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: contributorUserId,
        },
      },
    });

    // Decrementar contador
    await prisma.researchProject.update({
      where: { id: projectId },
      data: {
        contributorCount: { decrement: 1 },
      },
    });

    return { success: true };
  },

  /**
   * Añadir dataset
   */
  async addDataset(projectId: string, userId: string, data: CreateDatasetData) {
    // Verificar permisos
    const contributor = await prisma.researchContributor.findFirst({
      where: {
        projectId,
        userId,
        role: { not: 'pending' },
      },
    });

    if (!contributor) {
      throw new Error('No eres colaborador de este proyecto');
    }

    const dataset = await prisma.researchDataset.create({
      data: {
        projectId,
        uploadedById: userId,
        name: data.name,
        description: data.description,
        dataType: data.dataType,
        format: data.format,
        url: data.url,
        size: data.size,
        license: data.license,
      },
    });

    return dataset;
  },

  /**
   * Crear review de proyecto
   */
  async createReview(projectId: string, reviewerId: string, rating: number, review: string) {
    if (rating < 1 || rating > 5) {
      throw new Error('La calificación debe estar entre 1 y 5');
    }

    const project = await prisma.researchProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    if (project.status !== 'completed') {
      throw new Error('Solo puedes revisar proyectos completados');
    }

    // Crear o actualizar review
    const projectReview = await prisma.researchReview.upsert({
      where: {
        projectId_reviewerId: {
          projectId,
          reviewerId,
        },
      },
      create: {
        projectId,
        reviewerId,
        rating,
        review,
      },
      update: {
        rating,
        review,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Recalcular promedio
    const reviews = await prisma.researchReview.aggregate({
      where: { projectId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.researchProject.update({
      where: { id: projectId },
      data: {
        averageRating: reviews._avg.rating || 0,
        reviewCount: reviews._count,
      },
    });

    return projectReview;
  },

  /**
   * Publicar proyecto (marcar como activo)
   */
  async publishProject(projectId: string, userId: string) {
    const project = await prisma.researchProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    if (project.leaderId !== userId) {
      throw new Error('Solo el líder puede publicar el proyecto');
    }

    const published = await prisma.researchProject.update({
      where: { id: projectId },
      data: {
        status: 'active',
        publishedAt: new Date(),
      },
    });

    return published;
  },

  /**
   * Marcar proyecto como completado
   */
  async completeProject(projectId: string, userId: string) {
    const project = await prisma.researchProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    if (project.leaderId !== userId) {
      throw new Error('Solo el líder puede completar el proyecto');
    }

    const completed = await prisma.researchProject.update({
      where: { id: projectId },
      data: {
        status: 'completed',
      },
    });

    return completed;
  },
};
