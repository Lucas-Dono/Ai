'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Clock,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from './ProgressIndicator';
import { PreviewPanel } from './PreviewPanel';
import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type {
  WizardStep,
  CharacterDraft,
  WizardContextValue,
} from '@/types/character-wizard';
import { WIZARD_STEPS } from '@/types/character-wizard';

/**
 * WizardShell - Main layout orchestrating the character creation flow
 *
 * Architecture:
 * - Provides context to all child steps
 * - Manages navigation and state
 * - Coordinates preview panel
 * - Handles auto-save
 * - Responsive: Sidebar on desktop, drawer on mobile
 *
 * Design Philosophy:
 * - Split-screen layout (progress | content | preview)
 * - Progress always visible on desktop
 * - Preview collapsible on tablet/mobile
 * - Floating action bar for navigation
 * - Professional, not playful
 */

interface WizardShellProps {
  children: React.ReactNode;
  onSave?: (draft: CharacterDraft) => Promise<void>;
  onSubmit?: (character: CharacterDraft) => Promise<void>;
  initialData?: Partial<CharacterDraft>;
  className?: string;
}

// Use the step order from WIZARD_STEPS configuration
const STEP_ORDER: WizardStep[] = WIZARD_STEPS.map(s => s.id);

// Create context for wizard state
export const WizardContext = React.createContext<WizardContextValue | null>(
  null
);

// Hook to access wizard context
export function useWizard() {
  const context = React.useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardShell');
  }
  return context;
}

