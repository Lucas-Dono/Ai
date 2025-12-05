import { Metadata } from 'next';
import { SmartStartWizard } from '@/components/smart-start/SmartStartWizard';

export const metadata: Metadata = {
  title: 'Smart Start - Create Character',
  description: 'Intelligent character creation wizard powered by AI',
};

export default function SmartStartPage() {
  return <SmartStartWizard />;
}
