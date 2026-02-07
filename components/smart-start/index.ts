/**
 * Smart Start - Character Creation Wizard
 *
 * A professional, enterprise-grade UI for intelligent character creation.
 * This system guides users through a step-by-step process to create
 * high-quality AI characters with minimal effort.
 *
 * @example
 * ```tsx
 * import { SmartStartWizard } from '@/components/smart-start';
 *
 * export default function Page() {
 *   return <SmartStartWizard />;
 * }
 * ```
 */

// Main Components
export { SmartStartWizard } from './SmartStartWizard';

// Context & Hooks
export { SmartStartProvider, useSmartStart } from './context/SmartStartContext';
export { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

// Step Components
export { GenreSelection } from './steps/GenreSelection';
export { CharacterTypeSelection } from './steps/CharacterTypeSelection';
export { CharacterSearch } from './steps/CharacterSearch';
export { CharacterCustomization } from './steps/CharacterCustomization';
export { ReviewStep } from './steps/ReviewStep';

// UI Components
export { WizardHeader } from './ui/WizardHeader';
export { ProgressBreadcrumb } from './ui/ProgressBreadcrumb';
export { GenreCard } from './ui/GenreCard';
export { SearchResultCard } from './ui/SearchResultCard';
export { CharacterPreview } from './ui/CharacterPreview';
export { CharacterPreviewPanel } from './ui/CharacterPreviewPanel';

// Types (re-exported from context)
export type {
  Genre,
  SubGenre,
  Archetype,
} from './context/SmartStartContext';
