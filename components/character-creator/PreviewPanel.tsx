'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Heart,
  MapPin,
  Briefcase,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CharacterDraft } from '@/types/character-wizard';

/**
 * PreviewPanel - Live character preview with glassmorphism
 *
 * Design Philosophy:
 * - Glassmorphism cards for depth and modernity
 * - Real-time updates as user fills the wizard
 * - Smooth animations for each property change
 * - Collapsible on mobile to save space
 * - Visual hierarchy that guides the eye
 *
 * Inspiration: Apple's iOS design, Notion's side peek, Arc's preview panel
 */

interface PreviewPanelProps {
  character: CharacterDraft;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

export function PreviewPanel({
  character,
  isOpen,
  onClose,
  className = '',
}: PreviewPanelProps) {
  const hasBasicInfo = character.name || character.age || character.occupation;
  const hasPersonality = character.traits && character.traits.length > 0 || character.personality || character.purpose;
  const hasBackground = character.backstory || character.physicalAppearance || character.education;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className={`
            fixed lg:sticky top-0 right-0 h-screen
            w-full sm:w-96 lg:w-[420px]
            bg-gradient-to-br from-background/95 via-background/90 to-background/95
            backdrop-blur-2xl
            border-l border-border/50
            shadow-2xl
            overflow-hidden
            z-50 lg:z-auto
            ${className}
          `}
        >
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-400/5 via-transparent to-brand-secondary-500/5 pointer-events-none" />

          {/* Animated background blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary-400/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />

          {/* Content */}
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50 backdrop-blur-sm bg-background/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-brand-primary-400/20 to-brand-secondary-500/20 backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-brand-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Preview</h3>
                  <p className="text-xs text-muted-foreground">
                    Live character preview
                  </p>
                </div>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-muted/50 transition-colors touch-target lg:hidden"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {/* Avatar & Name Section */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-xl border border-border/50">
                  {/* Avatar */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Avatar className="w-24 h-24 ring-4 ring-brand-primary-400/20 ring-offset-4 ring-offset-background">
                      <AvatarImage
                        src={character.avatar}
                        alt={character.name || 'Character'}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-brand-primary-400 to-brand-secondary-500 text-white text-2xl font-bold">
                        {character.name
                          ? character.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : '?'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-primary-400 to-brand-secondary-500 blur-xl opacity-20 animate-pulse" />
                  </motion.div>

                  {/* Name */}
                  <div className="text-center space-y-1">
                    <AnimatePresence mode="wait">
                      {character.name ? (
                        <motion.h2
                          key={character.name}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="text-2xl font-bold bg-gradient-to-r from-brand-primary-400 to-brand-secondary-500 bg-clip-text text-transparent"
                        >
                          {character.name}
                        </motion.h2>
                      ) : (
                        <motion.p
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-lg text-muted-foreground"
                        >
                          Unnamed Character
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {character.occupation && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-muted-foreground"
                      >
                        {character.occupation}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Basic Info Cards */}
              {hasBasicInfo && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Basic Info
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {character.age && (
                      <InfoCard
                        icon={<Calendar className="w-4 h-4" />}
                        label="Age"
                        value={`${character.age} years`}
                      />
                    )}

                    {character.gender && (
                      <InfoCard
                        icon={<User className="w-4 h-4" />}
                        label="Gender"
                        value={character.gender}
                      />
                    )}

                    {character.location && (
                      <InfoCard
                        icon={<MapPin className="w-4 h-4" />}
                        label="Location"
                        value={`${character.location.city}, ${character.location.country}`}
                        className="col-span-2"
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {/* Personality */}
              {hasPersonality && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5" />
                    Personality
                  </h4>

                  {character.personality && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">
                        Description
                      </p>
                      <p className="text-sm leading-relaxed">
                        {character.personality}
                      </p>
                    </div>
                  )}

                  {character.purpose && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">
                        Purpose & Role
                      </p>
                      <p className="text-sm leading-relaxed">
                        {character.purpose}
                      </p>
                    </div>
                  )}

                  {character.traits && character.traits.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Traits</p>
                      <div className="flex flex-wrap gap-2">
                        {character.traits.map((trait, index) => (
                          <motion.span
                            key={trait}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-brand-primary-400/10 to-brand-secondary-500/10 border border-brand-primary-400/20 text-foreground backdrop-blur-sm"
                          >
                            {trait}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Background */}
              {hasBackground && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Background
                  </h4>

                  {character.physicalAppearance && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">
                        Physical Appearance
                      </p>
                      <p className="text-sm leading-relaxed">
                        {character.physicalAppearance}
                      </p>
                    </div>
                  )}

                  {character.backstory && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">
                        Backstory
                      </p>
                      <p className="text-sm leading-relaxed">
                        {character.backstory}
                      </p>
                    </div>
                  )}

                  {character.education && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">
                        Education
                      </p>
                      <p className="text-sm leading-relaxed">
                        {character.education}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Empty state */}
              {!hasBasicInfo && !hasPersonality && !hasBackground && (
                <motion.div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-[200px]">
                    Start filling the form to see your character come to life
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/**
 * InfoCard - Small glassmorphic card for displaying character info
 */
interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}

function InfoCard({ icon, label, value, className = '' }: InfoCardProps) {
  return (
    <motion.div
      className={`
        p-3 rounded-xl
        bg-gradient-to-br from-muted/50 to-muted/30
        backdrop-blur-sm
        border border-border/50
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground truncate">{value}</p>
    </motion.div>
  );
}
