/**
 * Community Feed Page - Tech/Cyberpunk UI Design
 * Con soporte para vista móvil sincronizada con la app React Native
 */

"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Flame,
  Clock,
  Star,
  Users,
  MessageSquare,
  BookOpen,
  Terminal,
  Shield,
  Zap,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useFeed, type FeedFilter, type PostType } from "@/hooks/useFeed";
import { PostCard } from "@/components/community";
import { usePopularCommunities } from "@/hooks/usePopularCommunities";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { ErrorBoundary } from "@/components/error-boundary";
import { mobileTheme } from "@/lib/mobile-theme";

export default function CommunityPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('hot');
  const [activeView, setActiveView] = useState<PostType>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const { posts, loading, votePost, savePost, loadMore, hasMore, refresh } = useFeed({
    filter: activeFilter,
    postType: activeView,
  });

  const { communities: popularCommunities, loading: communitiesLoading } = usePopularCommunities({
    limit: 4,
  });

  // Función para determinar el color y la sombra según la reputación
  const getReputationStyle = (value: number) => {
    if (value >= 75) return {
      color: 'bg-emerald-500',
      shadow: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      text: 'text-emerald-500',
      label: 'Óptima'
    };
    if (value >= 40) return {
      color: 'bg-yellow-500',
      shadow: 'shadow-[0_0_8px_rgba(234,179,8,0.5)]',
      text: 'text-yellow-500',
      label: 'Estable'
    };
    return {
      color: 'bg-red-500',
      shadow: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]',
      text: 'text-red-500',
      label: 'Crítica'
    };
  };

  const filters = [
    { id: 'hot' as FeedFilter, icon: Flame, label: 'Hot' },
    { id: 'new' as FeedFilter, icon: Clock, label: 'Nuevo' },
    { id: 'top' as FeedFilter, icon: Star, label: 'Top' },
    { id: 'following' as FeedFilter, icon: Users, label: 'Siguiendo' }
  ];

  const viewTabs = [
    { type: 'all' as PostType, label: 'Todos' },
    { type: 'showcase' as PostType, label: 'Showcase' },
    { type: 'discussion' as PostType, label: 'Discusión' },
    { type: 'question' as PostType, label: 'Preguntas' },
    { type: 'guide' as PostType, label: 'Guías' },
  ];

  const rules = [
    "Sé respetuoso y constructivo (Protocolo 1)",
    "Comparte IAs útiles y creativas",
    "No spam ni autopromoción excesiva",
    "Marca contenido NSFW apropiadamente"
  ];

  return (
    <ErrorBoundary variant="page">
      {/* Mobile View - Sincronizado con la app React Native */}
      <div
        className="lg:hidden w-full min-h-screen"
        style={{ backgroundColor: mobileTheme.colors.background.primary }}
      >
        <PullToRefresh onRefresh={async () => { await refresh(); }}>
          {/* Header de Community - Sincronizado con desktop */}
          <section className="pt-6 pb-4" style={{ paddingLeft: mobileTheme.spacing.lg, paddingRight: mobileTheme.spacing.lg }}>
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 mb-1.5" style={{ color: mobileTheme.colors.text.primary }}>
                <span style={{ color: mobileTheme.colors.primary[500], fontSize: '1.5rem' }}>///</span>
                Community Hub
              </h1>
              <p className="font-mono text-xs" style={{ color: mobileTheme.colors.text.tertiary }}>
                [SYSTEM]: Conecta, comparte y aprende con creadores de IAs.
              </p>
            </div>
          </section>

          {/* Popular Communities - Carrusel horizontal */}
          <section className="pb-2">
            <div
              className="flex items-center justify-between mb-4"
              style={{ paddingLeft: mobileTheme.spacing.lg, paddingRight: mobileTheme.spacing.lg }}
            >
              <div>
                <h2
                  className="font-bold"
                  style={{
                    fontSize: mobileTheme.typography.fontSize.xl,
                    color: mobileTheme.colors.text.primary
                  }}
                >
                  Comunidades
                </h2>
                <p style={{ fontSize: mobileTheme.typography.fontSize.sm, color: mobileTheme.colors.text.secondary }}>
                  Únete a la conversación
                </p>
              </div>
              <Link href="/community/explore">
                <button
                  className="flex items-center gap-1"
                  style={{ color: mobileTheme.colors.primary[500], fontWeight: 600, fontSize: mobileTheme.typography.fontSize.sm }}
                >
                  Ver todo
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </Link>
            </div>

            {/* Carrusel de comunidades */}
            <div
              className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ paddingLeft: mobileTheme.spacing.lg, paddingRight: mobileTheme.spacing.lg }}
            >
              {communitiesLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex-shrink-0 snap-start"
                    style={{
                      width: 140,
                      height: 120,
                      backgroundColor: mobileTheme.colors.background.card,
                      borderRadius: mobileTheme.borderRadius.lg
                    }}
                  />
                ))
              ) : popularCommunities.length === 0 ? (
                <Link href={isAuthenticated ? "/community/communities/create" : "/login?callbackUrl=/community/communities/create"}>
                  <div
                    className="flex-shrink-0 snap-start flex flex-col items-center justify-center gap-2"
                    style={{
                      width: 140,
                      height: 120,
                      backgroundColor: mobileTheme.colors.background.card,
                      borderRadius: mobileTheme.borderRadius.lg,
                      border: `1px dashed ${mobileTheme.colors.border.light}`
                    }}
                  >
                    <Plus size={24} style={{ color: mobileTheme.colors.primary[500] }} />
                    <span style={{ fontSize: mobileTheme.typography.fontSize.sm, color: mobileTheme.colors.text.secondary }}>
                      Crear comunidad
                    </span>
                  </div>
                </Link>
              ) : (
                <>
                  {popularCommunities.map((comm, index) => {
                    const reputation = Math.min(95, 50 + (comm.memberCount / 100));
                    const style = getReputationStyle(reputation);
                    return (
                      <Link key={comm.id} href={`/community/${comm.slug}`}>
                        <motion.div
                          className="flex-shrink-0 snap-start p-3 flex flex-col justify-between"
                          style={{
                            width: 140,
                            height: 120,
                            backgroundColor: mobileTheme.colors.background.card,
                            borderRadius: mobileTheme.borderRadius.lg,
                            border: `1px solid ${mobileTheme.colors.border.light}`
                          }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 flex items-center justify-center font-bold"
                              style={{
                                backgroundColor: mobileTheme.colors.background.elevated,
                                borderRadius: mobileTheme.borderRadius.sm,
                                fontSize: mobileTheme.typography.fontSize.xs,
                                color: mobileTheme.colors.primary[500]
                              }}
                            >
                              {comm.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span
                              className="px-1.5 py-0.5 rounded font-bold"
                              style={{
                                fontSize: 10,
                                color: mobileTheme.colors.primary[500],
                                backgroundColor: `${mobileTheme.colors.primary[500]}20`
                              }}
                            >
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <h4
                              className="font-medium truncate"
                              style={{ fontSize: mobileTheme.typography.fontSize.sm, color: mobileTheme.colors.text.primary }}
                            >
                              {comm.name}
                            </h4>
                            <p style={{ fontSize: mobileTheme.typography.fontSize.xs, color: mobileTheme.colors.text.tertiary }}>
                              {comm.memberCount.toLocaleString()} miembros
                            </p>
                          </div>
                          {/* Barra de reputación */}
                          <div
                            className="w-full h-1 rounded-full overflow-hidden"
                            style={{ backgroundColor: mobileTheme.colors.background.elevated }}
                          >
                            <div
                              className={`h-full ${style.color}`}
                              style={{ width: `${reputation}%` }}
                            />
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                  <Link href={isAuthenticated ? "/community/communities/create" : "/login?callbackUrl=/community/communities/create"}>
                    <div
                      className="flex-shrink-0 snap-start flex flex-col items-center justify-center gap-2"
                      style={{
                        width: 100,
                        height: 120,
                        backgroundColor: 'transparent',
                        borderRadius: mobileTheme.borderRadius.lg,
                        border: `1px dashed ${mobileTheme.colors.border.light}`
                      }}
                    >
                      <Plus size={20} style={{ color: mobileTheme.colors.primary[500] }} />
                      <span style={{ fontSize: mobileTheme.typography.fontSize.xs, color: mobileTheme.colors.text.tertiary }}>
                        Crear
                      </span>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </section>

          {/* Filtros - Pills horizontales */}
          <div
            className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide"
            style={{ paddingLeft: mobileTheme.spacing.lg, paddingRight: mobileTheme.spacing.lg }}
          >
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all"
                style={{
                  backgroundColor: activeFilter === filter.id ? mobileTheme.colors.primary[500] : mobileTheme.colors.background.card,
                  color: activeFilter === filter.id ? '#fff' : mobileTheme.colors.text.secondary,
                  fontSize: mobileTheme.typography.fontSize.sm,
                  fontWeight: activeFilter === filter.id ? 600 : 500,
                  border: `1px solid ${activeFilter === filter.id ? mobileTheme.colors.primary[500] : mobileTheme.colors.border.light}`
                }}
              >
                <filter.icon size={14} />
                {filter.label}
              </motion.button>
            ))}
          </div>

          {/* Tabs de tipo de contenido */}
          <div
            className="flex gap-1 overflow-x-auto scrollbar-hide mb-4"
            style={{
              paddingLeft: mobileTheme.spacing.lg,
              paddingRight: mobileTheme.spacing.lg,
              borderBottom: `1px solid ${mobileTheme.colors.border.light}`
            }}
          >
            {viewTabs.map((item) => (
              <button
                key={item.type}
                onClick={() => setActiveView(item.type)}
                className="px-4 py-3 whitespace-nowrap transition-all"
                style={{
                  fontSize: mobileTheme.typography.fontSize.sm,
                  fontWeight: activeView === item.type ? 600 : 400,
                  color: activeView === item.type ? mobileTheme.colors.primary[500] : mobileTheme.colors.text.tertiary,
                  borderBottom: activeView === item.type ? `2px solid ${mobileTheme.colors.primary[500]}` : '2px solid transparent'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Guest Banner - Mobile */}
          {!isAuthenticated && (
            <div
              className="mx-4 mb-4 p-4 rounded-xl flex items-center gap-3"
              style={{
                backgroundColor: mobileTheme.colors.background.card,
                border: `1px solid ${mobileTheme.colors.border.light}`,
                borderLeft: `3px solid ${mobileTheme.colors.primary[500]}`
              }}
            >
              <Terminal size={20} style={{ color: mobileTheme.colors.primary[500] }} />
              <div className="flex-1">
                <p style={{ fontSize: mobileTheme.typography.fontSize.sm, color: mobileTheme.colors.text.primary, fontWeight: 500 }}>
                  Modo Invitado
                </p>
                <p style={{ fontSize: mobileTheme.typography.fontSize.xs, color: mobileTheme.colors.text.tertiary }}>
                  Inicia sesión para participar
                </p>
              </div>
              <Link href="/login?callbackUrl=/community">
                <button
                  className="px-3 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: mobileTheme.colors.primary[500],
                    color: '#fff',
                    fontSize: mobileTheme.typography.fontSize.sm,
                    fontWeight: 600
                  }}
                >
                  Acceder
                </button>
              </Link>
            </div>
          )}

          {/* Feed de posts - Mobile */}
          <div style={{ paddingLeft: mobileTheme.spacing.lg, paddingRight: mobileTheme.spacing.lg }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: mobileTheme.colors.primary[500] }}
                />
              </div>
            ) : posts.length === 0 ? (
              <div
                className="p-8 text-center flex flex-col items-center gap-4"
                style={{
                  backgroundColor: mobileTheme.colors.background.card,
                  borderRadius: mobileTheme.borderRadius.lg
                }}
              >
                <div
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: mobileTheme.colors.background.elevated }}
                >
                  <MessageSquare size={32} style={{ color: mobileTheme.colors.primary[500] }} />
                </div>
                <div>
                  <h3
                    className="font-bold mb-1"
                    style={{ color: mobileTheme.colors.text.primary, fontSize: mobileTheme.typography.fontSize.lg }}
                  >
                    Sin publicaciones
                  </h3>
                  <p style={{ color: mobileTheme.colors.text.secondary, fontSize: mobileTheme.typography.fontSize.sm }}>
                    Sé el primero en compartir algo
                  </p>
                </div>
                <Link href={isAuthenticated ? "/community/create" : "/login?callbackUrl=/community/create"}>
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl"
                    style={{
                      backgroundColor: mobileTheme.colors.primary[500],
                      color: '#fff',
                      fontWeight: 600
                    }}
                  >
                    <Plus size={18} />
                    Crear Post
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                <AnimatePresence mode="popLayout">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <PostCard
                        post={post}
                        onVote={votePost}
                        onSave={savePost}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full py-3 rounded-xl transition-colors"
                    style={{
                      backgroundColor: mobileTheme.colors.background.card,
                      color: mobileTheme.colors.text.secondary,
                      border: `1px solid ${mobileTheme.colors.border.light}`
                    }}
                  >
                    {loading ? 'Cargando...' : 'Cargar más'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Botón flotante crear post */}
          <Link href={isAuthenticated ? "/community/create" : "/login?callbackUrl=/community/create"}>
            <motion.button
              className="fixed bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30"
              style={{
                backgroundColor: mobileTheme.colors.primary[500],
                boxShadow: `0 4px 14px ${mobileTheme.colors.primary[500]}60`
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={24} color="#fff" />
            </motion.button>
          </Link>
        </PullToRefresh>
      </div>

      {/* Desktop View - Diseño original cyberpunk */}
      <div className="hidden lg:block w-full min-h-screen bg-[#121212] text-neutral-200 font-sans selection:bg-[#6366f1] selection:text-white">

        {/* Contenedor Principal con Max Width para pantallas muy grandes */}
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">

          {/* --- HEADER DE SECCIÓN --- */}
          <div className="flex flex-col justify-start mb-8 gap-4 border-b border-[#333] pb-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="text-[#6366f1] text-2xl">///</span> Community Hub
              </h1>
              <p className="text-neutral-400 mt-1 text-sm font-mono">
                [SYSTEM]: Conecta, comparte y aprende con creadores de IAs.
              </p>
            </div>
          </div>

          {/* --- SYSTEM ALERT (Banner Invitado) --- */}
          {!isAuthenticated && (
            <div className="w-full bg-[#161616] border border-[#333] border-l-4 border-l-[#6366f1] rounded-r-lg p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm relative overflow-hidden group">
              {/* Efecto decorativo de fondo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

              <div className="flex items-center gap-4 z-10 w-full sm:w-auto">
                <div className="w-10 h-10 bg-[#1E1E1E] border border-[#333] rounded-lg flex items-center justify-center text-[#6366f1] shrink-0">
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm flex items-center gap-2">
                    Navegando en Modo Invitado
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#333] text-neutral-400 font-mono border border-[#444]">READ_ONLY</span>
                  </h3>
                  <p className="text-neutral-400 text-xs mt-0.5">Inicia sesión para inicializar posts, comentar y votar en el sistema.</p>
                </div>
              </div>
              <Link href="/login?callbackUrl=/community">
                <button className="w-full sm:w-auto whitespace-nowrap px-4 py-2 bg-transparent border border-[#333] hover:border-[#6366f1] text-neutral-300 hover:text-white rounded-lg text-sm transition-colors z-10 font-medium">
                  Acceder
                </button>
              </Link>
            </div>
          )}

          {/* --- TOOLBAR & FILTERS --- */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">

            {/* Search Bar */}
            <div className="relative flex-grow lg:max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Buscar posts, IAs, usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333] text-white text-sm rounded-lg focus:ring-1 focus:ring-[#6366f1] focus:border-[#6366f1] block pl-10 p-3 placeholder-neutral-600 transition-all shadow-inner"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-neutral-600 text-xs font-mono border border-[#333] rounded px-1.5 py-0.5">CTRL+K</span>
              </div>
            </div>

            {/* Filters Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${activeFilter === filter.id
                    ? 'bg-[#1E1E1E] border-[#6366f1] text-[#6366f1] shadow-[0_2px_10px_rgba(0,0,0,0.3)]'
                    : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-[#1E1E1E] hover:border-[#333]'
                    }`}
                >
                  <filter.icon size={16} />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <PullToRefresh onRefresh={async () => { await refresh(); }} className="lg:h-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* --- MAIN CONTENT (FEED) --- */}
              <div className="lg:col-span-8 space-y-6">

                {/* Sub-filters / View types */}
                <div className="flex gap-1 border-b border-[#333] overflow-x-auto scrollbar-hide">
                  {viewTabs.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => setActiveView(item.type)}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeView === item.type
                        ? 'border-[#6366f1] text-white bg-[#1E1E1E]/50'
                        : 'border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-[#1E1E1E]/30'
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Feed Content */}
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366f1]"></div>
                  </div>
                ) : posts.length === 0 ? (
                  /* EMPTY STATE */
                  <div className="bg-[#1E1E1E] border border-[#333] rounded-lg p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm relative overflow-hidden">
                    {/* Background Grid Pattern (Simulated with CSS) */}
                    <div
                      className="absolute inset-0 opacity-5"
                      style={{
                        backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }}
                    ></div>

                    <div className="relative mb-6 group cursor-default">
                      <div className="absolute -inset-4 bg-[#6366f1] rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-500"></div>
                      <div className="relative bg-[#161616] border border-[#333] p-6 rounded-xl shadow-2xl">
                        <MessageSquare size={48} className="text-[#6366f1]" />
                        <div className="absolute -top-3 -right-3 bg-[#1E1E1E] rounded-full p-1 border border-[#333]">
                          <Zap size={20} className="text-yellow-500 fill-yellow-500 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2 relative z-10">Inicializa la conversación</h2>
                    <p className="text-neutral-400 max-w-md mb-8 text-sm relative z-10 leading-relaxed">
                      No se han detectado transmisiones de datos en este canal. Sé el primero en compartir tu constructo de IA o iniciar una discusión técnica.
                    </p>

                    <Link href={isAuthenticated ? "/community/create" : "/login?callbackUrl=/community/create"}>
                      <button className="relative z-10 flex items-center gap-2 px-6 py-3 bg-[#6366f1] hover:bg-indigo-600 hover:scale-105 active:scale-95 text-white rounded-lg font-bold transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] border border-indigo-500">
                        <Plus size={18} />
                        Crear Primer Post
                      </button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Posts List */}
                    <AnimatePresence mode="popLayout">
                      {posts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <PostCard
                            post={post}
                            onVote={votePost}
                            onSave={savePost}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Load More */}
                    {hasMore && (
                      <div className="flex justify-center pt-6">
                        <button
                          onClick={loadMore}
                          disabled={loading}
                          className="px-6 py-3 border border-[#333] hover:border-[#6366f1] text-neutral-300 hover:text-white rounded-lg transition-colors min-h-[44px] bg-transparent"
                        >
                          {loading ? 'Cargando...' : 'Cargar más'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* --- SIDEBAR --- */}
              <div className="lg:col-span-4 space-y-6">

                {/* Popular Communities Card */}
                <div className="bg-[#1E1E1E] border border-[#333] rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#252525]/50">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#6366f1]" />
                      <h3 className="font-bold text-white text-sm tracking-wide">COMUNIDADES_TOP</h3>
                    </div>
                    <MoreHorizontal size={16} className="text-neutral-500 cursor-pointer hover:text-white" />
                  </div>

                  <div className="p-4 space-y-5">
                    {communitiesLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-12 bg-[#252525] rounded-lg" />
                          </div>
                        ))}
                      </div>
                    ) : popularCommunities.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-neutral-400 mb-2">
                          Aún no hay comunidades creadas
                        </p>
                        <p className="text-xs text-neutral-500">
                          ¡Sé el primero en crear una!
                        </p>
                      </div>
                    ) : (
                      popularCommunities.map((comm, index) => {
                        // Simulamos un valor de reputación basado en el número de miembros
                        const reputation = Math.min(95, 50 + (comm.memberCount / 100));
                        const style = getReputationStyle(reputation);

                        return (
                          <div key={comm.id} className="group cursor-pointer">
                            <Link href={`/community/${comm.slug}`}>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="relative">
                                  <div
                                    className="w-10 h-10 bg-[#121212] border border-[#333] rounded-lg flex items-center justify-center group-hover:border-neutral-500 transition-colors"
                                  >
                                    <span className="text-xs font-bold text-neutral-400 font-mono">
                                      {comm.name.substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 bg-[#1E1E1E] text-[10px] font-bold text-[#6366f1] border border-[#333] px-1 rounded flex items-center">
                                    #{index + 1}
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-neutral-200 group-hover:text-[#6366f1] transition-colors truncate">
                                    {comm.name}
                                  </h4>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-neutral-500 font-mono">
                                      {comm.memberCount.toLocaleString()} mbrs
                                    </span>
                                    {/* Etiqueta de texto coloreada según la reputación */}
                                    <span className={`text-[10px] font-bold ${style.text}`}>
                                      REP: {style.label}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* TechBar: Indicador de Salud/Reputación */}
                              <div className="w-full h-1.5 bg-[#121212] rounded-full overflow-hidden flex" title={`Nivel de Salud: ${Math.round(reputation)}%`}>
                                <div
                                  className={`h-full transition-all duration-500 ${style.color} ${style.shadow}`}
                                  style={{ width: `${reputation}%` }}
                                ></div>
                                <div className="h-full flex-1 bg-[#1a1a1a]"></div>
                              </div>
                            </Link>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="px-4 pb-4 grid grid-cols-2 gap-3 pt-2">
                    <Link href="/community/explore">
                      <button className="w-full px-3 py-2 text-xs font-medium border border-[#333] rounded-lg text-neutral-400 hover:text-white hover:bg-[#252525] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                        Ver Index
                      </button>
                    </Link>
                    <Link href={isAuthenticated ? "/community/communities/create" : "/login?callbackUrl=/community/communities/create"}>
                      <button className="w-full px-3 py-2 text-xs font-bold bg-[#6366f1] text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                        <Plus size={12} />
                        Crear
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Rules Card */}
                <div className="bg-[#1E1E1E] border border-[#333] rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-[#333] flex items-center gap-2 bg-[#252525]/50">
                    <BookOpen size={16} className="text-[#6366f1]" />
                    <h3 className="font-bold text-white text-sm tracking-wide">PROTOCOLOS</h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-3">
                      {rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-neutral-400">
                          <div className="mt-1.5 min-w-[6px] h-[6px] bg-[#333] rounded-sm group-hover:bg-[#6366f1]"></div>
                          <span className="leading-snug">{rule}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-3 border-t border-[#333] flex items-center justify-between text-xs text-neutral-500 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Shield size={12} />
                        <span>MOD: AUTO_LEVEL_4</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-900 border border-green-700"></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </PullToRefresh>
        </div>
      </div>
    </ErrorBoundary>
  );
}
