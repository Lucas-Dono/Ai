'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  Heart,
  BookOpen,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Edit,
  Eye,
  Brain,
  Users,
  Calendar,
  Crown,
  Lock,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StepContainer } from '../StepContainer';
import { useWizard } from '../WizardShell';
import { useRouter } from 'next/navigation';
import { GodModeModal, DEFAULT_GOD_MODE_CONFIG } from '../god-mode';
import type { GodModeConfig } from '@/types/god-mode';

/**
 * ReviewStep - Step 4: Final review & submission
 *
 * Shows a complete summary of the character
 * Validates all required fields
 * Calls backend API to create character
 * Handles success/error states
 */

export function ReviewStep() {
  const { characterDraft, goToStep } = useWizard();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [godModeOpen, setGodModeOpen] = useState(false);
  const [godModeConfig, setGodModeConfig] = useState<GodModeConfig>(DEFAULT_GOD_MODE_CONFIG);

  // Validation checks
  const validations = {
    hasName: !!characterDraft.name && characterDraft.name.length > 0,
    hasAge: !!characterDraft.age && characterDraft.age >= 13 && characterDraft.age <= 150,
    hasGender: !!characterDraft.gender,
    hasLocation: !!characterDraft.location?.verified,
    hasPersonality: !!characterDraft.personality && characterDraft.personality.length >= 10,
    hasPurpose: !!characterDraft.purpose && characterDraft.purpose.length >= 10,
    hasTraits: !!characterDraft.traits && characterDraft.traits.length >= 1,
  };

  const allValid = Object.values(validations).every(v => v);
  const missingFields = Object.entries(validations)
    .filter(([_, valid]) => !valid)
    .map(([field]) => field);

  const handleCreateCharacter = async () => {
    if (!allValid) {
      setError('Please complete all required fields');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Prepare draft for backend
      const draftForBackend = {
        ...characterDraft,
        version: '2.0' as const,
        // God Mode config
        godModeConfig: godModeConfig.enabled ? godModeConfig : undefined,
        // Remove UI-only fields
        _uiState: undefined,
        createdAt: undefined,
        lastModified: undefined,
      };

      const response = await fetch('/api/v2/characters/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: draftForBackend }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success! Redirect to character page
        router.push(`/agent/${result.agentId}`);
      } else {
        setError(result.error || 'Failed to create character');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <StepContainer
      title="Review & Create"
      description="Review your character before creating"
    >
      <div className="space-y-8">
        {/* Validation Status */}
        <div className={`p-6 rounded-xl border-2 ${
          allValid
            ? 'border-green-500 bg-green-500/10'
            : 'border-orange-500 bg-orange-500/10'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {allValid ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {allValid ? 'Ready to Create!' : 'Missing Required Fields'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {allValid
                  ? 'All required fields are complete'
                  : `Please complete: ${missingFields.join(', ')}`
                }
              </p>
            </div>
          </div>

          {!allValid && (
            <div className="space-y-2 mt-4">
              {!validations.hasName && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Name is required</span>
                  <Button variant="link" size="sm" onClick={() => goToStep('basics')} className="ml-auto">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              )}
              {!validations.hasAge && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Age must be between 13-150</span>
                  <Button variant="link" size="sm" onClick={() => goToStep('basics')} className="ml-auto">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              )}
              {!validations.hasGender && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Gender is required</span>
                  <Button variant="link" size="sm" onClick={() => goToStep('basics')} className="ml-auto">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              )}
              {!validations.hasLocation && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Location must be verified</span>
                  <Button variant="link" size="sm" onClick={() => goToStep('basics')} className="ml-auto">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              )}
              {!validations.hasPersonality && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Personality description required (min 10 chars)</span>
                  <Button variant="link" size="sm" onClick={() => goToStep('personality')} className="ml-auto">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              )}
              {!validations.hasPurpose && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Purpose description required (min 10 chars)</span>
                  <Button variant="link" size="sm" onClick={() => goToStep('personality')} className="ml-auto">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              )}
              {!validations.hasTraits && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>At least 1 trait is required</span>
                  <Button variant="link" size="sm" onClick={() => goToStep('personality')} className="ml-auto">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Character Summary */}
        <div className="space-y-6">
          {/* Basics */}
          <motion.div
            className="p-6 rounded-xl border border-border bg-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-brand-primary-400" />
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <Button variant="ghost" size="sm" onClick={() => goToStep('basics')} className="ml-auto">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{characterDraft.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age:</span>
                <span className="font-medium">{characterDraft.age || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gender:</span>
                <span className="font-medium">{characterDraft.gender || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">
                  {characterDraft.location?.verified
                    ? `${characterDraft.location.city}, ${characterDraft.location.country}`
                    : 'Not verified'
                  }
                </span>
              </div>
            </div>
          </motion.div>

          {/* Personality */}
          <motion.div
            className="p-6 rounded-xl border border-border bg-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-brand-primary-400" />
              <h3 className="font-semibold text-lg">Personality</h3>
              <Button variant="ghost" size="sm" onClick={() => goToStep('personality')} className="ml-auto">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3 text-sm">
              {characterDraft.personality && (
                <div>
                  <div className="text-muted-foreground mb-1">Description:</div>
                  <p className="text-sm leading-relaxed">{characterDraft.personality}</p>
                </div>
              )}
              {characterDraft.purpose && (
                <div>
                  <div className="text-muted-foreground mb-1">Purpose:</div>
                  <p className="text-sm leading-relaxed">{characterDraft.purpose}</p>
                </div>
              )}
              {characterDraft.traits && characterDraft.traits.length > 0 && (
                <div>
                  <div className="text-muted-foreground mb-2">Traits:</div>
                  <div className="flex flex-wrap gap-2">
                    {characterDraft.traits.map(trait => (
                      <Badge key={trait} variant="secondary">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Background (if any fields filled) */}
          {(characterDraft.backstory || characterDraft.physicalAppearance || characterDraft.occupation || characterDraft.education) && (
            <motion.div
              className="p-6 rounded-xl border border-border bg-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-brand-primary-400" />
                <h3 className="font-semibold text-lg">Background</h3>
                <Button variant="ghost" size="sm" onClick={() => goToStep('background')} className="ml-auto">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                {characterDraft.physicalAppearance && (
                  <div>
                    <div className="text-muted-foreground mb-1">Appearance:</div>
                    <p className="text-sm leading-relaxed">{characterDraft.physicalAppearance}</p>
                  </div>
                )}
                {characterDraft.backstory && (
                  <div>
                    <div className="text-muted-foreground mb-1">Backstory:</div>
                    <p className="text-sm leading-relaxed">{characterDraft.backstory}</p>
                  </div>
                )}
                {characterDraft.occupation && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Occupation:</span>
                    <span className="font-medium">{characterDraft.occupation}</span>
                  </div>
                )}
                {characterDraft.education && (
                  <div>
                    <div className="text-muted-foreground mb-1">Education:</div>
                    <p className="text-sm leading-relaxed">{characterDraft.education}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Appearance */}
          {characterDraft.characterAppearance && (
            <motion.div
              className="p-6 rounded-xl border border-border bg-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-5 h-5 text-brand-primary-400" />
                <h3 className="font-semibold text-lg">Appearance</h3>
                <Button variant="ghost" size="sm" onClick={() => goToStep('appearance')} className="ml-auto">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Style:</span>
                  <span className="font-medium capitalize">{characterDraft.characterAppearance.style}</span>
                </div>
                {characterDraft.characterAppearance.hairColor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hair:</span>
                    <span className="font-medium">
                      {characterDraft.characterAppearance.hairColor}
                      {characterDraft.characterAppearance.hairStyle && `, ${characterDraft.characterAppearance.hairStyle}`}
                    </span>
                  </div>
                )}
                {characterDraft.characterAppearance.eyeColor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Eyes:</span>
                    <span className="font-medium">{characterDraft.characterAppearance.eyeColor}</span>
                  </div>
                )}
                {characterDraft.characterAppearance.clothing && (
                  <div>
                    <div className="text-muted-foreground mb-1">Clothing:</div>
                    <p className="text-sm leading-relaxed">{characterDraft.characterAppearance.clothing}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Psychology */}
          {characterDraft.personalityCore && (
            <motion.div
              className="p-6 rounded-xl border border-border bg-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-5 h-5 text-brand-primary-400" />
                <h3 className="font-semibold text-lg">Psychology</h3>
                <Button variant="ghost" size="sm" onClick={() => goToStep('psychology')} className="ml-auto">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                {/* Big Five Summary */}
                <div>
                  <div className="text-muted-foreground mb-2">Big Five:</div>
                  <div className="grid grid-cols-5 gap-2">
                    {(['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const).map((trait) => (
                      <div key={trait} className="text-center">
                        <div className="text-xs text-muted-foreground capitalize">{trait.slice(0, 4)}</div>
                        <div className="font-mono font-medium">{characterDraft.personalityCore?.[trait] || 50}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Core Values */}
                {characterDraft.personalityCore.coreValues && characterDraft.personalityCore.coreValues.length > 0 && (
                  <div>
                    <div className="text-muted-foreground mb-2">Core Values:</div>
                    <div className="flex flex-wrap gap-2">
                      {characterDraft.personalityCore.coreValues.map((cv, i) => (
                        <Badge key={i} variant="secondary">{cv.value}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Relationships */}
          {((characterDraft.importantPeople && characterDraft.importantPeople.length > 0) ||
            (characterDraft.importantEvents && characterDraft.importantEvents.length > 0)) && (
            <motion.div
              className="p-6 rounded-xl border border-border bg-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-brand-primary-400" />
                <h3 className="font-semibold text-lg">Relationships & History</h3>
                <Button variant="ghost" size="sm" onClick={() => goToStep('relationships')} className="ml-auto">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4 text-sm">
                {/* Important People */}
                {characterDraft.importantPeople && characterDraft.importantPeople.length > 0 && (
                  <div>
                    <div className="text-muted-foreground mb-2 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Important People ({characterDraft.importantPeople.length}):
                    </div>
                    <div className="space-y-1">
                      {characterDraft.importantPeople.slice(0, 3).map((person, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{person.name}</span>
                          <span className="text-muted-foreground capitalize">{person.relationship}</span>
                        </div>
                      ))}
                      {characterDraft.importantPeople.length > 3 && (
                        <span className="text-muted-foreground">
                          +{characterDraft.importantPeople.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {/* Important Events */}
                {characterDraft.importantEvents && characterDraft.importantEvents.length > 0 && (
                  <div>
                    <div className="text-muted-foreground mb-2 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Important Events ({characterDraft.importantEvents.length}):
                    </div>
                    <div className="space-y-1">
                      {characterDraft.importantEvents.slice(0, 3).map((event, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{event.title || event.type}</span>
                          <span className="text-muted-foreground">{event.priority}</span>
                        </div>
                      ))}
                      {characterDraft.importantEvents.length > 3 && (
                        <span className="text-muted-foreground">
                          +{characterDraft.importantEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-xl border-2 border-destructive bg-destructive/10">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* God Mode Section */}
        <motion.div
          className="p-6 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">God Mode</h3>
                  <Badge variant="secondary" className="text-xs">BETA</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {godModeConfig.enabled
                    ? `${godModeConfig.visibility === 'private' ? 'Private' : 'Public'} • ${godModeConfig.initialRelationship !== 'stranger' ? 'Custom relationship' : 'Standard'}`
                    : 'Configure advanced relationship settings'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {godModeConfig.enabled && (
                <div className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400">
                  {godModeConfig.visibility === 'private' ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                </div>
              )}
              <Button
                variant={godModeConfig.enabled ? 'default' : 'outline'}
                onClick={() => setGodModeOpen(true)}
                className={godModeConfig.enabled ? 'bg-gradient-to-r from-purple-600 to-pink-500' : ''}
              >
                <Crown className="w-4 h-4 mr-2" />
                {godModeConfig.enabled ? 'Edit God Mode' : 'Configure'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Create Button */}
        <motion.div
          className="flex justify-center pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            size="lg"
            onClick={handleCreateCharacter}
            disabled={!allValid || isCreating}
            className="px-12 py-6 text-lg bg-gradient-to-r from-brand-primary-400 to-brand-secondary-500 hover:from-brand-primary-500 hover:to-brand-secondary-600 text-white border-0"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Character...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Create Character
              </>
            )}
          </Button>
        </motion.div>

        {/* God Mode Modal */}
        <GodModeModal
          open={godModeOpen}
          onOpenChange={setGodModeOpen}
          config={godModeConfig}
          onConfigChange={setGodModeConfig}
          characterName={characterDraft.name || 'Character'}
        />

        {isCreating && (
          <div className="text-center text-sm text-muted-foreground">
            <p>This may take 30-60 seconds...</p>
            <p className="mt-1">Generating personality, memories, events, and relationships</p>
          </div>
        )}
      </div>
    </StepContainer>
  );
}
