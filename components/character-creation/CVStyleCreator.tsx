'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save, Sparkles } from 'lucide-react';
import { IdentitySection } from './sections/IdentitySection';
import { WorkSection } from './sections/WorkSection';
import { PersonalitySection } from './sections/PersonalitySection';
import { RelationshipsSection } from './sections/RelationshipsSection';
import { HistorySection } from './sections/HistorySection';
import type { CharacterDraft } from './types';

/**
 * CV-Style Character Creator
 * Professional document-like interface for character creation
 */
export function CVStyleCreator() {
  const router = useRouter();
  const t = useTranslations('characterCreation');

  const [activeTab, setActiveTab] = useState('identity');
  const [draft, setDraft] = useState<CharacterDraft>({
    // Identity (Required)
    name: '',
    age: undefined,
    gender: undefined,
    origin: '',
    physicalDescription: '',
    avatarUrl: null,

    // Work (Required)
    occupation: '',
    skills: [],
    achievements: [],

    // Personality (Optional)
    bigFive: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },
    coreValues: [],
    fears: [],

    // Relationships (Optional)
    importantPeople: [],
    maritalStatus: undefined,

    // History (Optional)
    importantEvents: [],
    traumas: [],
    personalAchievements: [],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Validation
  const isIdentityComplete = draft.name && draft.age && draft.gender && draft.physicalDescription && draft.avatarUrl;
  const isWorkComplete = draft.occupation;
  const canSave = isIdentityComplete && isWorkComplete;

  const handleSave = async () => {
    if (!canSave) return;

    setIsSaving(true);
    try {
      // TODO: Llamar a API para crear personaje
      console.log('Saving character:', draft);

      // Redirect to character page
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save character:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Document Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden"
          style={{
            // Simular documento en papel
            boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          {/* Document Header - Avatar Section */}
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 p-8">
            <div className="flex flex-col items-center gap-6">
              {/* Avatar - Top Center like a CV */}
              <div className="relative">
                {draft.avatarUrl ? (
                  <img
                    src={draft.avatarUrl}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                      {t('identity.avatar.placeholder')}
                    </span>
                  </div>
                )}
              </div>

              {/* Name & Title */}
              <div className="text-center">
                {draft.name ? (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {draft.name}
                    </h1>
                    {draft.occupation && (
                      <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                        {draft.occupation}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 italic">
                    {t('identity.name.placeholder')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Document Content - Tabs */}
          <div className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="identity" className="relative">
                  📝 {t('tabs.identity')}
                  {!isIdentityComplete && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="work" className="relative">
                  💼 {t('tabs.work')}
                  {!isWorkComplete && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="personality">
                  🧠 {t('tabs.personality')}
                </TabsTrigger>
                <TabsTrigger value="relationships">
                  👥 {t('tabs.relationships')}
                </TabsTrigger>
                <TabsTrigger value="history">
                  📖 {t('tabs.history')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="identity" className="space-y-6">
                <IdentitySection
                  data={draft}
                  onChange={(updates) => setDraft({ ...draft, ...updates })}
                  isGenerating={isGenerating}
                  onGenerate={setIsGenerating}
                />
              </TabsContent>

              <TabsContent value="work" className="space-y-6">
                <WorkSection
                  data={draft}
                  onChange={(updates) => setDraft({ ...draft, ...updates })}
                  isGenerating={isGenerating}
                  onGenerate={setIsGenerating}
                />
              </TabsContent>

              <TabsContent value="personality" className="space-y-6">
                <PersonalitySection
                  data={draft}
                  onChange={(updates) => setDraft({ ...draft, ...updates })}
                  isGenerating={isGenerating}
                  onGenerate={setIsGenerating}
                />
              </TabsContent>

              <TabsContent value="relationships" className="space-y-6">
                <RelationshipsSection
                  data={draft}
                  onChange={(updates) => setDraft({ ...draft, ...updates })}
                  isGenerating={isGenerating}
                  onGenerate={setIsGenerating}
                />
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <HistorySection
                  data={draft}
                  onChange={(updates) => setDraft({ ...draft, ...updates })}
                  isGenerating={isGenerating}
                  onGenerate={setIsGenerating}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Document Footer - Save Button */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {canSave ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ {t('status.readyToSave')}
                  </span>
                ) : (
                  <span>
                    {t('status.fillRequired')}
                  </span>
                )}
              </div>

              <Button
                size="lg"
                disabled={!canSave || isSaving}
                onClick={handleSave}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? t('actions.saving') : t('actions.save')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Helper Text */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          <Sparkles className="w-4 h-4 inline mr-1" />
          {t('helper.aiAssist')}
        </p>
      </div>
    </div>
  );
}
