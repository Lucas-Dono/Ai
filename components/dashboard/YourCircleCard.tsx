/**
 * Tarjeta de Conversación - Tu Círculo
 * Usa el mismo diseño que CompanionCard para consistencia visual
 */

'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateGradient } from "@/lib/utils";

interface YourCircleCardProps {
  agentId: string;
  agentName: string;
  agentAvatar: string | null;
  staticDescription: string;
  unreadCount: number;
  lastMessageAt: Date;
  isPinned: boolean;
  index: number;
}

export function YourCircleCard({
  agentId,
  agentName,
  agentAvatar,
  staticDescription,
  unreadCount,
  isPinned,
  index
}: YourCircleCardProps) {
  // Generar gradiente único basado en el nombre si no hay avatar
  const bgGradient = agentAvatar ? undefined : generateGradient(agentName);

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
    >
      {/* Image Area */}
      <Link href={`/agentes/${agentId}`} className="relative w-full" style={{ aspectRatio: '1/1' }}>
        <div className="relative w-full h-full overflow-hidden">
          {agentAvatar ? (
            <img
              src={agentAvatar}
              alt={agentName}
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

        {/* Unread Badge (reemplaza tier badge) */}
        {unreadCount > 0 && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-600 text-white">
            {unreadCount} {unreadCount === 1 ? 'NUEVO' : 'NUEVOS'}
          </span>
        )}

        {/* Pinned Badge */}
        {isPinned && (
          <span className="absolute top-3 right-3 z-10 px-2 py-1 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            📌
          </span>
        )}
      </Link>

      {/* Content Area */}
      <div className="flex flex-1 flex-col bg-gradient-to-b from-[#141416] to-[#09090b] p-4">
        {/* Name */}
        <Link href={`/agentes/${agentId}`}>
          <h3 className="text-base font-bold text-white leading-tight mb-1.5 line-clamp-1 hover:underline">
            {agentName}
          </h3>
        </Link>

        {/* Description */}
        {staticDescription && (
          <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">
            {staticDescription}
          </p>
        )}

        {/* CTA Button */}
        <Link href={`/agentes/${agentId}`} className="mt-auto block">
          <Button
            className="w-full bg-[#27272a] text-gray-200 hover:bg-[#3f3f46] hover:text-white transition-all duration-150 rounded-lg py-2.5 text-[13px] font-semibold"
          >
            {unreadCount > 0 ? 'Ver mensajes' : 'Continuar chat'}
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}
