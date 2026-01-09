/**
 * Tarjeta Especial para Personajes Históricos
 * Con diseño diferenciado: badge distintivo y borde dorado/ámbar
 */

'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { generateGradient, getInitials } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getStoryNicheConfig, type StoryNicheType } from '@/lib/stories/config';

interface StoryCompanionCardProps {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  categories?: string[];
  generationTier?: string | null;
  storyNiche: StoryNicheType;
  index: number;
}

export function StoryCompanionCard({
  id,
  name,
  description,
  avatar,
  storyNiche,
  index
}: StoryCompanionCardProps) {
  const nicheConfig = getStoryNicheConfig(storyNiche);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <Link href={`/agentes/${id}`}>
        <div className={`relative w-[280px] bg-gradient-to-br ${nicheConfig.bgColor} backdrop-blur-sm rounded-2xl p-5 border-2 ${nicheConfig.borderColor} hover:scale-105 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-xl`}>
          {/* Badge Distintivo */}
          <div className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${nicheConfig.badgeColor} border`}>
            {nicheConfig.badge.es}
          </div>

          {/* Avatar */}
          <div className="mb-4 flex justify-center">
            {avatar ? (
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg ring-2 ring-amber-500/50 transition-all group-hover:scale-110 group-hover:ring-amber-400">
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <Avatar
                className="w-20 h-20 rounded-full shadow-lg ring-2 ring-amber-500/50 transition-all group-hover:scale-110 group-hover:ring-amber-400"
                style={{ background: generateGradient(name) }}
              >
                <AvatarFallback className="text-white text-2xl font-bold bg-transparent">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Nombre */}
          <h3 className="text-lg font-bold text-white text-center mb-2 truncate">
            {name}
          </h3>

          {/* Descripción */}
          {description && (
            <p className="text-sm text-gray-300 text-center line-clamp-2 mb-4">
              {description}
            </p>
          )}

          {/* Efecto de brillo en hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
        </div>
      </Link>
    </motion.div>
  );
}
