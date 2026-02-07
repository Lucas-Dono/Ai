'use client';

import { motion } from 'framer-motion';
import { MessageCircle, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { mobileTheme } from '@/lib/mobile-theme';

interface MobileWorldCardProps {
  id: string;
  name: string;
  description: string;
  image?: string;
  category?: string;
  messagesCount?: number;
  isActive?: boolean;
  onPress: () => void;
}

/**
 * MobileWorldCard - Card component basado en el diseño de la app móvil
 *
 * Componente de card para mostrar mundos/personajes en la vista móvil.
 * Diseño sincronizado con el WorldCard de la app React Native.
 *
 * @component
 * @example
 * <MobileWorldCard
 *   id="1"
 *   name="Samantha"
 *   description="Tu compañera de IA personal"
 *   image="/images/samantha.jpg"
 *   category="Romance"
 *   messagesCount={145}
 *   isActive={true}
 *   onPress={() => navigate(`/chat/${id}`)}
 * />
 */
export default function MobileWorldCard({
  id,
  name,
  description,
  image,
  category,
  messagesCount = 0,
  isActive = false,
  onPress,
}: MobileWorldCardProps) {
  return (
    <motion.div
      className="lg:hidden relative w-[200px] h-[280px] rounded-2xl overflow-hidden cursor-pointer"
      style={{
        backgroundColor: mobileTheme.colors.background.card,
        boxShadow: mobileTheme.shadows.md,
      }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={onPress}
    >
      {/* Imagen de fondo con overlay gradient */}
      <div className="absolute inset-0">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="200px"
            priority={false}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${mobileTheme.colors.primary[600]}, ${mobileTheme.colors.secondary[600]})`,
            }}
          />
        )}

        {/* Overlay gradient - De transparente arriba a oscuro abajo */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 70%, rgba(0, 0, 0, 0.9) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-4">
        {/* Top badges */}
        <div className="flex items-start justify-between gap-2">
          {/* Badge de categoría */}
          {category && (
            <div
              className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                color: mobileTheme.colors.primary[300],
                border: `1px solid ${mobileTheme.colors.primary[400]}`,
              }}
            >
              {category}
            </div>
          )}

          {/* Badge de activo */}
          {isActive && (
            <div
              className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                color: mobileTheme.colors.success.light,
                border: `1px solid ${mobileTheme.colors.success.main}`,
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: mobileTheme.colors.success.main }}
              />
              Activo
            </div>
          )}
        </div>

        {/* Bottom content */}
        <div className="space-y-2">
          {/* Nombre - truncado a 1 línea */}
          <h3
            className="text-lg font-bold truncate"
            style={{ color: mobileTheme.colors.text.primary }}
          >
            {name}
          </h3>

          {/* Descripción - truncada a 2 líneas */}
          <p
            className="text-sm font-medium line-clamp-2"
            style={{
              color: mobileTheme.colors.text.secondary,
              lineHeight: mobileTheme.typography.lineHeight.normal,
            }}
          >
            {description}
          </p>

          {/* Footer con stats */}
          <div
            className="flex items-center justify-between pt-2 border-t"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            {/* Contador de mensajes */}
            <div className="flex items-center gap-1.5">
              <MessageCircle
                className="w-4 h-4"
                style={{ color: mobileTheme.colors.text.tertiary }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: mobileTheme.colors.text.tertiary }}
              >
                {messagesCount > 999
                  ? `${(messagesCount / 1000).toFixed(1)}k`
                  : messagesCount}
              </span>
            </div>

            {/* Chevron */}
            <ChevronRight
              className="w-5 h-5"
              style={{ color: mobileTheme.colors.text.tertiary }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
