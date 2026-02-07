'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { mobileTheme } from '@/lib/mobile-theme';

export interface MobileAgentCardProps {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  featured?: boolean;
  generationTier?: string | null;
  onPress: () => void;
  onChatPress?: () => void;
  /** Variante de tamaño: 'grid' para layout 2 columnas, 'carousel' para scroll horizontal */
  variant?: 'grid' | 'carousel';
}

/**
 * Obtiene el badge según el tier de generación
 * Sincronizado con CompanionCard (desktop)
 */
const getTierBadge = (tier?: string | null) => {
  switch (tier) {
    case 'ultra':
      return {
        label: 'ULTRA',
        className: 'bg-purple-600 text-white'
      };
    case 'plus':
      return {
        label: 'PLUS',
        className: 'bg-blue-600 text-white'
      };
    case 'free':
    default:
      return {
        label: 'FREE',
        className: 'bg-gray-600 text-gray-200'
      };
  }
};

/**
 * Genera un gradiente de colores basado en el hash del nombre
 * Para mantener consistencia con avatares sin imagen
 */
function generateGradient(name: string): [string, string] {
  // Crear un hash simple del nombre
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Colores disponibles para gradientes
  const gradientPairs: [string, string][] = [
    ['#8B5CF6', '#D946EF'], // purple-pink
    ['#6366F1', '#8B5CF6'], // indigo-purple
    ['#D946EF', '#F97316'], // pink-orange
    ['#F59E0B', '#EF4444'], // yellow-red
    ['#10B981', '#06B6D4'], // green-cyan
    ['#0EA5E9', '#8B5CF6'], // blue-purple
    ['#EC4899', '#8B5CF6'], // pink-purple
    ['#F97316', '#DC2626'], // orange-red
  ];

  // Seleccionar un par basado en el hash
  const index = Math.abs(hash) % gradientPairs.length;
  return gradientPairs[index];
}

/**
 * Obtiene las iniciales del nombre (máximo 2 caracteres)
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function MobileAgentCard({
  id,
  name,
  description,
  avatar,
  featured = false,
  generationTier,
  onPress,
  onChatPress,
  variant = 'grid',
}: MobileAgentCardProps) {
  const [imageError, setImageError] = useState(false);
  const [startColor, endColor] = generateGradient(name);
  const initials = getInitials(name);
  const tierBadge = getTierBadge(generationTier);

  // Dimensiones según variante - Mejoradas para mejor legibilidad
  const isCarousel = variant === 'carousel';
  const cardWidth = isCarousel ? 'w-[180px]' : 'w-full';
  const cardHeight = isCarousel ? 'h-[280px]' : 'h-[300px]';
  const imageHeight = isCarousel ? 'h-36' : 'h-44';
  const contentHeight = isCarousel ? 'h-[136px]' : 'h-[144px]';
  const initialsSize = isCarousel ? 'text-4xl' : 'text-5xl';

  const handleChatPress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChatPress) {
      onChatPress();
    } else {
      onPress();
    }
  };

  return (
    <motion.div
      className={`${cardWidth} ${cardHeight} rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 bg-gradient-to-b from-[#141416] to-[#09090b]`}
      style={{
        boxShadow: mobileTheme.shadows.md,
      }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onPress}
    >
      {/* Avatar/Image Section */}
      <div className={`relative w-full ${imageHeight}`}>
        {avatar && !imageError ? (
          <>
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 50vw, 200px"
              priority={false}
            />
            {/* Gradient Overlay - Sincronizado con desktop */}
            <div className={`absolute inset-x-0 bottom-0 ${isCarousel ? 'h-12' : 'h-[60px]'} bg-gradient-to-t from-[#141416] to-transparent pointer-events-none`} />
          </>
        ) : (
          <>
            {/* Gradiente generado si no hay imagen */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`,
              }}
            />
            {/* Iniciales */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`${initialsSize} font-bold`}
                style={{
                  color: mobileTheme.colors.text.primary,
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {initials}
              </span>
            </div>
            {/* Gradient Overlay - Sincronizado con desktop */}
            <div className={`absolute inset-x-0 bottom-0 ${isCarousel ? 'h-12' : 'h-[60px]'} bg-gradient-to-t from-[#141416] to-transparent pointer-events-none`} />
          </>
        )}

        {/* Tier Badge - Sincronizado con desktop */}
        <span
          className={`absolute top-2 left-2 z-10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded ${tierBadge.className}`}
        >
          {tierBadge.label}
        </span>

        {/* Featured Badge (opcional, en esquina derecha) */}
        {featured && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm z-10"
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.9)',
            }}
          >
            <Star size={12} fill="currentColor" className="text-white" />
            <span className="text-[9px] font-semibold text-white uppercase tracking-wider">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={`flex flex-col ${contentHeight} ${isCarousel ? 'p-3' : 'p-3.5'}`}>
        {/* Name */}
        <h3
          className={`${isCarousel ? 'text-sm' : 'text-base'} font-semibold mb-1.5 line-clamp-1`}
          style={{ color: mobileTheme.colors.text.primary }}
          title={name}
        >
          {name}
        </h3>

        {/* Description - Visible en ambas variantes */}
        {description && (
          <p
            className={`text-xs mb-3 flex-1 ${isCarousel ? 'line-clamp-2' : 'line-clamp-3'}`}
            style={{
              color: mobileTheme.colors.text.secondary,
              lineHeight: '1.4',
            }}
            title={description}
          >
            {description}
          </p>
        )}

        {/* Chat Button - Sincronizado con desktop */}
        <motion.button
          className={`flex items-center justify-center gap-1.5 ${isCarousel ? 'py-2 px-3' : 'py-2.5 px-3'} rounded-lg w-full transition-colors duration-150`}
          style={{
            backgroundColor: '#27272a',
            color: '#E5E5E5',
          }}
          whileTap={{ scale: 0.95 }}
          whileHover={{
            backgroundColor: '#3f3f46',
          }}
          onClick={handleChatPress}
        >
          <MessageCircle size={isCarousel ? 15 : 16} />
          <span className={`${isCarousel ? 'text-xs' : 'text-[13px]'} font-semibold`}>Chatear</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default MobileAgentCard;
