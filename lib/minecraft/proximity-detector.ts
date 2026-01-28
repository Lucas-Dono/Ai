import {
  MinecraftPlayer,
  MinecraftAgent,
  MinecraftPosition,
  ProximityContext,
  AgentProximityInfo,
  DEFAULT_MINECRAFT_CHAT_CONFIG,
} from "@/types/minecraft-chat";

/**
 * Proximity Detector para Minecraft
 *
 * Detecta qué agentes están cerca del jugador y calcula scores de confianza
 * para determinar si el mensaje es individual o grupal.
 *
 * Sistema de scoring:
 * - Distancia: Más cerca = mayor score (max 40 pts)
 * - Visibilidad: En línea de visión = +20 pts
 * - Dirección: Mirando directamente = +30 pts
 * - Menciones: Nombre mencionado = +100 pts
 *
 * Scores:
 * - 80-100: Casi seguro es el target principal
 * - 60-79: Probablemente incluido en la conversación
 * - 40-59: Posiblemente escucha
 * - 0-39: Probablemente no es parte de la conversación
 */

export class ProximityDetector {
  private readonly config = DEFAULT_MINECRAFT_CHAT_CONFIG;

  /**
   * Analiza el contexto de proximidad del jugador
   */
  async analyzeProximity(
    player: MinecraftPlayer,
    nearbyAgents: MinecraftAgent[],
    message: string
  ): Promise<ProximityContext> {
    // 1. Filtrar agentes dentro del radio de proximidad
    const agentsInRange = this.filterByProximity(
      player.position,
      nearbyAgents,
      this.config.proximityRadius
    );

    if (agentsInRange.length === 0) {
      return {
        player,
        nearbyAgents: [],
        primaryTarget: null,
        isGroupConversation: false,
        detectedAt: new Date(),
      };
    }

    // 2. Calcular scores para cada agente
    const proximityInfos = agentsInRange.map((agent) =>
      this.calculateProximityScore(player, agent, message)
    );

    // 3. Ordenar por score descendente
    const sorted = proximityInfos.sort(
      (a, b) => b.confidenceScore - a.confidenceScore
    );

    // 4. Determinar target principal
    const primaryTarget = sorted[0];

    // 5. Determinar si es conversación grupal o individual
    const isGroupConversation = this.determineConversationType(
      sorted,
      message
    );

    return {
      player,
      nearbyAgents: sorted,
      primaryTarget: primaryTarget || null,
      isGroupConversation,
      detectedAt: new Date(),
    };
  }

  /**
   * Filtra agentes dentro del radio de proximidad
   */
  private filterByProximity(
    playerPos: MinecraftPosition,
    agents: MinecraftAgent[],
    radius: number
  ): MinecraftAgent[] {
    return agents.filter((agent) => {
      const distance = this.calculateDistance3D(
        playerPos,
        agent.position
      );
      return distance <= radius && agent.isActive;
    });
  }

  /**
   * Calcula score de proximidad para un agente
   */
  private calculateProximityScore(
    player: MinecraftPlayer,
    agent: MinecraftAgent,
    message: string
  ): AgentProximityInfo {
    const reasons: string[] = [];
    let score = 0;

    // 1. Calcular distancia (0-40 pts)
    const distance = this.calculateDistance3D(
      player.position,
      agent.position
    );
    const distanceScore = Math.max(
      0,
      40 * (1 - distance / this.config.proximityRadius)
    );
    score += distanceScore;

    if (distance <= 5) {
      reasons.push("muy cerca (< 5 bloques)");
    } else if (distance <= 10) {
      reasons.push("cerca (< 10 bloques)");
    }

    // 2. Visibilidad - línea de visión (0 o 20 pts)
    const isVisible = this.checkLineOfSight(
      player.position,
      agent.position
    );
    if (isVisible) {
      score += 20;
      reasons.push("en línea de visión");
    }

    // 3. Dirección - ¿está mirando al agente? (0 o 30 pts)
    const isFacing = this.isPlayerFacing(
      player.position,
      agent.position,
      this.config.facingAngleThreshold
    );
    if (isFacing) {
      score += 30;
      reasons.push("jugador mirando directamente");
    }

    // 4. Menciones en el mensaje (+100 pts si mencionado)
    const isMentioned = this.isAgentMentioned(agent.name, message);
    if (isMentioned) {
      score += 100;
      reasons.push("mencionado por nombre");
    }

    return {
      agent,
      distance,
      isVisible,
      isFacing,
      confidenceScore: Math.min(100, score), // Cap a 100
      reasons,
    };
  }

  /**
   * Calcula distancia euclidiana 3D
   */
  private calculateDistance3D(
    pos1: MinecraftPosition,
    pos2: MinecraftPosition
  ): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Verifica línea de visión (line of sight)
   *
   * Simplificación: Asume que si la diferencia de altura es < 3 bloques
   * y no hay obstrucciones obvias, hay línea de visión.
   *
   * En producción, esto debería hacer raycast en el servidor de Minecraft.
   */
  private checkLineOfSight(
    playerPos: MinecraftPosition,
    agentPos: MinecraftPosition
  ): boolean {
    // Simplificación: si diferencia de altura > 3 bloques, probablemente no hay LoS
    const heightDiff = Math.abs(playerPos.y - agentPos.y);
    if (heightDiff > 3) {
      return false;
    }

    // TODO: En producción, solicitar raycast al servidor de Minecraft
    // Por ahora, asumimos LoS si están en alturas similares
    return true;
  }

