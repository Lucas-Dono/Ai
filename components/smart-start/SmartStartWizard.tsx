'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartStartProvider, useSmartStart } from './context/SmartStartContext';
import { WizardHeader } from './ui/WizardHeader';
import { ProgressBreadcrumb } from './ui/ProgressBreadcrumb';
import { GenreSelection } from './steps/GenreSelection';
import { CharacterTypeSelection } from './steps/CharacterTypeSelection';
import { CharacterSearch } from './steps/CharacterSearch';
import { DescriptionGenerationStep } from './steps/DescriptionGenerationStep';
import { CharacterCustomization } from './steps/CharacterCustomization';
import { DepthCustomizationStep } from './steps/DepthCustomizationStep';
import { ReviewStep } from './steps/ReviewStep';
import { CharacterPreviewPanel } from './ui/CharacterPreviewPanel';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SmartStartErrorBoundary, ErrorBoundary } from './ui/ErrorBoundary';

/**
 * Main Smart Start Wizard Component
 * Orchestrates the entire character creation flow
 */
export function SmartStartWizard() {
  return (
    <SmartStartErrorBoundary level="critical">
      <SmartStartProvider>
        <WizardContent />
      </SmartStartProvider>
    </SmartStartErrorBoundary>
  );
}

function WizardContent() {
  const router = useRouter();
  const t = useTranslations('smartStart.header');
  const {
    currentStep,
    sessionId,
    isLoading,
    userTier,
    selectedDepth,
    selectDepthLevel,
    goToStep,
    updateCharacterDraft,
  } = useSmartStart();

  // Keyboard navigation
  useKeyboardNavigation({
    enableArrowKeys: true,
  });

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentStep]);

  // Handle skip action
  const handleSkip = () => {
    if (confirm(t('skipConfirm'))) {
      router.push('/create-character?mode=manual');
    }
  };

  // Show loading state while session initializes
  if (!sessionId && isLoading) {
    return <InitializingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <WizardHeader onSkip={handleSkip} />

      {/* Breadcrumb Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProgressBreadcrumb currentStep={currentStep} />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <StepContent
              step={currentStep}
              userTier={userTier}
              selectedDepth={selectedDepth}
              sessionId={sessionId}
              onDepthSelect={selectDepthLevel}
              goToStep={goToStep}
              onCharacterGenerated={(draft) => {
                // Update character draft in context
                updateCharacterDraft(draft);
              }}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Preview Panel (sticky on desktop, bottom sheet on mobile) */}
      <CharacterPreviewPanel />
    </div>
  );
}

interface StepContentProps {
  step: string;
  userTier: string;
  selectedDepth: string | null;
  sessionId: string | null;
  onDepthSelect: (depthId: any) => void;
  goToStep: (step: any) => void;
  onCharacterGenerated: (draft: any) => void;
}

function StepContent({ step, userTier, selectedDepth, sessionId, onDepthSelect, goToStep, onCharacterGenerated }: StepContentProps) {
  switch (step) {
    // NEW LEGAL FLOW: Start directly with description (no "type" selection)
    case 'description':
      if (!sessionId) {
        return <div>Loading session...</div>;
      }
      return (
        <ErrorBoundary componentName="DescriptionGenerationStep" level="recoverable">
          <DescriptionGenerationStep
            sessionId={sessionId}
            userTier={userTier as 'FREE' | 'PLUS' | 'ULTRA'}
            onCharacterGenerated={(draft) => {
              onCharacterGenerated(draft);
              goToStep('customize');
            }}
            onBack={() => {
              // Could add a back option or skip
            }}
          />
        </ErrorBoundary>
      );

    // DEPRECATED: Keep for backward compatibility but not used in new flow
    case 'type':
      return (
        <ErrorBoundary componentName="CharacterTypeSelection" level="recoverable">
          <CharacterTypeSelection />
        </ErrorBoundary>
      );

    // DEPRECATED: Old search flow (ILLEGAL - kept only for reference)
    case 'search':
      return (
        <ErrorBoundary componentName="CharacterSearch" level="recoverable">
          <CharacterSearch />
        </ErrorBoundary>
      );

    case 'customize':
      return (
        <ErrorBoundary componentName="CharacterCustomization" level="recoverable">
          <CharacterCustomization />
        </ErrorBoundary>
      );

    case 'depth':
      return (
        <ErrorBoundary componentName="DepthCustomizationStep" level="recoverable">
          <DepthCustomizationStep
            visible={true}
            completed={selectedDepth !== null}
            userTier={userTier as any}
            selectedDepth={selectedDepth as any}
            onComplete={(depthId) => {
              onDepthSelect(depthId);
              goToStep('review');
            }}
          />
        </ErrorBoundary>
      );

    case 'review':
      return (
        <ErrorBoundary componentName="ReviewStep" level="recoverable">
          <ReviewStep />
        </ErrorBoundary>
      );

    // Legacy genre selection (can be accessed from customize if user wants to change genre)
    case 'genre':
      return (
        <ErrorBoundary componentName="GenreSelection" level="recoverable">
          <GenreSelection />
        </ErrorBoundary>
      );

    default:
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Unknown step: {step}</p>
        </div>
      );
  }
}

function InitializingState() {
  const t = useTranslations('smartStart.common');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('loading')}
        </p>
      </div>
    </div>
  );
}
