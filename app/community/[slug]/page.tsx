/**
 * Community Detail Page - Página de una comunidad específica
 */

"use client";

import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  ArrowLeft,
  Settings,
  Share2,
  Star,
  Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCommunity } from "@/hooks/useCommunity";
import { useFeed } from "@/hooks/useFeed";
import { PostCard } from "@/components/community";
import { cn } from "@/lib/utils";
import { getCommunityImageStyles } from "@/lib/utils/community-image";

export default function CommunityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { community, topContributors, loading: communityLoading, joinCommunity, leaveCommunity } = useCommunity(slug);
  const { posts, loading: postsLoading, votePost, savePost } = useFeed({
    communityId: community?.id,
  });

  if (communityLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Comunidad no encontrada</h2>
          <p className="text-muted-foreground mb-4">La comunidad que buscas no existe.</p>
          <Link href="/community">
            <Button>Volver a Community</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Header with Banner */}
      <div className="relative">
        {/* Banner */}
        {community.banner && (() => {
          const bannerStyles = getCommunityImageStyles('banner' as const, 'large');
          return (
            <div className={bannerStyles.containerClass}>
              <img
                src={community.banner}
                alt={community.name}
                className={bannerStyles.imageClass}
              />
            </div>
          );
        })()}
        {!community.banner && (
          <div
            className="h-32 md:h-48"
            style={{
              background: `linear-gradient(135deg, ${community.primaryColor}40, ${community.primaryColor}20)`,
            }}
          />
        )}

        {/* Community Info */}
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="relative -mt-12 md:-mt-16">
            <div className="flex items-end gap-4 mb-6">
              {/* Icon */}
              {community.icon ? (() => {
                const iconStyles = getCommunityImageStyles('circle' as const, 'large');
                return (
                  <div className={`${iconStyles.containerClass} border-4 border-background`}>
                    <img
                      src={community.icon}
                      alt={community.name}
                      className={iconStyles.imageClass}
                    />
                  </div>
                );
              })() : (
                <div
                  className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-background flex items-center justify-center text-2xl md:text-4xl font-bold text-white"
                  style={{ backgroundColor: community.primaryColor }}
                >
                  {community.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              {/* Name & Stats */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{community.name}</h1>
                  {community.isOfficial && (
                    <div className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Official
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {community.memberCount.toLocaleString()} miembros
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {community.postCount.toLocaleString()} posts
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {community.isMember ? (
                  <>
                    {community.memberRole === 'owner' && (
                      <Link href={`/community/${slug}/settings`}>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" size="sm" onClick={leaveCommunity}>
                      Salir
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={joinCommunity}
                    style={{ backgroundColor: community.primaryColor }}
                    className="text-white"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Unirse
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6 max-w-3xl">
              {community.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Posts</h2>
              {community.isMember && (
                <Link href="/community/create">
                  <Button size="sm">Crear Post</Button>
                </Link>
              )}
            </div>

            {postsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-card/50 border border-border/50 rounded-2xl">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold mb-2">No hay posts todavía</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sé el primero en publicar en esta comunidad
                </p>
                {community.isMember && (
                  <Link href="/community/create">
                    <Button>Crear Primer Post</Button>
                  </Link>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onVote={votePost}
                  onSave={savePost}
                />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* About */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
              <h3 className="font-semibold mb-3">Acerca de</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Categoría: {community.category}</p>
                <p>Tipo: {community.type === 'public' ? 'Pública' : community.type === 'private' ? 'Privada' : 'Restringida'}</p>
                <p>
                  Creada el {new Date(community.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Rules */}
            {community.rules && (
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Reglas
                </h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {community.rules}
                </div>
              </div>
            )}

            {/* Top Contributors */}
            {topContributors.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
                <h3 className="font-semibold mb-3">Top Contributors</h3>
                <div className="space-y-3">
                  {topContributors.map((contributor, index) => (
                    <div key={contributor.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                        #{index + 1}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                        {contributor.image ? (
                          <img
                            src={contributor.image}
                            alt={contributor.name || 'Usuario'}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold">
                            {(contributor.name || 'U').slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{contributor.name || 'Usuario Anónimo'}</p>
                        <p className="text-xs text-muted-foreground">
                          {contributor.postCount || 0} posts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
