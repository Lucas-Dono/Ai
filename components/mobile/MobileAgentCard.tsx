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
  onPress: () => void;
  onChatPress?: () => void;
  /** Variante de tamaño: 'grid' para layout 2 columnas, 'carousel' para scroll horizontal */
  variant?: 'grid' | 'carousel';
}

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
  onPress,
  onChatPress,
  variant = 'grid',
}: MobileAgentCardProps) {
  const [imageError, setImageError] = useState(false);
  const [startColor, endColor] = generateGradient(name);
  const initials = getInitials(name);

  // Dimensiones según variante
  const isCarousel = variant === 'carousel';
  const cardWidth = isCarousel ? 'w-[150px]' : 'w-full';
  const cardHeight = isCarousel ? 'h-[200px]' : 'h-[260px]';
  const imageHeight = isCarousel ? 'h-24' : 'h-36';
  const contentHeight = isCarousel ? 'h-[104px]' : 'h-[116px]';
  const initialsSize = isCarousel ? 'text-3xl' : 'text-5xl';

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
      className={`${cardWidth} ${cardHeight} rounded-2xl overflow-hidden cursor-pointer flex-shrink-0`}
      style={{
        backgroundColor: mobileTheme.colors.background.card,
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
            {/* Overlay gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)`,
              }}
            />
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
            {/* Overlay gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.5) 100%)`,
              }}
            />
          </>
        )}

        {/* Featured Badge */}
        {featured && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.9)',
            }}
          >
            <Star size={12} fill="currentColor" className="text-white" />
            <span className="text-xs font-semibold text-white">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={`flex flex-col ${contentHeight} p-2 ${isCarousel ? 'p-2' : 'p-3'}`}>
        {/* Name */}
        <h3
          className={`${isCarousel ? 'text-sm' : 'text-base'} font-semibold mb-1 truncate`}
          style={{ color: mobileTheme.colors.text.primary }}
          title={name}
        >
          {name}
        </h3>

        {/* Description - solo en grid, oculto en carrusel */}
        {description && !isCarousel && (
          <p
            className="text-xs mb-3 flex-1"
            style={{
              color: mobileTheme.colors.text.secondary,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: '1.4',
            }}
            title={description}
          >
            {description}
          </p>
        )}

        {/* Chat Button */}
        <motion.button
          className={`flex items-center justify-center gap-1 ${isCarousel ? 'py-1.5 px-2 mt-auto' : 'py-2 px-3'} rounded-lg w-full`}
          style={{
            backgroundColor: mobileTheme.colors.primary[500],
            color: mobileTheme.colors.text.primary,
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleChatPress}
        >
          <MessageCircle size={isCarousel ? 14 : 16} />
          <span className={`${isCarousel ? 'text-xs' : 'text-sm'} font-semibold`}>Chatear</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default MobileAgentCard;
