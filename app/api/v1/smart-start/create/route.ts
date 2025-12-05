import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { canUseResource } from "@/lib/usage/tracker";

/**
 * POST /api/v1/smart-start/create
 *
 * Create a character using Smart Start wizard data
 * Accepts detailed character draft from Smart Start flow
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user (supports both JWT and NextAuth)
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Check agent quota
    const quotaCheck = await canUseResource(userId, "agent");
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: quotaCheck.reason,
          current: quotaCheck.current,
          limit: quotaCheck.limit,
        },
        { status: 403 }
      );
    }

      const body = await req.json();
      const {
        name,
        characterType,
        genre,
        subgenre,
        physicalAppearance,
        emotionalTone,
        searchResult,
        personalityCore,
        characterAppearance,
      } = body;

      // Validate required fields
      if (!name) {
        return NextResponse.json(
          { error: "name is required" },
          { status: 400 }
        );
      }

      if (!characterType || !["existing", "original"].includes(characterType)) {
        return NextResponse.json(
          { error: "characterType must be 'existing' or 'original'" },
          { status: 400 }
        );
      }

      // Get user's plan/tier
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true }
      });

      const tier = (user?.plan || 'free') as 'free' | 'plus' | 'ultra';

      // Build profile object
      const profile: any = {
        characterType,
        genre,
        subgenre,
        emotionalTone,
        source: searchResult ? {
          name: searchResult.name,
          sourceId: searchResult.sourceId,
          externalId: searchResult.id,
          description: searchResult.description,
          imageUrl: searchResult.imageUrl,
        } : null,
      };

      // Add personality if generated
      if (personalityCore) {
        profile.personalityCore = {
          bigFive: personalityCore.bigFive,
          coreValues: personalityCore.coreValues,
          moralSchemas: personalityCore.moralSchemas,
          innerConflicts: personalityCore.innerConflicts,
        };
      }

      // Add appearance if generated
      if (characterAppearance) {
        profile.appearance = {
          gender: characterAppearance.gender,
          age: characterAppearance.age,
          physicalDescription: characterAppearance.physicalDescription,
          style: characterAppearance.style,
          distinctiveFeatures: characterAppearance.distinctiveFeatures,
        };
      }

      // Build system prompt from available data
      let systemPrompt = `Eres ${name}`;

      if (physicalAppearance) {
        systemPrompt += `. ${physicalAppearance}`;
      }

      if (personalityCore) {
        const traits: string[] = [];

        if (personalityCore.bigFive) {
          const b5 = personalityCore.bigFive;
          if (b5.openness > 60) traits.push("creativo/a y curioso/a");
          if (b5.conscientiousness > 60) traits.push("organizado/a y responsable");
          if (b5.extraversion > 60) traits.push("extrovertido/a y sociable");
          if (b5.agreeableness > 60) traits.push("amable y cooperativo/a");
          if (b5.neuroticism > 60) traits.push("emocionalmente sensible");
        }

        if (traits.length > 0) {
          systemPrompt += ` Eres ${traits.join(", ")}.`;
        }

        if (personalityCore.coreValues && personalityCore.coreValues.length > 0) {
          systemPrompt += ` Valoras: ${personalityCore.coreValues.join(", ")}.`;
        }
      }

      if (emotionalTone) {
        const toneDescriptions: Record<string, string> = {
          romantic: "romántico/a y apasionado/a",
          adventurous: "aventurero/a y audaz",
          cheerful: "alegre y optimista",
          mysterious: "misterioso/a y enigmático/a",
          dramatic: "dramático/a e intenso/a",
          magical: "mágico/a y maravilloso/a",
          scientific: "analítico/a y racional",
          dark: "oscuro/a y complejo/a",
          heroic: "heroico/a y valiente",
          playful: "juguetón/a y divertido/a",
        };

        const toneDesc = toneDescriptions[emotionalTone];
        if (toneDesc) {
          systemPrompt += ` Tu tono es ${toneDesc}.`;
        }
      }

      // Extract location for weather system
      let locationCity = null;
      let locationCountry = null;

      if (characterAppearance?.currentLocation) {
        locationCity = characterAppearance.currentLocation.city;
        locationCountry = characterAppearance.currentLocation.country;
      }

      // Create agent
      const agent = await prisma.agent.create({
        data: {
          userId,
          kind: "companion", // Smart Start always creates companions
          generationTier: tier,
          name,
          description: physicalAppearance || `Personaje creado con Smart Start`,
          personality: personalityCore ? JSON.stringify(personalityCore.bigFive) : null,
          purpose: genre ? `Personaje de ${genre}` : null,
          tone: emotionalTone || null,
          profile: profile,
          systemPrompt,
          visibility: "private",
          locationCity,
          locationCountry,
        },
      });

      // For ULTRA tier: Create psychological profile if we have personality data
      if (tier === 'ultra' && personalityCore) {
        await prisma.psychologicalProfile.create({
          data: {
            agentId: agent.id,
            attachmentStyle: personalityCore.attachmentStyle || 'secure',
            attachmentDescription: personalityCore.attachmentDescription,
            primaryCopingMechanisms: personalityCore.primaryCopingMechanisms || [],
            unhealthyCopingMechanisms: personalityCore.unhealthyCopingMechanisms || [],
            copingTriggers: personalityCore.copingTriggers || [],
            emotionalRegulationBaseline: 'estable',
            emotionalExplosiveness: personalityCore.bigFive?.neuroticism || 30,
            emotionalRecoverySpeed: 'moderado',
            mentalHealthConditions: [],
            defenseMethanisms: {},
            resilienceFactors: personalityCore.coreValues || [],
            selfAwarenessLevel: personalityCore.bigFive?.openness || 50,
            blindSpots: [],
            insightAreas: [],
          },
        });
      }

      return NextResponse.json(
        {
          success: true,
          agent: {
            id: agent.id,
            name: agent.name,
            description: agent.description,
            imageUrl: searchResult?.imageUrl || null,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("[Smart Start Create] Error:", error);
      return NextResponse.json(
        { error: "Failed to create character" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Smart Start Create] Error:", error);
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 }
    );
  }
}
