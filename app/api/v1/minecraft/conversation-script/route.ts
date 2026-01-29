import { NextRequest, NextResponse } from "next/server";
import { ConversationScriptGenerator } from "@/lib/minecraft/conversation-script-generator";
import { ConversationScriptManager } from "@/lib/minecraft/conversation-script-manager";
import { AmbientDialogueService } from "@/lib/minecraft/ambient-dialogue-service";

/**
 * POST /api/v1/minecraft/conversation-script
 *
 * Inicia o recupera una conversación con guión completo para un grupo
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { agentIds, location, contextHint, groupHash, forceNew } = body;

    // Validaciones
    if (!Array.isArray(agentIds) || agentIds.length < 2) {
      return NextResponse.json(
        { error: "Se requieren al menos 2 agentIds" },
        { status: 400 }
      );
    }

    if (!location) {
      return NextResponse.json(
        { error: "Se requiere location" },
        { status: 400 }
      );
    }

    if (!groupHash) {
      return NextResponse.json(
        { error: "Se requiere groupHash" },
        { status: 400 }
      );
    }

    // Verificar si ya hay una conversación activa
    const existingProgress = ConversationScriptManager.getProgress(groupHash);

    if (existingProgress && !forceNew) {
      // Retornar conversación existente
      const script = ConversationScriptManager.getScript(existingProgress.scriptId);

      if (script) {
        return NextResponse.json({
          scriptId: script.scriptId,
          topic: script.topic,
          totalLines: script.lines.length,
          currentLineIndex: existingProgress.currentLineIndex,
          currentPhase: existingProgress.currentPhase,
          completed: existingProgress.completed,
          progress: (existingProgress.currentLineIndex / script.lines.length) * 100,
        });
      }
    }

    // Obtener información de participantes
    const participants = await AmbientDialogueService.getParticipantInfo(agentIds);

    // Generar nuevo guión
    const result = await ConversationScriptGenerator.generateScript({
      participants,
      location,
      contextHint,
      desiredLength: 12, // 12 líneas por defecto
      useTemplate: true, // Preferir templates (gratis)
    });

    // Iniciar conversación
    const progress = await ConversationScriptManager.startConversation(
      groupHash,
      result.script,
      {
        minDelayBetweenLines: 4, // 4 segundos mínimo
        maxDelayBetweenLines: 7, // 7 segundos máximo
        pauseAtPhaseChange: 3, // 3 segundos extra en cambios de fase
        loopAfterCompletion: true,
        loopDelay: 180, // 3 minutos antes de reiniciar
      }
    );

    return NextResponse.json({
      scriptId: result.script.scriptId,
      topic: result.script.topic,
      totalLines: result.script.lines.length,
      currentLineIndex: progress.currentLineIndex,
      currentPhase: progress.currentPhase,
      completed: progress.completed,
      progress: 0,
      source: result.source,
      cost: result.cost,
      generatedBy: result.script.generatedBy,
    });
  } catch (error) {
    console.error("[Conversation Script API] Error:", error);
    return NextResponse.json(
      {
        error: "Error al generar guión conversacional",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/minecraft/conversation-script?groupHash=xxx
 *
 * Obtener línea actual de una conversación activa
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const groupHash = searchParams.get("groupHash");
    const action = searchParams.get("action"); // "current" | "upcoming" | "progress"
    const playerId = searchParams.get("playerId"); // Para tracking de listeners

    if (!groupHash) {
      return NextResponse.json(
        { error: "Se requiere groupHash" },
        { status: 400 }
      );
    }

    // Registrar jugador como listener si se provee
    if (playerId) {
      ConversationScriptManager.addListener(groupHash, playerId);
    }

    // Obtener progreso
    const progress = ConversationScriptManager.getProgress(groupHash);

    if (!progress) {
      return NextResponse.json(
        { error: "No hay conversación activa para este grupo" },
        { status: 404 }
      );
    }

    const script = ConversationScriptManager.getScript(progress.scriptId);

    if (!script) {
      return NextResponse.json(
        { error: "Script no encontrado" },
        { status: 404 }
      );
    }

    // Según la acción solicitada
    if (action === "upcoming") {
      // Próximas 3 líneas
      const upcomingLines = ConversationScriptManager.getUpcomingLines(groupHash, 3);

      return NextResponse.json({
        groupHash,
        upcomingLines: upcomingLines.map((line) => ({
          agentId: line.agentId,
          agentName: line.agentName,
          message: line.message,
          phase: line.phase,
          lineNumber: line.lineNumber,
        })),
        totalLines: script.lines.length,
        currentLineIndex: progress.currentLineIndex,
      });
    }

    if (action === "progress") {
      // Solo información de progreso
      return NextResponse.json({
        groupHash,
        scriptId: script.scriptId,
        topic: script.topic,
        totalLines: script.lines.length,
        currentLineIndex: progress.currentLineIndex,
        currentPhase: progress.currentPhase,
        completed: progress.completed,
        progress: (progress.currentLineIndex / script.lines.length) * 100,
        listeners: progress.listeners.length,
      });
    }

    // Por defecto: línea actual
    const currentLine = ConversationScriptManager.getCurrentLine(groupHash);

    if (!currentLine) {
      return NextResponse.json({
        groupHash,
        currentLine: null,
        completed: progress.completed,
        message: progress.completed ? "Conversación completada" : "Esperando inicio",
      });
    }

    return NextResponse.json({
      groupHash,
      currentLine: {
        agentId: currentLine.agentId,
        agentName: currentLine.agentName,
        message: currentLine.message,
        phase: currentLine.phase,
        lineNumber: currentLine.lineNumber,
      },
      totalLines: script.lines.length,
      currentLineIndex: progress.currentLineIndex - 1, // -1 porque ya avanzó
      currentPhase: progress.currentPhase,
      completed: progress.completed,
      progress: ((progress.currentLineIndex - 1) / script.lines.length) * 100,
    });
  } catch (error) {
    console.error("[Conversation Script API] Error:", error);
    return NextResponse.json(
      {
        error: "Error al obtener línea actual",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/minecraft/conversation-script?groupHash=xxx
 *
 * Detener conversación
 */
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const groupHash = searchParams.get("groupHash");

    if (!groupHash) {
      return NextResponse.json(
        { error: "Se requiere groupHash" },
        { status: 400 }
      );
    }

    ConversationScriptManager.stopConversation(groupHash);

    return NextResponse.json({
      success: true,
      message: "Conversación detenida",
    });
  } catch (error) {
    console.error("[Conversation Script API] Error:", error);
    return NextResponse.json(
      {
        error: "Error al detener conversación",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
