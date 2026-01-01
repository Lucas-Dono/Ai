"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCharacterCategories, type CategoryKey } from "@/lib/categories";
import { useLocale } from "next-intl";
import { generateGradient } from "@/lib/utils";

interface CompanionCardProps {
  id: string;
  name: string;
  description?: string;
  avatar?: string | null;
  categories?: CategoryKey[];
  generationTier?: string | null;
  index?: number;
  onClick?: () => void;
}

const getTierBadge = (tier?: string | null) => {
  switch (tier) {
    case 'ultra':
      return {
        label: 'Ultra',
        className: 'bg-purple-600 text-white'
      };
    case 'plus':
      return {
        label: 'Plus',
        className: 'bg-blue-600 text-white'
      };
    case 'free':
    default:
      return {
        label: 'Free',
        className: 'bg-gray-600 text-gray-200'
      };
  }
};

export function CompanionCard({
  id,
  name,
  description,
  avatar,
  categories = [],
  generationTier,
  index = 0,
  onClick
}: CompanionCardProps) {
  const locale = useLocale();
  const tierBadge = getTierBadge(generationTier);
  const characterCategories = getCharacterCategories(categories);

  // Generar gradiente único basado en el nombre si no hay avatar
  const bgGradient = avatar ? undefined : generateGradient(name);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#141416] transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
      style={{ aspectRatio: '3/5' }}
      onClick={handleClick}
    >
      {/* Image Area */}
      <Link href={`/agentes/${id}`} className="relative w-full" style={{ aspectRatio: '1/1' }}>
        <div className="relative w-full h-full overflow-hidden">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover object-center transition-transform duration-400 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full transition-transform duration-400 group-hover:scale-105"
              style={{ background: bgGradient }}
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-t from-[#141416] to-transparent pointer-events-none" />
        </div>

        {/* Tier Badge */}
        <span
          className={`absolute top-3 left-3 z-10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded ${tierBadge.className}`}
        >
          {tierBadge.label}
        </span>
      </Link>

      {/* Content Area */}
      <div className="flex flex-1 flex-col bg-gradient-to-b from-[#141416] to-[#09090b] p-4">
        {/* Name */}
        <Link href={`/agentes/${id}`}>
          <h3 className="text-base font-bold text-white leading-tight mb-1.5 line-clamp-1 hover:underline">
            {name}
          </h3>
        </Link>

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Categories */}
        {characterCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {characterCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <span
                  key={category.key}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-full border ${category.color.text} ${category.color.border} ${category.color.bg}`}
                >
                  <IconComponent className="w-3 h-3" />
                  <span>{category.label[locale as 'en' | 'es']}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* CTA Button */}
        <Link href={`/agentes/${id}`} className="mt-auto block">
          <Button
            className="w-full bg-[#27272a] text-gray-200 hover:bg-[#3f3f46] hover:text-white transition-all duration-150 rounded-lg py-2.5 text-[13px] font-semibold"
          >
            Comenzar chat
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}
