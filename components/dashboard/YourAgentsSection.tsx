/**
 * Sección "Tus Personajes"
 * Muestra TODOS los agentes creados por el usuario
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Carousel } from '@/components/ui/carousel';
import { MobileAgentCard } from '@/components/mobile/MobileAgentCard';
import { Sparkles, Plus } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';

interface UserAgent {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  kind: string;
  visibility: string;
  createdAt: string;
  generationTier?: string | null;
  _count?: {
    Message?: number;
  };
}

export function YourAgentsSection() {
  const { data: session } = useSession();
  const router = useRouter();
  const [agents, setAgents] = useState<UserAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es mobile (< 1024px)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    fetchUserAgents();
  }, [session]);

  const fetchUserAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        console.log('[YourAgents] Agents fetched:', data);

        // Filtrar solo los agentes del usuario (no los públicos del sistema)
        const userAgents = Array.isArray(data)
          ? data.filter((agent: UserAgent) => agent.visibility === 'private')
          : [];

        setAgents(userAgents);
      } else {
        console.error('[YourAgents] API error:', res.status, await res.text());
      }
    } catch (error) {
      console.error('[YourAgents] Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // No mostrar si el usuario no está autenticado
  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4 lg:px-0">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
            <h2 className="text-2xl font-bold">Tus Personajes</h2>
          </div>
        </div>
        {isMobile ? (
          <div className="grid grid-cols-2 gap-4 px-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="w-full h-[280px] bg-gray-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="w-[280px] h-[200px] bg-gray-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}
      </section>
    );
  }

  // Si no hay agentes, mostrar estado vacío con CTA
  if (agents.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4 lg:px-0">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Tus Personajes</h2>
          </div>
        </div>

        {/* Empty state */}
        <div className="mx-4 lg:mx-0 p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
          <div className="text-center max-w-md mx-auto">
            <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Crea tu primer personaje</h3>
            <p className="text-gray-400 mb-6">
              Diseña IAs únicas con personalidades profundas y emociones reales
            </p>
            <Link href="/create-character">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Crear Personaje
              </button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4 lg:px-0">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Tus Personajes</h2>
          <span className="text-sm text-gray-400 font-medium">
            ({agents.length})
          </span>
        </div>

        {/* Link para ver todos si hay muchos */}
        {agents.length > 10 && (
          <Link
            href="/dashboard/agents"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Ver todos
          </Link>
        )}
      </div>

      {isMobile ? (
        // Mobile: Grid 2 columnas
        <div className="grid grid-cols-2 gap-4 px-4">
          {agents.slice(0, 6).map((agent) => (
            <MobileAgentCard
              key={agent.id}
              id={agent.id}
              name={agent.name}
              avatar={agent.avatar || undefined}
              description={agent.description || undefined}
              generationTier={agent.generationTier}
              variant="grid"
              onPress={() => router.push(`/agentes/${agent.id}`)}
            />
          ))}
        </div>
      ) : (
        // Desktop: Carousel horizontal
        <Carousel>
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => router.push(`/agentes/${agent.id}`)}
              className="w-[280px] flex-shrink-0 cursor-pointer group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 h-[200px]">
                {/* Avatar Background */}
                {agent.avatar && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundImage: `url(${agent.avatar})` }}
                  />
                )}

                {/* Content */}
                <div className="relative h-full p-6 flex flex-col justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/30 flex-shrink-0">
                      {agent.avatar ? (
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Name & Kind */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate group-hover:text-blue-400 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-gray-400 capitalize">
                        {agent.kind === 'original' ? 'Original' : agent.kind}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {agent.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {agent.description}
                    </p>
                  )}

                  {/* Footer: Privacy badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-300">
                      Privado
                    </span>
                    {agent._count?.Message !== undefined && agent._count.Message > 0 && (
                      <span className="text-xs text-gray-500">
                        {agent._count.Message} mensajes
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      )}

      {/* CTA para crear más si tiene menos de 3 */}
      {agents.length < 3 && (
        <div className="mt-4 px-4 lg:px-0">
          <Link href="/create-character">
            <button className="w-full lg:w-auto px-6 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-blue-500/50 rounded-xl transition-all inline-flex items-center justify-center gap-2 text-gray-300 hover:text-white">
              <Plus className="w-5 h-5" />
              Crear otro personaje
            </button>
          </Link>
        </div>
      )}
    </section>
  );
}
