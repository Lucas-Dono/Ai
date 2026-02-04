/**
 * Smart Start Wizard Screen
 *
 * NEW SIMPLIFIED FLOW (Legal compliance - no famous people):
 * Description → Customize → Depth → Review
 *
 * User describes character freely, AI generates original character
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressIndicator } from '../../components/smart-start/ProgressIndicator';
import { DescriptionGenerationStep } from './steps/DescriptionGenerationStep';
import { CustomizationStep } from './steps/CustomizationStep';
import { DepthCustomizationStep } from './steps/DepthCustomizationStep';
import { ReviewStep } from './steps/ReviewStep';
import { useSmartStartContext } from '../../contexts/SmartStartContext';
import type { DepthLevelId } from '@circuitpromptai/smart-start-core';
import { colors } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

type WizardStep = 'description' | 'customize' | 'depth' | 'review';

interface Props {
  navigation: StackNavigationProp<any>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SmartStartWizardScreen({ navigation }: Props) {
  const {
    draft,
    updateDraft,
    resetDraft,
    markStepComplete,
    setCurrentStep,
    userTier,
  } = useSmartStartContext();

  const parentNavigation = useNavigation();

  // Ref for ScrollView to enable programmatic scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  // Wizard state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Data state
  const [selectedDepth, setSelectedDepth] = useState<DepthLevelId | null>(null);

  // Simplified step order: description → customize → depth → review
  const effectiveSteps: WizardStep[] = ['description', 'customize', 'depth', 'review'];

  // Initialize session
  useEffect(() => {
    const initSession = () => {
      // Generate simple session ID
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setSessionId(newSessionId);
      setCurrentStep('description');
    };

    initSession();
  }, []);

  // Smart scroll when step changes - positions input near top of screen (RESPONSIVE)
  useEffect(() => {
    if (currentStepIndex > 0) {
      const timer = setTimeout(() => {
        // Get screen height for responsive calculations
        const screenHeight = Dimensions.get('window').height;

        // Calculate values based on percentage of screen height
        // This automatically adapts to any device size
        const estimatedStepHeight = screenHeight * 0.45; // 45% of height per step
        const baseOffset = screenHeight * 0.30; // 30% of height as base offset

        const scrollPosition = (currentStepIndex - 1) * estimatedStepHeight + baseOffset;

        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: true
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex]);

  // ============================================================================
  // STEP COMPLETION HANDLERS
  // ============================================================================

  const handleDescriptionComplete = useCallback((generatedDraft: any) => {
    // Update draft with generated character data
    updateDraft({
      ...draft,
      ...generatedDraft,
      characterType: 'original',
    });

    markStepComplete('description');
    setCompletedSteps(prev => [...prev, 'description']);
    setCurrentStepIndex(1); // Move to customize
  }, [updateDraft, draft, markStepComplete]);

  const handleCustomizeComplete = useCallback(() => {
    markStepComplete('customize');
    setCompletedSteps(prev => [...prev, 'customize']);
    setCurrentStepIndex(2); // Move to depth
  }, [markStepComplete]);

  const handleDepthComplete = useCallback((depthId: DepthLevelId) => {
    setSelectedDepth(depthId);
    updateDraft({ depthLevel: depthId });
    markStepComplete('depth');
    setCompletedSteps(prev => [...prev, 'depth']);
    setCurrentStepIndex(3); // Move to review
  }, [updateDraft, markStepComplete]);

  const handleCreateCharacter = useCallback(async () => {
    try {
      // Import service dynamically
      const { smartStartService } = await import('../../services/smart-start.service');

      // Call API to create character
      const result = await smartStartService.createCharacter({
        name: draft.name || 'Sin nombre',
        characterType: 'original',
        genre: draft.genre,
        subgenre: draft.subgenre,
        physicalAppearance: draft.physicalAppearance,
        emotionalTone: draft.emotionalTone,
        personality: (draft as any).personality,
        appearance: (draft as any).physicalAppearance,
        depthLevel: selectedDepth,
      } as any);

      // Mark step complete
      markStepComplete('review');

      // Show success
      Alert.alert(
        '¡Personaje creado! ✨',
        `${result.agent.name} ha sido creado exitosamente!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset draft
              resetDraft();

              // Navigate back to home
              parentNavigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('[SmartStartWizard] Create character error:', error);

      Alert.alert(
        'Error',
        'No se pudo crear el personaje. Por favor, intenta nuevamente.',
        [{ text: 'OK' }]
      );
    }
  }, [draft, selectedDepth, markStepComplete, resetDraft, parentNavigation]);

  const handleEditSection = useCallback((section: WizardStep) => {
    const sectionIndex = effectiveSteps.indexOf(section);
    if (sectionIndex !== -1) {
      setCurrentStepIndex(sectionIndex);
    }
  }, [effectiveSteps]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!sessionId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Iniciando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* App Header */}
      <View style={styles.appHeader}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={19} color="#8b5cf6" />
          <Text style={styles.appTitle}>Blaniel</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CVStyleCreator')}
            style={styles.manualButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="document-text" size={20} color="#8b5cf6" />
            <Text style={styles.manualButtonText}>Manual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => parentNavigation.goBack()}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Indicator */}
      <ProgressIndicator currentStep={currentStepIndex} totalSteps={effectiveSteps.length} />

      {/* Scrollable Steps */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Step 0: Description Generation (always first) */}
        <DescriptionGenerationStep
          sessionId={sessionId}
          userTier={userTier as 'FREE' | 'PLUS' | 'ULTRA'}
          onCharacterGenerated={handleDescriptionComplete}
        />

        {/* Step 1: Customization */}
        {completedSteps.includes('description') && (
          <CustomizationStep
            visible={currentStepIndex >= 1}
            completed={completedSteps.includes('customize')}
            draft={draft}
            onUpdate={updateDraft}
            onContinue={handleCustomizeComplete}
          />
        )}

        {/* Step 2: Depth Customization */}
        {completedSteps.includes('customize') && (
          <DepthCustomizationStep
            visible={currentStepIndex >= 2}
            completed={completedSteps.includes('depth')}
            userTier={userTier}
            onComplete={handleDepthComplete}
          />
        )}

        {/* Step 3: Review */}
        {completedSteps.includes('depth') && (
          <ReviewStep
            visible={currentStepIndex >= 3}
            completed={completedSteps.includes('review')}
            draft={draft}
            onCreateCharacter={handleCreateCharacter}
            onEdit={handleEditSection}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },

  // App Header
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  manualButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Scroll Content
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingBottom: 120, // Extra padding at bottom for keyboard space
  },
});
