/**
 * Comment Service - Gestión de comentarios
 */

import { prisma } from '@/lib/prisma';

export interface CreateCommentData {
  postId: string;
  content: string;
  parentId?: string;
}

export const CommentService = {
  async createComment(authorId: string, data: CreateCommentData) {
    const post = await prisma.communityPost.findUnique({
      where: { id: data.postId },
      include: { community: true },
    });

    if (!post) throw new Error('Post no encontrado');
    if (post.isLocked) throw new Error('Post bloqueado para comentarios');

    if (post.communityId) {
      const member = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: post.communityId,
            userId: authorId,
          },
        },
      });

      if (!member || !member.canComment || member.isBanned || member.isMuted) {
        throw new Error('No tienes permiso para comentar');
      }
    }

    const comment = await prisma.communityComment.create({
      data: {
        postId: data.postId,
        authorId,
        content: data.content,
        parentId: data.parentId,
        isByOP: post.authorId === authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    await prisma.communityPost.update({
      where: { id: data.postId },
      data: {
        commentCount: { increment: 1 },
        lastActivityAt: new Date(),
      },
    });

    return comment;
  },

  async getPostComments(postId: string, sortBy: 'top' | 'new' | 'old' = 'top') {
    return this.getCommentsByPost(postId, sortBy);
  },

  async getCommentsByPost(postId: string, sortBy: 'top' | 'new' | 'old' = 'top') {
    let orderBy: any = {};
    switch (sortBy) {
      case 'top':
        orderBy = { score: 'desc' };
        break;
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'old':
        orderBy = { createdAt: 'asc' };
        break;
    }

    const comments = await prisma.communityComment.findMany({
      where: {
        postId,
        parentId: null,
        status: 'published',
      },
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return comments;
  },

  async getCommentReplies(commentId: string) {
    return await prisma.communityComment.findMany({
      where: {
        parentId: commentId,
        status: 'published',
      },
      orderBy: { score: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });
  },

  async voteComment(commentId: string, userId: string, voteType: 'upvote' | 'downvote') {
    const existing = await prisma.commentVote.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    if (existing) {
      if (existing.voteType === voteType) {
        await prisma.commentVote.delete({
          where: { commentId_userId: { commentId, userId } },
        });

        const increment = voteType === 'upvote' ? -1 : 1;
        await prisma.communityComment.update({
          where: { id: commentId },
          data: {
            [voteType === 'upvote' ? 'upvotes' : 'downvotes']: { decrement: 1 },
            score: { increment },
          },
        });

        return { voteType: null };
      }

      await prisma.commentVote.update({
        where: { commentId_userId: { commentId, userId } },
        data: { voteType },
      });

      await prisma.communityComment.update({
        where: { id: commentId },
        data: {
          upvotes: { [existing.voteType === 'upvote' ? 'decrement' : 'increment']: 1 },
          downvotes: { [existing.voteType === 'downvote' ? 'decrement' : 'increment']: 1 },
          score: { increment: voteType === 'upvote' ? 2 : -2 },
        },
      });

      return { voteType };
    }

    await prisma.commentVote.create({
      data: { commentId, userId, voteType },
    });

    const increment = voteType === 'upvote' ? 1 : -1;
    await prisma.communityComment.update({
      where: { id: commentId },
      data: {
        [voteType === 'upvote' ? 'upvotes' : 'downvotes']: { increment: 1 },
        score: { increment },
      },
    });

    return { voteType };
  },

  async markAsAccepted(commentId: string, userId: string) {
    return this.markAsAcceptedAnswer(commentId, userId);
  },

  async markAsAcceptedAnswer(commentId: string, userId: string) {
    const comment = await prisma.communityComment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) throw new Error('Comentario no encontrado');
    if (comment.post.authorId !== userId) {
      throw new Error('Solo el autor del post puede aceptar respuestas');
    }

    await prisma.communityComment.update({
      where: { id: commentId },
      data: { isAcceptedAnswer: true },
    });

    return { success: true };
  },

  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await prisma.communityComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new Error('Comentario no encontrado');
    if (comment.authorId !== userId) throw new Error('No tienes permiso para editar');

    return await prisma.communityComment.update({
      where: { id: commentId },
      data: { content, isEdited: true },
    });
  },

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.communityComment.findUnique({
      where: { id: commentId },
      include: { post: { include: { community: true } } },
    });

    if (!comment) throw new Error('Comentario no encontrado');

    let canDelete = comment.authorId === userId;

    if (!canDelete && comment.post.communityId) {
      const member = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: comment.post.communityId,
            userId,
          },
        },
      });
      canDelete = member?.canModerate || false;
    }

    if (!canDelete) throw new Error('No tienes permiso para eliminar');

    await prisma.communityComment.update({
      where: { id: commentId },
      data: { status: 'removed', isDeleted: true },
    });

    await prisma.communityPost.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });

    return { success: true };
  },
};
