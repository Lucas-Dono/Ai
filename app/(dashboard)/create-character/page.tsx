'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CharacterCreatorExample } from '@/components/character-creator/CharacterCreatorExample';
import { SmartStartWizard } from '@/components/smart-start/SmartStartWizard';
import { CreationMethodSelector } from '@/components/character-creator/CreationMethodSelector';
import { Loader2 } from 'lucide-react';

function CreateCharacterContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const cloneId = searchParams.get('cloneId');

  if (mode === 'smart-start') {
    return <SmartStartWizard />;
  }

  if (mode === 'manual') {
    return <CharacterCreatorExample cloneId={cloneId} />;
  }

  // Default: Show method selector
  return <CreationMethodSelector />;
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function CreateCharacterPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CreateCharacterContent />
    </Suspense>
  );
}
