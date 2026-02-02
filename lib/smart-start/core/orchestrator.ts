/**
 * Smart Start Orchestrator - Main controller for the Smart Start flow
 * Manages session state, coordinates services, handles user progression
 */

import { PrismaClient } from '@prisma/client';
import {
  SmartStartSessionData,
  SmartStartStep,
  CharacterDraft,
  SearchResult,
  GenreId,
  SubGenreId,
  ArchetypeId,
} from '../core/types';
import type { GenderType } from '@/types/character-creation';
import { getGenreService } from '../services/genre-service';
import { getSearchRouter } from '../search/search-router';
import { getCharacterExtractor } from '../search/character-extractor';
import { getAIService } from '../services/ai-service';
import { getValidationService } from '../services/validation-service';
import { PromptBuilder } from '../prompts/generator';
import { nanoid } from 'nanoid';
import { getDescriptionBasedGenerator, type GenerationOptions } from '../services/description-based-generator';
import { getInitialImageGenerationService } from '../services/initial-image-generation.service';

const prisma = new PrismaClient();

// Define the action types used in the orchestrator
interface SmartStartAction {
  type: 'select_genre' | 'select_type' | 'search' | 'select_result' | 'customize' | 'generate' | 'complete' | 'abandon';
  data: any;
}

// Define SmartStartSession interface matching Prisma model
interface SmartStartSession {
  id: string;
  userId: string;
  currentStep: string;
  startedAt: Date;
  completedAt?: Date | null;
  abandonedAt?: Date | null;
  resultCharacterId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  timestamp?: number;
  // Session data fields from Prisma model
  selectedGenre?: string | null;
  selectedSubgenre?: string | null;
  selectedArchetype?: string | null;
  characterType?: string | null;
  searchQuery?: string | null;
  searchResults?: any;
  selectedResult?: any;
  extractedCharacter?: any;
  userInput?: any;
  aiGeneratedFields?: any;
  userModifications?: any;
  timeSpentPerStep?: any;
  interactionEvents?: any;
}

export class SmartStartOrchestrator {
  private genreService = getGenreService();
  private searchRouter = getSearchRouter();
  private extractor = getCharacterExtractor();
  private aiService = getAIService();
  private promptBuilder = new PromptBuilder();
  private validator = getValidationService();

  /**
   * Create a new Smart Start session
   */
  async createSession(userId: string): Promise<SmartStartSession> {
    const session = await prisma.smartStartSession.create({
      data: {
        id: nanoid(),
        userId,
        // Flow starts with 'type' - user chooses existing vs original character
        currentStep: 'type',
        startedAt: new Date(),
        timeSpentPerStep: {},
        interactionEvents: [],
        updatedAt: new Date(),
      },
    });

    // Track analytics
    await this.trackEvent('smart_start_initiated', {
      userId,
      sessionId: session.id,
      timestamp: new Date().toISOString(),
    });

    return session as SmartStartSession;
  }

  /**
   * Progress session through state machine
   */
  async progressSession(
    sessionId: string,
    action: SmartStartAction
  ): Promise<SmartStartSession> {
    const session = await prisma.smartStartSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Calculate time spent on current step
    const timeSpentPerStep = (session.timeSpentPerStep as Record<string, number>) || {};
    const lastEvent = (session.interactionEvents as any[]).slice(-1)[0];
    if (lastEvent) {
      const timeSpent = Date.now() - new Date(lastEvent.timestamp).getTime();
      timeSpentPerStep[session.currentStep] =
        (timeSpentPerStep[session.currentStep] || 0) + timeSpent;
    }

    // State machine transitions
    const newState = this.transitionState(session as SmartStartSession, action);

    // Extract only allowed update fields
    const { userId: _userId, id: _id, createdAt: _createdAt, startedAt: _startedAt, timestamp: _timestamp, ...allowedUpdates } = newState;

    // Update session
    const updated = await prisma.smartStartSession.update({
      where: { id: sessionId },
      data: {
        ...allowedUpdates,
        timeSpentPerStep,
        interactionEvents: {
          push: {
            type: action.type,
            timestamp: new Date().toISOString(),
            data: action.data,
          },
        },
      },
    });

    // Track analytics
    await this.trackEvent(`step_${action.type}`, {
      sessionId,
      userId: session.userId,
      step: session.currentStep,
      newStep: newState.currentStep,
    });

    return updated as SmartStartSession;
  }