  /**
   * Verifica si el jugador está mirando al agente
   *
   * Calcula el ángulo entre la dirección del jugador (yaw/pitch)
   * y el vector hacia el agente.
   */
  private isPlayerFacing(
    playerPos: MinecraftPosition,
    agentPos: MinecraftPosition,
    angleThreshold: number
  ): boolean {
    // Si no hay datos de orientación, no podemos determinar
    if (playerPos.yaw === undefined || playerPos.pitch === undefined) {
      return false;
    }

    // Vector del jugador al agente
    const dx = agentPos.x - playerPos.x;
    const dy = agentPos.y - playerPos.y;
    const dz = agentPos.z - playerPos.z;

    // Calcular yaw del vector (ángulo horizontal)
    let targetYaw = Math.atan2(dz, dx) * (180 / Math.PI);
    targetYaw = (targetYaw + 360) % 360; // Normalizar 0-360

    // Calcular pitch del vector (ángulo vertical)
    const horizontalDist = Math.sqrt(dx * dx + dz * dz);
    let targetPitch = -Math.atan2(dy, horizontalDist) * (180 / Math.PI);

    // Calcular diferencia angular
    const yawDiff = this.getAngularDifference(playerPos.yaw, targetYaw);
    const pitchDiff = Math.abs(playerPos.pitch - targetPitch);

    // Verificar si está dentro del threshold
    return yawDiff <= angleThreshold && pitchDiff <= angleThreshold;
  }

  /**
   * Calcula la diferencia angular más corta (considerando wrap-around 0-360)
   */
  private getAngularDifference(angle1: number, angle2: number): number {
    let diff = Math.abs(angle1 - angle2);
    if (diff > 180) {
      diff = 360 - diff;
    }
    return diff;
  }

  /**
   * Verifica si el agente es mencionado en el mensaje
   */
  private isAgentMentioned(agentName: string, message: string): boolean {
    const normalizedMessage = message.toLowerCase();
    const normalizedName = agentName.toLowerCase();

    // Buscar menciones: "@nombre", "nombre", o partes del nombre
    const patterns = [
      `@${normalizedName}`,
      normalizedName,
      ...this.getNameVariations(normalizedName),
    ];

    return patterns.some((pattern) => normalizedMessage.includes(pattern));
  }

  /**
   * Genera variaciones del nombre para detección flexible
   */
  private getNameVariations(name: string): string[] {
    const variations: string[] = [];

    // Primer nombre si tiene espacios
    if (name.includes(" ")) {
      variations.push(name.split(" ")[0]);
    }

    // Apodos comunes (primeras 4 letras)
    if (name.length >= 4) {
      variations.push(name.substring(0, 4));
    }

    return variations;
  }

  /**
   * Determina si es conversación grupal o individual
   *
   * Criterios:
   * - Si hay múltiples agentes con score > 60 → grupal
   * - Si hay menciones múltiples → grupal
   * - Si el score del primero es > 80 y los demás < 50 → individual
   * - Palabras clave grupales ("todos", "chicos", "equipo") → grupal
   */
  private determineConversationType(
    sortedProximities: AgentProximityInfo[],
    message: string
  ): boolean {
    if (sortedProximities.length === 0) return false;
    if (sortedProximities.length === 1) return false;

    // Contar agentes con score significativo (> 60)
    const highScoreAgents = sortedProximities.filter(
      (p) => p.confidenceScore > 60
    );

    if (highScoreAgents.length >= 2) {
      return true; // Múltiples targets claros → grupal
    }

    // Verificar palabras clave grupales
    const groupKeywords = [
      "todos",
      "chicos",
      "chicas",
      "equipo",
      "grupo",
      "amigos",
      "ustedes",
      "vosotros",
      "hey all",
      "everyone",
      "guys",
    ];

    const normalizedMessage = message.toLowerCase();
    const hasGroupKeyword = groupKeywords.some((keyword) =>
      normalizedMessage.includes(keyword)
    );

    if (hasGroupKeyword) {
      return true;
    }

    // Si el primero tiene score muy alto (> 80) y los demás bajo (< 50) → individual
    const first = sortedProximities[0];
    const others = sortedProximities.slice(1);

    if (
      first.confidenceScore > 80 &&
      others.every((p) => p.confidenceScore < 50)
    ) {
      return false; // Claramente individual
    }

    // Por defecto, si hay múltiples agentes cercanos → grupal
    return sortedProximities.length >= 2;
  }

  /**
   * Filtra agentes que deberían responder basado en scores
   */
  public selectRespondingAgents(
    proximityInfos: AgentProximityInfo[],
    maxResponders: number = this.config.maxResponders
  ): MinecraftAgent[] {
    // Filtrar solo agentes con score significativo (> 40)
    const candidates = proximityInfos.filter(
      (p) => p.confidenceScore > 40
    );

    // Ordenar por score y tomar los top N
    const sorted = candidates.sort(
      (a, b) => b.confidenceScore - a.confidenceScore
    );

    return sorted
      .slice(0, maxResponders)
      .map((p) => p.agent);
  }

  /**
   * Utility: Convierte bloques a metros (1 bloque ≈ 2 metros)
   */
  public static blocksToMeters(blocks: number): number {
    return blocks * 2;
  }

  /**
   * Utility: Convierte metros a bloques
   */
  public static metersToBlocks(meters: number): number {
    return meters / 2;
  }
}

// Exportar instancia singleton
export const proximityDetector = new ProximityDetector();