export function WizardShell({
  children,
  onSave,
  onSubmit,
  initialData = {},
  className = '',
}: WizardShellProps) {
  const router = useRouter();

  // Load saved draft from localStorage with validation
  const loadSavedDraft = useCallback((): CharacterDraft | null => {
    if (typeof window === 'undefined') return null;

    try {
      const saved = localStorage.getItem('character-wizard-draft');
      if (!saved) return null;

      const parsed = JSON.parse(saved);

      // Basic validation - ensure it has expected structure
      if (typeof parsed !== 'object' || parsed === null) {
        console.warn('[WizardShell] Invalid draft structure, ignoring');
        return null;
      }

      // Validate required fields exist and have correct types
      if (parsed.name && typeof parsed.name !== 'string') {
        console.warn('[WizardShell] Invalid name type in draft');
        return null;
      }

      if (parsed.age && typeof parsed.age !== 'number') {
        console.warn('[WizardShell] Invalid age type in draft');
        return null;
      }

      // Validate arrays are actually arrays
      if (parsed.traits && !Array.isArray(parsed.traits)) {
        console.warn('[WizardShell] Invalid traits type in draft');
        return null;
      }

      return parsed as CharacterDraft;
    } catch (error) {
      console.error('[WizardShell] Failed to load draft:', error);
      return null;
    }
  }, []);

  // State management - single source of truth for draft
  const [currentStep, setCurrentStep] = useState<WizardStep>('basics');
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(
    new Set()
  );
  const [characterDraft, setCharacterDraft] = useState<CharacterDraft>(() => {
    // Try to load from localStorage with validation
    const savedDraft = loadSavedDraft();
    if (savedDraft) {
      return savedDraft;
    }
    return {
      ...initialData,
      createdAt: initialData.createdAt || new Date(),
      lastModified: new Date(),
    };
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  // Single autosave hook instance - no race condition
  const autosave = useDraftAutosave(characterDraft, true);

  // Navigation helpers
  const currentStepIndex = STEP_ORDER.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1;
  const canGoBack = currentStepIndex > 0;
  const canGoNext = currentStepIndex < STEP_ORDER.length - 1;

  // Navigation functions
  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToNextStep = useCallback(() => {
    if (canGoNext) {
      const nextStep = STEP_ORDER[currentStepIndex + 1];
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      goToStep(nextStep);
    }
  }, [canGoNext, currentStepIndex, currentStep, goToStep]);

  const goToPreviousStep = useCallback(() => {
    if (canGoBack) {
      const prevStep = STEP_ORDER[currentStepIndex - 1];
      goToStep(prevStep);
    }
  }, [canGoBack, currentStepIndex, goToStep]);

  // Data management
  const updateCharacter = useCallback(
    (updates: Partial<CharacterDraft>) => {
      setCharacterDraft((prev) => ({
        ...prev,
        ...updates,
        lastModified: new Date(),
      }));
    },
    []
  );

  const saveDraft = useCallback(async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(characterDraft);
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [characterDraft, onSave]);

  const submitCharacter = useCallback(async () => {
    if (!onSubmit) return;

    setIsSaving(true);
    try {
      await onSubmit(characterDraft);
      // Clear draft on successful submission
      autosave.clearDraft();
    } catch (error) {
      console.error('Failed to submit character:', error);
    } finally {
      setIsSaving(false);
    }
  }, [characterDraft, onSubmit, autosave]);

  // UI controls
  const togglePreview = useCallback(() => {
    setIsPreviewOpen((prev) => !prev);
  }, []);

  const validateCurrentStep = useCallback(() => {
    // TODO: Implement step-specific validation
    // For now, always return true
    return true;
  }, []);

  // Handle ESC key - go back or exit
  const handleEscapeKey = useCallback(() => {
    if (isFirstStep) {
      // If on first step, confirm and exit to dashboard
      if (confirm('Exit wizard? Your progress is auto-saved.')) {
        router.push('/dashboard');
      }
    } else {
      // Otherwise, go to previous step
      goToPreviousStep();
    }
  }, [isFirstStep, goToPreviousStep, router]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNext: goToNextStep,
    onPrevious: goToPreviousStep,
    onSave: saveDraft,
    onTogglePreview: togglePreview,
    onBack: handleEscapeKey,
    enabled: true,
  });

  // Context value
  const contextValue = useMemo<WizardContextValue>(
    () => ({
      currentStep,
      completedSteps,
      characterDraft,
      isPreviewOpen,
      isSaving,
      validationErrors,
      goToStep,
      goToNextStep,
      goToPreviousStep,
      updateCharacter,
      saveDraft,
      submitCharacter,
      togglePreview,
      validateCurrentStep,
    }),
    [
      currentStep,
      completedSteps,
      characterDraft,
      isPreviewOpen,
      isSaving,
      validationErrors,
      goToStep,
      goToNextStep,
      goToPreviousStep,
      updateCharacter,
      saveDraft,
      submitCharacter,
      togglePreview,
      validateCurrentStep,
    ]
  );

  return (
    <WizardContext.Provider value={contextValue}>
      <div
        className={`min-h-screen bg-gradient-to-br from-background via-background to-muted/20 ${className}`}
      >
        {/* Main layout container */}
        <div className="flex h-screen overflow-hidden">
          {/* Progress Sidebar - Desktop only */}
          <aside className="hidden lg:flex w-80 flex-col border-r border-border bg-card/50 backdrop-blur-sm">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-brand-primary-400 to-brand-secondary-500">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">Character Creator</h1>
                    <p className="text-xs text-muted-foreground">
                      Build your AI companion
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to exit? Your progress is auto-saved.')) {
                      router.push('/dashboard');
                    }
                  }}
                  className="h-8 w-8 p-0"
                  title="Exit to Dashboard"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <ProgressIndicator
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={goToStep}
              />
            </div>

            {/* Quick actions */}
            <div className="p-6 border-t border-border space-y-3">
              {/* Auto-save indicator */}
              {autosave.lastSaved && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    Saved {new Date(autosave.lastSaved).toLocaleTimeString()}
                  </span>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={saveDraft}
                disabled={isSaving}
                className="w-full justify-start"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Manual Save'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={togglePreview}
                className="w-full justify-start"
              >
                {isPreviewOpen ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {isPreviewOpen ? 'Hide' : 'Show'} Preview
              </Button>

              {/* Keyboard shortcuts hint */}
              <div className="pt-3 border-t border-border mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Keyboard Shortcuts
                </p>
                <div className="space-y-1 text-xs text-muted-foreground/70">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded bg-muted/50 font-mono text-[10px]">
                      {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'} + Enter
                    </kbd>
                    <span>Next</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded bg-muted/50 font-mono text-[10px]">
                      {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'} + S
                    </kbd>
                    <span>Save</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded bg-muted/50 font-mono text-[10px]">
                      {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'} + P
                    </kbd>
                    <span>Toggle preview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded bg-muted/50 font-mono text-[10px]">
                      Esc
                    </kbd>
                    <span>Back / Exit</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Exit wizard? Progress is auto-saved.')) {
                      router.push('/dashboard');
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-primary-400 to-brand-secondary-500">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-sm">Character Creator</h1>
                    <p className="text-xs text-muted-foreground">
                      Step {currentStepIndex + 1} of {STEP_ORDER.length}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={togglePreview}
                title={isPreviewOpen ? "Close preview" : "Open preview"}
              >
                {isPreviewOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-muted">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-primary-400 to-brand-secondary-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStepIndex + 1) / STEP_ORDER.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto">
            <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mt-16 lg:mt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>

              {/* Navigation bar - Fixed at bottom on mobile */}
              <motion.div
                className="fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto mt-8 p-4 lg:p-0 bg-card/95 lg:bg-transparent backdrop-blur-lg lg:backdrop-blur-none border-t lg:border-t-0 border-border z-30"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={goToPreviousStep}
                    disabled={isFirstStep}
                    className="flex-1 sm:flex-initial"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  {/* Desktop: Save button */}
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={saveDraft}
                    disabled={isSaving}
                    className="hidden lg:flex"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>

                  {isLastStep ? (
                    <Button
                      size="lg"
                      onClick={submitCharacter}
                      disabled={isSaving}
                      className="flex-1 sm:flex-initial bg-gradient-to-r from-brand-primary-400 to-brand-secondary-500 hover:from-brand-primary-500 hover:to-brand-secondary-600 text-white border-0"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Character
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={goToNextStep}
                      disabled={isLastStep}
                      className="flex-1 sm:flex-initial"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Spacer for fixed bottom bar on mobile */}
              <div className="h-20 lg:hidden" />
            </div>
          </main>

          {/* Preview Panel - Collapsible */}
          <PreviewPanel
            character={characterDraft}
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
          />
        </div>
      </div>
    </WizardContext.Provider>
  );
}