  /**
   * State machine transitions
   */
  private transitionState(
    session: SmartStartSession,
    action: SmartStartAction
  ): Partial<SmartStartSession> {
    const updates: Partial<SmartStartSession> = {};

    switch (action.type) {
      case 'select_genre':
        updates.selectedGenre = action.data.genreId;
        updates.selectedSubgenre = action.data.subgenreId;
        updates.selectedArchetype = action.data.archetypeId;
        updates.currentStep = 'type';
        break;

      case 'select_type':
        updates.characterType = action.data.type;
        updates.currentStep = action.data.type === 'existing' ? 'search' : 'customize';
        break;

      case 'search':
        updates.searchQuery = action.data.query;
        updates.searchResults = action.data.results;
        updates.currentStep = 'search';
        break;

      case 'select_result':
        updates.selectedResult = action.data.characterData;
        updates.extractedCharacter = action.data.characterData;
        updates.currentStep = 'customize';
        break;

      case 'customize':
        updates.userModifications = action.data.modifications;
        updates.currentStep = 'review';
        break;

      case 'generate':
        updates.aiGeneratedFields = action.data.generatedFields;
        updates.currentStep = 'review';
        break;

      case 'complete':
        updates.completedAt = new Date();
        updates.currentStep = 'review'; // Use valid step instead of 'completed'
        updates.resultCharacterId = action.data.characterId;
        break;

      case 'abandon':
        updates.abandonedAt = new Date();
        updates.currentStep = 'review'; // Use valid step instead of 'abandoned'
        break;

      default:
        throw new Error(`Unknown action type: ${(action as any).type}`);
    }

    return updates;
  }

  /**
   * Perform character search
   */
  async performSearch(
    sessionId: string,
    query: string,
    limit: number = 10
  ): Promise<SearchResult[]> {
    const session = await prisma.smartStartSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const genreId = session.selectedGenre as GenreId;
    if (!genreId) {
      throw new Error('Genre not selected');
    }

    // Perform search
    const results = await this.searchRouter.search(query, genreId, { limit });

    // Update session
    await this.progressSession(sessionId, {
      type: 'search',
      data: { query, results },
    });

    return results;
  }

