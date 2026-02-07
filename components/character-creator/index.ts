/**
 * Character Creator - Professional AI Character Creation System
 *
 * A complete, production-ready wizard for creating AI characters with:
 * - Innovative progress indicator (inspired by Linear/Arc)
 * - Live preview panel with glassmorphism
 * - Smooth animations and micro-interactions
 * - Full TypeScript support
 * - Responsive design (mobile-first)
 * - Accessibility compliant (WCAG 2.1 AA)
 *
 * @example
 * ```tsx
 * import { CharacterCreatorExample } from '@/components/character-creator';
 *
 * export default function CreatePage() {
 *   return <CharacterCreatorExample />;
 * }
 * ```
 */

// Main components
export { WizardShell, useWizard } from './WizardShell';
export { ProgressIndicator } from './ProgressIndicator';
export { PreviewPanel } from './PreviewPanel';
export { StepContainer, StepSection } from './StepContainer';

// Example implementation
export { CharacterCreatorExample } from './CharacterCreatorExample';

// Step components
export { BasicsStep } from './steps/BasicsStep';
export { PersonalityStep } from './steps/PersonalityStep';

// Types
export type {
  WizardStep,
  WizardStepConfig,
  CharacterDraft,
  WizardContextValue,
  StepComponentProps,
} from '@/types/character-wizard';
