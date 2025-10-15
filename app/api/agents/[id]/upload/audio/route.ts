import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/agents/[id]/upload/audio
 *
 * Upload de audio y transcripción con análisis emocional
 *
 * Flow:
 * 1. Recibe audio del usuario
 * 2. Transcribe con Whisper (gpt-4o-audio-preview)
 * 3. Analiza emoción, tono y contexto del usuario
 * 4. Guarda mensaje en DB
 * 5. Retorna transcripción y análisis emocional
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentId = params.id;
    const formData = await request.formData();

    const audioFile = formData.get("audio") as Blob | null;
    const duration = formData.get("duration") as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Verificar que el agente existe y pertenece al usuario
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { id: true, userId: true, name: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Convertir Blob a File para OpenAI
    const audioBuffer = await audioFile.arrayBuffer();
    const file = new File([audioBuffer], "audio.webm", {
      type: audioFile.type,
    });

    // Step 1: Transcribir audio con Whisper
    console.log("Transcribing audio...");
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "es", // Español
      response_format: "verbose_json",
    });

    const transcribedText = transcription.text;

    if (!transcribedText || transcribedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not transcribe audio" },
        { status: 400 }
      );
    }

    // Step 2: Analizar emoción y tono del usuario usando GPT-4
    console.log("Analyzing emotional state...");
    const emotionalAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un experto en análisis emocional. Analiza el siguiente texto transcrito de un mensaje de voz y determina:
1. La emoción principal del usuario (happy, sad, angry, anxious, excited, neutral, confused, frustrated)
2. La intensidad emocional (low, medium, high)
3. El tono de voz implícito (formal, casual, enthusiastic, monotone, urgent)
4. El contexto emocional (qué está sintiendo y por qué)

Responde SOLO con un JSON válido en este formato exacto:
{
  "emotion": "emotion_name",
  "intensity": "low|medium|high",
  "tone": "tone_description",
  "context": "brief emotional context"
}`,
        },
        {
          role: "user",
          content: `Texto transcrito: "${transcribedText}"`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const analysisContent = emotionalAnalysis.choices[0]?.message?.content;
    let emotionalData = {
      emotion: "neutral",
      intensity: "medium",
      tone: "casual",
      context: "Usuario envió un mensaje de voz",
    };

    if (analysisContent) {
      try {
        emotionalData = JSON.parse(analysisContent);
      } catch (error) {
        console.error("Error parsing emotional analysis:", error);
      }
    }

    // Step 3: Guardar mensaje en base de datos
    const message = await prisma.message.create({
      data: {
        agentId,
        userId: session.user.id,
        content: transcribedText,
        role: "user",
        metadata: {
          type: "audio",
          duration: duration ? parseInt(duration) : 0,
          emotion: emotionalData.emotion,
          intensity: emotionalData.intensity,
          tone: emotionalData.tone,
          emotionalContext: emotionalData.context,
          transcribedAt: new Date().toISOString(),
        },
      },
    });

    // Step 4: Retornar resultado
    return NextResponse.json({
      success: true,
      messageId: message.id,
      transcription: transcribedText,
      emotional: emotionalData,
      duration: duration ? parseInt(duration) : 0,
    });
  } catch (error: any) {
    console.error("Error in audio upload:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