  /**
   * Select a search result and extract character data
   */
  async selectSearchResult(sessionId: string, result: SearchResult): Promise<CharacterDraft> {
    const session = await prisma.smartStartSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const genreId = session.selectedGenre as GenreId;

    // Extract character data
    let extracted;
    try {
      extracted = await this.extractor.extract(result, genreId);
    } catch (error) {
      console.error('[Orchestrator] Character extraction failed:', error);
      throw new Error(`Failed to extract character data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Build generation config for system prompt
    const config = {
      genreId,
      subgenreId: session.selectedSubgenre as SubGenreId | undefined,
      archetypeId: session.selectedArchetype as ArchetypeId | undefined,
      name: extracted.name,
      personality: extracted.personality || [],
      background: extracted.background,
      appearance: extracted.appearance,
    };

    // Generate system prompt
    let systemPrompt;
    try {
      systemPrompt = await this.promptBuilder.build(config);
    } catch (error) {
      console.error('[Orchestrator] System prompt generation failed:', error);
      // Use a basic fallback prompt if template building fails
      systemPrompt = `You are ${extracted.name}. ${extracted.background}\n\nPersonality: ${extracted.personality?.join(', ') || 'unique and interesting'}`;
    }

    // Parse age to number if it's a string
    const parsedAge = extracted.age ? (typeof extracted.age === 'number' ? extracted.age : parseInt(extracted.age, 10)) : undefined;

    // Create draft - convert personality to string if it's an array
    const personalityStr = Array.isArray(extracted.personality)
      ? extracted.personality.join(', ')
      : (extracted.personality || '');

    const draft: CharacterDraft = {
      name: extracted.name,
      alternateName: extracted.alternateName,
      personality: personalityStr,
      backstory: extracted.background,
      physicalAppearance: extracted.appearance,
      age: parsedAge && !isNaN(parsedAge) ? parsedAge : undefined,
      gender: extracted.gender as GenderType | undefined,
      occupation: extracted.occupation,
      systemPrompt,
      imageUrl: result.imageUrl,
      thumbnailUrl: result.thumbnailUrl,
      genreId,
      subgenreId: session.selectedSubgenre as SubGenreId | undefined,
      archetypeId: session.selectedArchetype as ArchetypeId | undefined,
      communicationStyle: extracted.communicationStyle,
      catchphrases: extracted.catchphrases,
    };

    // Update session
    await this.progressSession(sessionId, {
      type: 'select_result',
      data: {
        resultId: result.id,
        characterData: draft,
      },
    });

    return draft;
  }

  /**
   * Generate character from scratch
   */
  async generateCharacter(sessionId: string): Promise<CharacterDraft> {
    const session = await prisma.smartStartSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Build generation config
    const config = this.buildGenerationConfig(session as SmartStartSession);

    // Generate system prompt
    const systemPrompt = await this.promptBuilder.build(config);

    // Generate character fields using AI
    const genre = this.genreService.getGenre(config.genreId);
    const archetype = config.archetypeId
      ? this.genreService.getArchetype(
          config.genreId,
          config.subgenreId!,
          config.archetypeId
        )
      : null;

    const generated = await this.aiService.generateCharacter(
      config.name || 'New Character',
      genre?.name || 'General',
      archetype?.name || 'Balanced',
      config.additionalContext
    );

    // Create draft - convert personality to string if needed
    const personalityStr = typeof generated.personality === 'string'
      ? generated.personality
      : (Array.isArray(generated.personality) ? generated.personality.join(', ') : '');

    const draft: CharacterDraft = {
      name: config.name || generated.name || 'New Character',
      personality: personalityStr,
      backstory: generated.background || '',
      physicalAppearance: generated.appearance,
      age: typeof generated.age === 'string' ? parseInt(generated.age, 10) : generated.age,
      occupation: generated.occupation,
      systemPrompt,
      genreId: config.genreId,
      subgenreId: config.subgenreId,
      archetypeId: config.archetypeId,
      communicationStyle: generated.communicationStyle,
      catchphrases: generated.catchphrases,
    };

    // Validate
    const validation = this.validator.validateCharacterDraft(draft);

    if (!validation.valid) {
      console.warn('[Orchestrator] Generated character has validation errors:', validation.errors);
      // One retry with fixes
      const fixed = await this.regenerateWithFixes(draft, validation.errors);
      return fixed;
    }

    // Update session
    await this.progressSession(sessionId, {
      type: 'generate',
      data: {
        generatedFields: draft,
      },
    });

    return draft;
  }

  /**
   * NEW: Generate character from free-form description (LEGAL - 100% original)
   * This replaces the old "search existing character" flow
   */
  async generateFromDescription(
    sessionId: string,
    description: string,
    userTier: 'FREE' | 'PLUS' | 'ULTRA',
    options?: {
      genreHint?: GenreId;
      archetypeHint?: ArchetypeId;
      era?: string;
      nsfwLevel?: 'sfw' | 'romantic' | 'suggestive' | 'explicit';
      uploadedAvatarUrl?: string; // User-uploaded avatar URL
    }
  ): Promise<CharacterDraft> {
    const session = await prisma.smartStartSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    console.log('[Orchestrator] Generating from description:', {
      sessionId,
      descriptionLength: description.length,
      tier: userTier,
    });

    // Use the new description-based generator
    const generator = getDescriptionBasedGenerator();

    const generationOptions: GenerationOptions = {
      description,
      tier: userTier,
      genreHint: options?.genreHint,
      archetypeHint: options?.archetypeHint,
      constraints: {
        era: options?.era,
        nsfwLevel: options?.nsfwLevel,
      },
    };

    const result = await generator.generate(generationOptions);

    // Log warnings if any (copyright issues detected)
    if (result.warnings && result.warnings.length > 0) {
      console.warn('[Orchestrator] Originality warnings:', result.warnings);
    }

    // Generate character images
    console.log('[Orchestrator] Generating character images...');
    const imageGenerator = getInitialImageGenerationService();

    let avatarUrl: string | undefined;
    let referenceImageUrl: string | undefined;

    try {
      // Determine if we should use uploaded avatar or generate
      if (options?.uploadedAvatarUrl) {
        console.log('[Orchestrator] Using uploaded avatar:', options.uploadedAvatarUrl);
        avatarUrl = options.uploadedAvatarUrl;

        // Generate only full-body reference image
        referenceImageUrl = await imageGenerator.generateFullBodyOnly({
          name: result.draft.name || 'Character',
          gender: result.draft.gender || 'Other',
          physicalAppearance: result.draft.physicalAppearance,
          age: result.draft.age,
          personality: result.draft.personality,
          style: 'realistic',
          userTier,
        });
      } else {
        // Generate both images with AI
        console.log('[Orchestrator] Generating both images with AI...');
        const imageResult = await imageGenerator.generateBothImages({
          name: result.draft.name || 'Character',
          gender: result.draft.gender || 'Other',
          physicalAppearance: result.draft.physicalAppearance,
          age: result.draft.age,
          personality: result.draft.personality,
          style: 'realistic',
          userTier,
        });

        avatarUrl = imageResult.avatarUrl;
        referenceImageUrl = imageResult.referenceImageUrl;

        console.log('[Orchestrator] ✅ Images generated in', imageResult.metadata.generationTime, 'seconds');
      }
    } catch (imageError) {
      console.error('[Orchestrator] Error generating images:', imageError);
      // Continue without images - don't fail the entire generation
      console.warn('[Orchestrator] Continuing without images');
    }

    // Generate system prompt from the draft
    const genre = options?.genreHint ? this.genreService.getGenre(options.genreHint) : null;
    const archetype = null; // Skip archetype for now as we don't have subgenre

    const systemPrompt = await this.promptBuilder.build({
      genreId: options?.genreHint || ('general' as GenreId),
      name: result.draft.name,
      personality: result.draft.personality ? [result.draft.personality] : [],
      background: result.draft.backstory,
      appearance: result.draft.physicalAppearance,
    });

    // Enhance draft with system prompt, metadata, and images
    const enhancedDraft: CharacterDraft = {
      ...result.draft,
      systemPrompt,
      avatar: avatarUrl, // Add avatar URL
      referenceImage: referenceImageUrl, // Add reference image URL
      genreId: options?.genreHint,
      archetypeId: options?.archetypeHint,
      aiGeneratedFields: [
        'name',
        'age',
        'gender',
        'occupation',
        'personality',
        'backstory',
        'physicalAppearance',
        'communicationStyle',
        'catchphrases',
        'systemPrompt',
        ...(avatarUrl && !options?.uploadedAvatarUrl ? ['avatar'] : []),
        ...(referenceImageUrl ? ['referenceImage'] : []),
      ],
      userEditedFields: [],
    };

    // Update session with generated data
    await this.progressSession(sessionId, {
      type: 'generate',
      data: {
        generatedFields: enhancedDraft,
        generationMetadata: {
          method: 'description-based',
          confidence: result.confidence,
          warnings: result.warnings,
          tokensUsed: result.metadata.tokensUsed,
          tier: userTier,
        },
      },
    });

    // Track analytics
    await this.trackEvent('character_generated_from_description', {
      sessionId,
      userId: session.userId,
      tier: userTier,
      descriptionLength: description.length,
      confidence: result.confidence,
      hasWarnings: result.warnings && result.warnings.length > 0,
    });

    return enhancedDraft;
  }

  /**
   * NEW: Generate random character ("Surprise me" button)
   */
  async generateRandomCharacter(
    sessionId: string,
    userTier: 'FREE' | 'PLUS' | 'ULTRA'
  ): Promise<CharacterDraft> {
    const session = await prisma.smartStartSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    console.log('[Orchestrator] Generating random character for tier:', userTier);

    const generator = getDescriptionBasedGenerator();
    const result = await generator.generateRandom(userTier);

    // Generate system prompt
    const systemPrompt = await this.promptBuilder.build({
      genreId: 'general' as GenreId,
      name: result.draft.name,
      personality: result.draft.personality ? [result.draft.personality] : [],
      background: result.draft.backstory,
      appearance: result.draft.physicalAppearance,
    });

    const enhancedDraft: CharacterDraft = {
      ...result.draft,
      systemPrompt,
      aiGeneratedFields: [
        'name',
        'age',
        'gender',
        'occupation',
        'personality',
        'backstory',
        'physicalAppearance',
        'communicationStyle',
        'catchphrases',
        'systemPrompt',
      ],
      userEditedFields: [],
    };

    // Update session
    await this.progressSession(sessionId, {
      type: 'generate',
      data: {
        generatedFields: enhancedDraft,
        generationMetadata: {
          method: 'random',
          confidence: result.confidence,
          tier: userTier,
        },
      },
    });

    await this.trackEvent('character_generated_random', {
      sessionId,
      userId: session.userId,
      tier: userTier,
    });

    return enhancedDraft;
  }

  /**
   * Regenerate character with fixes
   */
  private async regenerateWithFixes(
    draft: CharacterDraft,
    errors: any[]
  ): Promise<CharacterDraft> {
    console.log('[Orchestrator] Attempting to fix validation errors...');

    // Build fix prompt
    const fixPrompt = `The following character has validation errors. Please fix them:

Character: ${JSON.stringify(draft)}

Errors: ${errors.map(e => e.message).join(', ')}

Return a corrected version in JSON format.`;

    const fixed = await this.aiService.generate({
      type: 'generate-character',
      prompt: fixPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    try {
      const parsedFix = JSON.parse(fixed.text);
      return { ...draft, ...parsedFix };
    } catch (error) {
      console.error('[Orchestrator] Failed to parse fix response');
      return draft; // Return original if fix fails
    }
  }

  /**
   * Build generation configuration from session
   */
  private buildGenerationConfig(session: SmartStartSession): any {
    return {
      genreId: session.selectedGenre as GenreId,
      subgenreId: session.selectedSubgenre as SubGenreId,
      archetypeId: session.selectedArchetype as ArchetypeId,
      name: session.userModifications?.name,
      additionalContext: session.userModifications?.additionalContext,
      externalData: session.extractedCharacter,
    };
  }

  /**
   * Apply user customizations to draft
   */
  async applyCustomizations(
    sessionId: string,
    draft: CharacterDraft,
    customizations: Partial<CharacterDraft>
  ): Promise<CharacterDraft> {
    const updated = { ...draft, ...customizations };

    // Track which fields were user-edited
    const editedFields = Object.keys(customizations);
    updated.userEditedFields = [
      ...(updated.userEditedFields || []),
      ...editedFields,
    ];

    // Remove from AI-generated list if user edited
    updated.aiGeneratedFields = (updated.aiGeneratedFields || []).filter(
      f => !editedFields.includes(f)
    );

    // Update session
    await this.progressSession(sessionId, {
      type: 'customize',
      data: {
        modifications: customizations,
      },
    });

    return updated;
  }

  /**
   * Finalize and create character
   */
  async finalizeCharacter(sessionId: string, draft: CharacterDraft): Promise<string> {
    const session = await prisma.smartStartSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Final validation
    const validation = this.validator.validateCharacterDraft(draft);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // This would be called from the API route that creates the actual Agent
    // We just mark the session as complete here
    await this.progressSession(sessionId, {
      type: 'complete',
      data: {
        characterId: 'pending', // Will be updated by API route
      },
    });

    return sessionId;
  }

  /**
   * Abandon session
   */
  async abandonSession(sessionId: string): Promise<void> {
    await this.progressSession(sessionId, {
      type: 'abandon',
      data: {},
    });

    await this.trackEvent('session_abandoned', { sessionId });
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<SmartStartSession | null> {
    const session = await prisma.smartStartSession.findUnique({
      where: { id: sessionId },
    });

    return session as SmartStartSession | null;
  }

  /**
   * Get user's session history
   */
  async getUserSessions(userId: string, limit: number = 10): Promise<SmartStartSession[]> {
    const sessions = await prisma.smartStartSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return sessions as SmartStartSession[];
  }

  /**
   * Track analytics event
   */
  private async trackEvent(eventType: string, data: any): Promise<void> {
    // TODO: Integrate with analytics service
    console.log(`[Analytics] ${eventType}:`, data);
  }

  /**
   * Get session analytics
   */
  async getSessionAnalytics(sessionId: string): Promise<any> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const timeSpentPerStep = (session.timeSpentPerStep as Record<string, number>) || {};
    const interactionEvents = (session.interactionEvents as any[]) || [];

    const totalTime = Object.values(timeSpentPerStep).reduce((a: number, b: number) => a + b, 0);

    return {
      sessionId,
      totalTime,
      timeSpentPerStep,
      stepsCompleted: Object.keys(timeSpentPerStep).length,
      interactionCount: interactionEvents.length,
      currentStep: session.currentStep,
      completed: session.completedAt !== null,
      abandoned: session.abandonedAt !== null,
    };
  }
}

// Singleton instance
let orchestratorInstance: SmartStartOrchestrator | null = null;

export function getSmartStartOrchestrator(): SmartStartOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new SmartStartOrchestrator();
  }
  return orchestratorInstance;
}

export const smartStartOrchestrator = getSmartStartOrchestrator();
