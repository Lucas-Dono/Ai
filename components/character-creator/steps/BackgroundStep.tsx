'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Briefcase, GraduationCap, Image as ImageIcon, User, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { StepContainer, StepSection } from '../StepContainer';
import { useWizard } from '../WizardShell';
import { ImageUpload } from '../ImageUpload';

/**
 * BackgroundStep - Step 3: Character background & appearance
 *
 * Collects (all optional except backstory/appearance are nice-to-have):
 * - Physical appearance description
 * - Avatar URL
 * - Reference image URL
 * - Backstory
 * - Occupation (if not set in basics)
 * - Education
 * - NSFW mode toggle
 * - Allow develop traumas toggle
 */

export function BackgroundStep() {
  const { characterDraft, updateCharacter } = useWizard();

  const backstoryLength = characterDraft.backstory?.length || 0;
  const appearanceLength = characterDraft.physicalAppearance?.length || 0;
  const educationLength = characterDraft.education?.length || 0;
  const occupationLength = characterDraft.occupation?.length || 0;

  return (
    <StepContainer
      title="Background & Appearance"
      description="Tell us about your character's history and how they look"
    >
      <div className="space-y-8">
        {/* Physical Appearance */}
        <StepSection
          title="Physical Appearance"
          description="Describe how your character looks (optional but recommended)"
        >
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Textarea
              placeholder="e.g., Tall and athletic build with shoulder-length dark hair, usually worn in a messy bun. Has expressive brown eyes and a warm smile. Often wears comfortable casual clothes like jeans and oversized sweaters..."
              value={characterDraft.physicalAppearance || ''}
              onChange={(e) => updateCharacter({ physicalAppearance: e.target.value })}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {appearanceLength >= 10 ? 'Great!' : 'At least 10 characters recommended'}
              </span>
              <span className="text-muted-foreground">
                {appearanceLength} / 2000
              </span>
            </div>
          </motion.div>
        </StepSection>

        {/* Visual References */}
        <StepSection
          title="Visual References"
          description="Upload avatar or reference images (optional)"
        >
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Avatar Upload */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <ImageIcon className="w-4 h-4 text-brand-primary-400" />
                  Avatar Image
                </Label>
                <ImageUpload
                  value={characterDraft.avatar}
                  onChange={(url) => updateCharacter({ avatar: url })}
                  label="Upload Avatar"
                />
                <p className="text-xs text-muted-foreground">
                  Square format recommended
                </p>
              </div>

              {/* Reference Image Upload */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <ImageIcon className="w-4 h-4 text-brand-primary-400" />
                  Reference Image
                </Label>
                <ImageUpload
                  value={characterDraft.referenceImage}
                  onChange={(url) => updateCharacter({ referenceImage: url })}
                  label="Upload Reference"
                />
                <p className="text-xs text-muted-foreground">
                  Inspiration or reference photo
                </p>
              </div>
            </div>
          </motion.div>
        </StepSection>

        {/* Backstory */}
        <StepSection
          title="Backstory"
          description="What's your character's history?"
        >
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Textarea
              placeholder="e.g., Grew up in a small coastal town where they developed a love for the ocean. Moved to the city for university and never left. Studied marine biology but ended up working in environmental consulting. Has always been drawn to helping others and making a positive impact..."
              value={characterDraft.backstory || ''}
              onChange={(e) => updateCharacter({ backstory: e.target.value })}
              className="min-h-[150px] resize-none"
              maxLength={5000}
            />
            <div className="flex justify-end text-sm text-muted-foreground">
              {backstoryLength} / 5000
            </div>
          </motion.div>
        </StepSection>

        {/* Occupation & Education */}
        <StepSection
          title="Occupation & Education"
          description="Professional and educational background (optional)"
        >
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Occupation (if not already set in basics) */}
            <div className="space-y-3">
              <Label htmlFor="occupation-bg" className="flex items-center gap-2 text-base">
                <Briefcase className="w-4 h-4 text-brand-primary-400" />
                Current Occupation
              </Label>
              <Input
                id="occupation-bg"
                type="text"
                placeholder="e.g., Environmental Consultant"
                value={characterDraft.occupation || ''}
                onChange={(e) => updateCharacter({ occupation: e.target.value })}
                className="h-12"
                maxLength={200}
              />
              <div className="flex justify-end text-xs text-muted-foreground">
                {occupationLength} / 200
              </div>
            </div>

            {/* Education */}
            <div className="space-y-3">
              <Label htmlFor="education" className="flex items-center gap-2 text-base">
                <GraduationCap className="w-4 h-4 text-brand-primary-400" />
                Education Background
              </Label>
              <Textarea
                id="education"
                placeholder="e.g., B.S. in Marine Biology from University of California, Santa Cruz. Currently pursuing M.S. in Environmental Science..."
                value={characterDraft.education || ''}
                onChange={(e) => updateCharacter({ education: e.target.value })}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-end text-xs text-muted-foreground">
                {educationLength} / 500
              </div>
            </div>
          </motion.div>
        </StepSection>

        {/* Configuration Options */}
        <StepSection
          title="Advanced Settings"
          description="Configure how your character will develop"
        >
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* NSFW Mode */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
              <div className="flex-1 mr-4">
                <div className="font-medium mb-1">NSFW Mode</div>
                <div className="text-sm text-muted-foreground">
                  Allow mature/adult content in conversations (18+)
                </div>
              </div>
              <Switch
                checked={characterDraft.nsfwMode || false}
                onCheckedChange={(checked) => updateCharacter({ nsfwMode: checked })}
              />
            </div>

            {/* Allow Develop Traumas */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
              <div className="flex-1 mr-4">
                <div className="font-medium mb-1">Allow Character Development</div>
                <div className="text-sm text-muted-foreground">
                  Character can develop traumas, fears, or negative experiences over time based on conversations
                </div>
              </div>
              <Switch
                checked={characterDraft.allowDevelopTraumas || false}
                onCheckedChange={(checked) => updateCharacter({ allowDevelopTraumas: checked })}
              />
            </div>
          </motion.div>
        </StepSection>
      </div>
    </StepContainer>
  );
}
