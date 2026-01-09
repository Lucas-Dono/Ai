"use client";

import { useEffect, useState } from 'react';
import { PostCard } from '@/components/community/PostCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Loader2, Filter, X, ChevronDown, TrendingUp, Clock, ThumbsUp, MessageSquare } from 'lucide-react';
import Link from 'next/link';

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
  upvotes: number;
  downvotes: number;
  commentCount: number;
  tags: string[];
  images?: string[];
  isPinned: boolean;
  isFeatured: boolean;
  createdAt: string;
  userVote?: 'upvote' | 'downvote' | null;
  userSaved?: boolean;
  isFollowing: boolean;
}

interface Community {
  id: string;
  name: string;
  slug: string;
}

type PostType = 'all' | 'discussion' | 'question' | 'showcase' | 'help' | 'research' | 'poll' | 'announcement';
type DateFilter = 'all' | 'today' | 'week' | 'month';
type SortBy = 'recent' | 'active' | 'upvoted' | 'commented';

export default function FollowingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<PostType>('all');
  const [communityFilter, setCommunityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');

  useEffect(() => {
    fetchFollowedPosts();
    fetchCommunities();
  }, [typeFilter, communityFilter, dateFilter, sortBy]);

  const fetchFollowedPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (communityFilter !== 'all') params.append('communityId', communityFilter);
      if (dateFilter !== 'all') params.append('date', dateFilter);
      params.append('sortBy', sortBy);

      const response = await fetch(`/api/community/posts/following?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error al cargar posts seguidos');
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunities = async () => {
    try {
      const response = await fetch('/api/community/posts/following/communities');
      if (response.ok) {
        const data = await response.json();
        setCommunities(data.communities || []);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setCommunityFilter('all');
    setDateFilter('all');
    setSortBy('recent');
  };

  const hasActiveFilters = typeFilter !== 'all' || communityFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'recent';

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        // Actualizar el post en el estado
        fetchFollowedPosts();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando posts seguidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchFollowedPosts}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const postTypeLabels: Record<PostType, string> = {
    all: 'Todos',
    discussion: 'Discusión',
    question: 'Pregunta',
    showcase: 'Showcase',
    help: 'Ayuda',
    research: 'Investigación',
    poll: 'Encuesta',
    announcement: 'Anuncio'
  };

  const dateFilterLabels: Record<DateFilter, string> = {
    all: 'Todo el tiempo',
    today: 'Hoy',
    week: 'Esta semana',
    month: 'Este mes'
  };

  const sortByLabels: Record<SortBy, string> = {
    recent: 'Reciente',
    active: 'Más activo',
    upvoted: 'Más votado',
    commented: 'Más comentado'
  };

  const sortByIcons: Record<SortBy, any> = {
    recent: Clock,
    active: TrendingUp,
    upvoted: ThumbsUp,
    commented: MessageSquare
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Posts Seguidos</h1>
            </div>
            <Link
              href="/community/following/analytics"
              className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium"
            >
              Ver Analytics
            </Link>
          </div>
          <p className="text-muted-foreground">
            Publicaciones que sigues. Recibirás notificaciones cuando haya nuevos comentarios.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="mb-6 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-accent/50 hover:bg-accent rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filtros</span>
              {hasActiveFilters && (
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  Activos
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {/* Tipo de Post */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipo de Post
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as PostType)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.entries(postTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Comunidad */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Comunidad
                  </label>
                  <select
                    value={communityFilter}
                    onChange={(e) => setCommunityFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">Todas</option>
                    {communities.map((community) => (
                      <option key={community.id} value={community.id}>
                        {community.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Período
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.entries(dateFilterLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Ordenamiento */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.entries(sortByLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        {!loading && posts.length > 0 && (
          <div className="mb-4 text-sm text-muted-foreground">
            Mostrando {posts.length} post{posts.length !== 1 ? 's' : ''}
            {hasActiveFilters && ' (filtrado)'}
          </div>
        )}

        {/* Posts List */}
        {posts.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-12 text-center"
          >
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {hasActiveFilters ? 'No hay posts que coincidan con los filtros' : 'No sigues ningún post aún'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? 'Intenta ajustar los filtros para ver más resultados.'
                : 'Cuando sigas posts, aparecerán aquí y recibirás notificaciones de nuevos comentarios.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Limpiar Filtros
              </button>
            ) : (
              <Link
                href="/community"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Explorar Comunidad
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard
                  post={post}
                  onVote={handleVote}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
