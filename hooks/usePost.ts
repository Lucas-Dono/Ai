/**
 * Hook para gestionar un post específico y sus comentarios
 */

import { useState, useEffect, useCallback } from 'react';

interface Post {
  id: string;
  title: string;
  content: string;
  contentType: string;
  type: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  community?: {
    id: string;
    name: string;
    slug: string;
    primaryColor: string;
  };
  agentId?: string;
  agent?: {
    id: string;
    name: string;
    description: string;
    avatar?: string;
  };
  upvotes: number;
  downvotes: number;
  score: number;
  commentCount: number;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  userVote?: 'upvote' | 'downvote' | null;
  userSaved?: boolean;
  awards: Array<{
    type: string;
    count: number;
  }>;
}

interface Comment {
  id: string;
  content: string;
  contentType: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  parentId?: string;
  upvotes: number;
  downvotes: number;
  score: number;
  isEdited: boolean;
  isDeleted: boolean;
  isAcceptedAnswer: boolean;
  createdAt: string;
  updatedAt: string;
  userVote?: 'upvote' | 'downvote' | null;
  replies?: Comment[];
}

export function usePost(postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/community/posts/${postId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Post no encontrado');
        }
        throw new Error('Error al cargar el post');
      }

      const data = await response.json();
      setPost(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/community/comments?postId=${postId}`);

      if (!response.ok) {
        throw new Error('Error al cargar comentarios');
      }

      const data = await response.json();

      // Organizar comentarios en árbol
      const commentsMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      data.comments.forEach((comment: Comment) => {
        commentsMap.set(comment.id, { ...comment, replies: [] });
      });

      data.comments.forEach((comment: Comment) => {
        if (comment.parentId) {
          const parent = commentsMap.get(comment.parentId);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(commentsMap.get(comment.id)!);
          }
        } else {
          rootComments.push(commentsMap.get(comment.id)!);
        }
      });

      setComments(rootComments);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [loadPost, loadComments]);

  const votePost = useCallback(async (voteType: 'upvote' | 'downvote') => {
    if (!post) return;

    console.log('🔵 [votePost] Antes del voto:', {
      voteType,
      currentUserVote: post.userVote,
      upvotes: post.upvotes,
      downvotes: post.downvotes
    });

    const wasUpvote = post.userVote === 'upvote';
    const wasDownvote = post.userVote === 'downvote';
    const isUpvote = voteType === 'upvote';

    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;

    if (wasUpvote) newUpvotes--;
    if (wasDownvote) newDownvotes--;

    // Si es el mismo voto, toggle (remover)
    if (post.userVote === voteType) {
      console.log('🔄 [votePost] Toggle - Removiendo voto');
      setPost({ ...post, upvotes: newUpvotes, downvotes: newDownvotes, userVote: null, score: newUpvotes - newDownvotes });
    } else {
      // Agregar nuevo voto
      if (isUpvote) {
        newUpvotes++;
      } else {
        newDownvotes++;
      }
      console.log('✅ [votePost] Nuevo voto aplicado:', {
        newUserVote: voteType,
        newUpvotes,
        newDownvotes
      });
      setPost({ ...post, upvotes: newUpvotes, downvotes: newDownvotes, userVote: voteType, score: newUpvotes - newDownvotes });
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        // Revertir si falla
        setPost(post);
        throw new Error('Error al votar');
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  }, [post, postId]);

  const voteComment = useCallback(async (commentId: string, voteType: 'upvote' | 'downvote') => {
    // Actualizar localmente ANTES de la petición
    const updateComment = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          const wasUpvote = comment.userVote === 'upvote';
          const wasDownvote = comment.userVote === 'downvote';
          const isUpvote = voteType === 'upvote';

          let newUpvotes = comment.upvotes;
          let newDownvotes = comment.downvotes;

          if (wasUpvote) newUpvotes--;
          if (wasDownvote) newDownvotes--;

          if (comment.userVote === voteType) {
            return { ...comment, upvotes: newUpvotes, downvotes: newDownvotes, userVote: null, score: newUpvotes - newDownvotes };
          }

          if (isUpvote) {
            newUpvotes++;
          } else {
            newDownvotes++;
          }

          return { ...comment, upvotes: newUpvotes, downvotes: newDownvotes, userVote: voteType, score: newUpvotes - newDownvotes };
        }

        if (comment.replies) {
          return { ...comment, replies: updateComment(comment.replies) };
        }

        return comment;
      });
    };

    const previousComments = comments;
    setComments(updateComment(comments));

    try {
      const response = await fetch(`/api/community/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        // Revertir si falla
        setComments(previousComments);
        throw new Error('Error al votar');
      }
    } catch (err) {
      console.error('Error voting comment:', err);
    }
  }, [comments]);

  const addComment = useCallback(async (content: string, parentId?: string) => {
    try {
      setSubmitting(true);

      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content,
          parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al comentar');
      }

      // Recargar comentarios
      await loadComments();

      // Actualizar contador en el post
      if (post) {
        setPost({ ...post, commentCount: post.commentCount + 1 });
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [postId, post, loadComments]);

  const giveAward = useCallback(async (awardType: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awardType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al dar award');
      }

      // Recargar post para actualizar awards
      await loadPost();
    } catch (err) {
      console.error('Error giving award:', err);
      throw err;
    }
  }, [postId, loadPost]);

  const savePost = useCallback(async () => {
    if (!post) return;

    try {
      const isSaved = post.userSaved;

      const response = await fetch(`/api/community/posts/${postId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('Error al guardar post');

      setPost({ ...post, userSaved: !isSaved });
    } catch (err) {
      console.error('Error saving post:', err);
    }
  }, [post, postId]);

  const reportPost = useCallback(async (reason: string, description?: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al reportar');
      }
    } catch (err) {
      console.error('Error reporting post:', err);
      throw err;
    }
  }, [postId]);

  const refresh = useCallback(() => {
    loadPost();
    loadComments();
  }, [loadPost, loadComments]);

  return {
    post,
    comments,
    loading,
    error,
    submitting,
    votePost,
    voteComment,
    addComment,
    giveAward,
    savePost,
    reportPost,
    refresh,
  };
}
