/**
 * Configuración de voces por personaje
 *
 * Ajustes específicos para cada personaje de Academia Sakura
 * para lograr voces más naturales y expresivas
 */

export interface CharacterVoiceConfig {
  voiceId: string;
  name: string;
  // Configuración de Eleven Labs
  stability: number;           // 0-1: Más bajo = más expresivo, más alto = más estable
  similarityBoost: number;      // 0-1: Qué tan similar a la voz original
  style: number;                // 0-1: Exageración del estilo (0 = natural, 1 = exagerado)
  useSpeakerBoost: boolean;     // Mejora la claridad
  // Ajustes de audio
  speed: number;                // 1.0 = normal, 1.1-1.3 = más rápido (recomendado)
  volume: number;               // 0-1: Volumen del audio (1.0 = normal, 0.7 = 30% más bajo)
}

/**
 * Configuración optimizada por personaje
 */
export const CHARACTER_VOICE_CONFIGS: Record<string, CharacterVoiceConfig> = {
  // Hana Sakamoto - Tsundere
  'xzWD1ftyNVsuUMY2ll3j': {
    voiceId: 'xzWD1ftyNVsuUMY2ll3j',
    name: 'Hana Sakamoto',
    stability: 0.45,           // Menos estable = más expresiva (tsundere)
    similarityBoost: 0.70,     // Un poco variada para mostrar emociones
    style: 0.2,                // Algo de estilo pero no exagerado
    useSpeakerBoost: true,
    speed: 1.15,               // 15% más rápido (habla rápido cuando está nerviosa)
    volume: 1.0,               // Volumen normal
  },

  // Yuki Tanaka - Deportista
  'iFhPOZcajR7W3sDL39qJ': {
    voiceId: 'iFhPOZcajR7W3sDL39qJ',
    name: 'Yuki Tanaka',
    stability: 0.55,           // Más estable (confiada)
    similarityBoost: 0.75,     // Voz consistente
    style: 0.15,               // Natural, no exagerado
    useSpeakerBoost: true,
    speed: 1.2,                // 20% más rápido (energética)
    volume: 0.65,              // 35% más bajo (voz muy ruidosa, bajar decibeles)
  },

  // Aiko Miyazaki - Tímida
  'CaJslL1xziwefCeTNzHv': {
    voiceId: 'CaJslL1xziwefCeTNzHv',
    name: 'Aiko Miyazaki',
    stability: 0.35,           // Menos estable (nerviosa, tartamudea)
    similarityBoost: 0.65,     // Más variación (inseguridad)
    style: 0.1,                // Muy natural
    useSpeakerBoost: true,
    speed: 1.0,                // Normal o un poco más lento (habla suave)
    volume: 1.0,               // Volumen normal
  },

  // Kenji Yamamoto - Otaku
  'tomkxGQGz4b1kE0EM722': {
    voiceId: 'tomkxGQGz4b1kE0EM722',
    name: 'Kenji Yamamoto',
    stability: 0.40,           // Variable (se emociona hablando de anime)
    similarityBoost: 0.70,
    style: 0.25,               // Algo expresivo
    useSpeakerBoost: true,
    speed: 1.25,               // 25% más rápido (habla rápido cuando se emociona)
    volume: 1.0,               // Volumen normal
  },
};

/**
 * Configuración por defecto para voces sin configuración específica
 */
export const DEFAULT_VOICE_CONFIG: Omit<CharacterVoiceConfig, 'voiceId' | 'name'> = {
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.15,
  useSpeakerBoost: true,
  speed: 1.15,
  volume: 1.0,
};

/**
 * Obtiene la configuración de voz para un personaje
 */
export function getVoiceConfig(voiceId: string): CharacterVoiceConfig {
  return CHARACTER_VOICE_CONFIGS[voiceId] || {
    voiceId,
    name: 'Unknown',
    ...DEFAULT_VOICE_CONFIG,
  };
}

/**
 * Genera los voice settings para Eleven Labs
 */
export function getVoiceSettings(voiceId: string) {
  const config = getVoiceConfig(voiceId);

  return {
    stability: config.stability,
    similarity_boost: config.similarityBoost,
    style: config.style,
    use_speaker_boost: config.useSpeakerBoost,
  };
}
