/**
 * Hook para gestionar el feed de la comunidad
 */

import { useState, useEffect, useCallback } from 'react';

export type FeedFilter = 'hot' | 'new' | 'top' | 'following';
export type PostType = 'all' | 'showcase' | 'discussion' | 'question' | 'guide';

interface Post {
  id: string;
  title: string;
  content: string;
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
  agentId?: string; // Para posts de tipo showcase
  agent?: {
    id: string;
    name: string;
    description: string;
    avatar?: string;
  };
  upvotes: number;
  downvotes: number;
  commentCount: number;
  tags: string[];
  isPinned: boolean;
  isFeatured: boolean;
  createdAt: string;
  userVote?: 'upvote' | 'downvote' | null;
  userSaved?: boolean;
  awards?: Array<{
    type: string;
    count: number;
  }>;
}

interface UseFeedOptions {
  filter?: FeedFilter;
  postType?: PostType;
  communityId?: string;
}

export function useFeed(options: UseFeedOptions = {}) {
  const { filter = 'hot', postType = 'all', communityId } = options;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadPosts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
      });

      if (postType !== 'all') params.append('type', postType);
      if (communityId) params.append('communityId', communityId);

      const endpoint = `/api/community/feed/${filter}?${params.toString()}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Error al cargar el feed');
      }

      const data = await response.json();

      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }

      setHasMore(data.pagination?.hasMore || false);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error loading feed:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, postType, communityId]);

  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPosts(page + 1, true);
    }
  }, [loading, hasMore, page, loadPosts]);

  const refresh = useCallback(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  const votePost = useCallback(async (postId: string, voteType: 'upvote' | 'downvote') => {
    // Actualización optimista ANTES de la petición
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;

      const wasUpvote = post.userVote === 'upvote';
      const wasDownvote = post.userVote === 'downvote';
      const isUpvote = voteType === 'upvote';

      let newUpvotes = post.upvotes;
      let newDownvotes = post.downvotes;

      // Remover voto anterior
      if (wasUpvote) newUpvotes--;
      if (wasDownvote) newDownvotes--;

      // Si es el mismo voto, toggle (remover)
      if (post.userVote === voteType) {
        return { ...post, upvotes: newUpvotes, downvotes: newDownvotes, userVote: null };
      }

      // Agregar nuevo voto
      if (isUpvote) {
        newUpvotes++;
      } else {
        newDownvotes++;
      }

      return {
        ...post,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        userVote: voteType,
      };
    }));

    try {
      const response = await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        // Revertir el cambio si falla
        setPosts(prev => prev.map(post => {
          if (post.id !== postId) return post;
          // Recargar desde el servidor
          return post;
        }));
        throw new Error('Error al votar');
      }
    } catch (err) {
      console.error('Error voting:', err);
      // La reversión ya se hizo arriba
    }
  }, []);

  const savePost = useCallback(async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      const isSaved = post?.userSaved;

      const response = await fetch(`/api/community/posts/${postId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('Error al guardar post');

      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, userSaved: !isSaved } : p
      ));
    } catch (err) {
      console.error('Error saving post:', err);
    }
  }, [posts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    votePost,
    savePost,
  };
}
