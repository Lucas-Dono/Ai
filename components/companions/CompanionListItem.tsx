'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Heart, MoreVertical, Zap, Star, Circle } from 'lucide-react';
import { generateGradient, getInitials } from '@/lib/utils';
import type { CategoryKey } from '@/lib/categories';
import { Badge } from '@/components/ui/badge';

interface CompanionListItemProps {
  id: string;
  name: string;
  description?: string;
  avatar?: string | null;
  categories?: CategoryKey[];
  generationTier?: string | null;
}

// Helper function to get complexity badge info
const getComplexityBadge = (tier?: string | null) => {
  switch (tier) {
    case 'ultra':
      return {
        label: 'Ultra',
        Icon: Zap,
        className: 'text-purple-400'
      };
    case 'plus':
      return {
        label: 'Plus',
        Icon: Star,
        className: 'text-blue-400'
      };
    case 'free':
    default:
      return {
        label: 'Free',
        Icon: Circle,
        className: 'text-gray-400'
      };
  }
};

export function CompanionListItem({
  id,
  name,
  description,
  avatar,
  categories,
  generationTier,
}: CompanionListItemProps) {
  const complexityBadge = getComplexityBadge(generationTier);
  const ComplexityIcon = complexityBadge.Icon;

  return (
    <Link href={`/agentes/${id}`}>
      <div className="group flex items-center gap-4 bg-gray-800/30 hover:bg-gray-800/50 p-3 md:p-4 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer">
        {/* Avatar */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-700">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <Avatar
              className="w-full h-full rounded-xl"
              style={{ background: generateGradient(name) }}
            >
              <AvatarFallback className="text-white text-xl font-bold bg-transparent rounded-xl">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Info */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold text-base md:text-lg truncate group-hover:text-purple-400 transition-colors">
              {name}
            </h3>
            {categories && categories.length > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded border border-gray-600/50 capitalize hidden sm:inline-flex"
              >
                {categories[0]}
              </Badge>
            )}
          </div>

          {description && (
            <p className="text-gray-400 text-sm line-clamp-1 md:line-clamp-2">
              {description}
            </p>
          )}

          {/* Tier badge en mobile */}
          <div className="flex items-center gap-2 mt-2 sm:hidden">
            <ComplexityIcon className={`w-3 h-3 ${complexityBadge.className}`} />
            <span className={`text-xs ${complexityBadge.className}`}>
              {complexityBadge.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-700/50 rounded-lg border border-gray-600/50">
            <ComplexityIcon className={`w-3.5 h-3.5 ${complexityBadge.className}`} />
            <span className={`text-xs font-medium ${complexityBadge.className}`}>
              {complexityBadge.label}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="p-2 hover:bg-purple-500/20 hover:text-purple-400 rounded-full transition-colors text-gray-400"
          >
            <Heart size={18} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="p-2 hover:bg-gray-700 rounded-full text-gray-400"
          >
            <MoreVertical size={18} />
          </button>
        </div>

        {/* Mobile chat button */}
        <div className="sm:hidden">
          <MessageCircle className="w-5 h-5 text-purple-400" />
        </div>
      </div>
    </Link>
  );
}
