'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserLevelBadge } from './UserLevelBadge';
import { StreakFlame } from './StreakFlame';
import { XPProgressBar } from './XPProgressBar';
import { BadgeCard } from './BadgeCard';
import { BADGES } from '@/lib/services/reputation.service';
import { toast } from 'sonner';
import Link from 'next/link';

interface ProfileViewProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: Date;
  };
  reputation: any;
  stats: any;
  moderationStats?: {
    hiddenPosts: number;
    blockedUsers: number;
    contentPreferences: number;
  } | null;
  agents: any[];
  posts: any[];
  comments: any[];
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export function ProfileView({
  user,
  reputation,
  stats,
  moderationStats,
  agents,
  posts,
  comments,
  followersCount,
  followingCount,
  isFollowing: initialIsFollowing,
  isOwnProfile,
}: ProfileViewProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followers, setFollowers] = useState(followersCount);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}/follow`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        setFollowers(prev => data.following ? prev + 1 : prev - 1);
        toast.success(data.following ? 'Siguiendo usuario' : 'Dejaste de seguir');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Error al actualizar seguimiento');
    } finally {
      setLoading(false);
    }
  };

  const nextLevelXP = Math.floor(reputation.level ** 2 * 100);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="text-2xl">{user.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{user.name || 'Usuario'}</h1>
                <p className="text-muted-foreground">
                  Miembro desde {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              {!isOwnProfile && (
                <Button onClick={handleFollow} disabled={loading}>
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-6 mt-4">
              <UserLevelBadge level={reputation.level} size="md" />
              <StreakFlame streak={reputation.currentStreak} size="sm" />

              <div className="flex gap-4 text-sm">
                <div>
                  <span className="font-bold">{followers}</span>
                  <span className="text-muted-foreground ml-1">Seguidores</span>
                </div>
                <div>
                  <span className="font-bold">{followingCount}</span>
                  <span className="text-muted-foreground ml-1">Siguiendo</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <XPProgressBar
                currentXP={reputation.points}
                currentLevel={reputation.level}
                nextLevelXP={nextLevelXP}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{stats.aisCreated}</div>
          <div className="text-sm text-muted-foreground mt-1">IAs Creadas</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-blue-500">{reputation.points.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-1">Karma Total</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-purple-500">{stats.postCount}</div>
          <div className="text-sm text-muted-foreground mt-1">Posts</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-green-500">{stats.totalImports}</div>
          <div className="text-sm text-muted-foreground mt-1">Total Imports</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-orange-500">{stats.messagesSent}</div>
          <div className="text-sm text-muted-foreground mt-1">Mensajes</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-yellow-500">{reputation.longestStreak}</div>
          <div className="text-sm text-muted-foreground mt-1">Mejor Racha</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-pink-500">{stats.worldsCreated}</div>
          <div className="text-sm text-muted-foreground mt-1">Mundos</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-cyan-500">{reputation.badges.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Badges</div>
        </Card>
      </div>

      {/* Moderation Stats - Solo visible en perfil propio */}
      {isOwnProfile && moderationStats && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Moderación Personal</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Estadísticas de contenido filtrado y usuarios bloqueados
              </p>
            </div>
            <Link href="/configuracion/moderacion">
              <Button variant="outline" size="sm">
                Configurar Moderación
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card className="p-4 bg-orange-500/5 border-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-2xl">
                  <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500">
                    {moderationStats.hiddenPosts}
                  </div>
                  <div className="text-sm text-muted-foreground">Posts Ocultos</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-red-500/5 border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 rounded-2xl">
                  <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">
                    {moderationStats.blockedUsers}
                  </div>
                  <div className="text-sm text-muted-foreground">Usuarios Bloqueados</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-blue-500/5 border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {moderationStats.contentPreferences}
                  </div>
                  <div className="text-sm text-muted-foreground">Preferencias de Contenido</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-2xl">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Total de contenido filtrado:</strong>{' '}
              {moderationStats.hiddenPosts + moderationStats.blockedUsers + moderationStats.contentPreferences}{' '}
              elementos están siendo filtrados de tu feed para una mejor experiencia.
            </p>
          </div>
        </Card>
      )}

      {/* Badges */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Badges Ganados</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {reputation.badges.map((badge: any) => (
            <BadgeCard
              key={badge.id}
              icon={badge.icon}
              name={badge.name}
              description={badge.description}
              earned={true}
              earnedAt={badge.earnedAt}
            />
          ))}
        </div>
        {reputation.badges.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Aún no has ganado ningún badge. ¡Empieza a explorar!
          </p>
        )}
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Actividad</TabsTrigger>
          <TabsTrigger value="ais">IAs Creadas</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {[...posts.map(p => ({ type: 'post', ...p })), ...comments.map(c => ({ type: 'comment', ...c }))]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10)
                .map((item: any) => (
                  <div key={`${item.type}-${item.id}`} className="border-l-2 border-primary pl-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{item.type === 'post' ? '📝 Post' : '💬 Comentario'}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1">
                      {item.type === 'post' ? item.title : item.content.substring(0, 100)}
                    </p>
                    <div className="text-sm text-muted-foreground mt-1">
                      👍 {item.upvotes} upvotes
                    </div>
                  </div>
                ))}
              {posts.length === 0 && comments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No hay actividad reciente</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ais" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="p-4 hover:shadow-lg transition-shadow">
                <Link href={`/agentes/${agent.id}`}>
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={agent.image || undefined} />
                      <AvatarFallback>{agent.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {agent.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>📥 {agent.importCount} imports</span>
                        <span>⭐ {agent._count.ratings} ratings</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
          {agents.length === 0 && (
            <Card className="p-8">
              <p className="text-center text-muted-foreground">No hay IAs públicas</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-4">
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{post.content}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>👍 {post.upvotes} upvotes</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
          {posts.length === 0 && (
            <Card className="p-8">
              <p className="text-center text-muted-foreground">No hay posts</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Estadísticas Detalladas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IAs Creadas</span>
                  <span className="font-semibold">{stats.aisCreated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensajes Enviados</span>
                  <span className="font-semibold">{stats.messagesSent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mundos Creados</span>
                  <span className="font-semibold">{stats.worldsCreated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Behaviors Configurados</span>
                  <span className="font-semibold">{stats.behaviorsConfigured}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Eventos Importantes</span>
                  <span className="font-semibold">{stats.importantEvents}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posts</span>
                  <span className="font-semibold">{stats.postCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comentarios</span>
                  <span className="font-semibold">{stats.commentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Upvotes Recibidos</span>
                  <span className="font-semibold">{stats.receivedUpvotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Respuestas Aceptadas</span>
                  <span className="font-semibold">{stats.acceptedAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Imports</span>
                  <span className="font-semibold">{stats.totalImports}</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
