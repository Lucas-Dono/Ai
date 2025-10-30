/**
 * Reproductor de mensajes de audio con visualización de onda
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface AudioMessagePlayerProps {
  audioUri: string;
  duration?: number;
  isUser: boolean;
}

export function AudioMessagePlayer({
  audioUri,
  duration = 0,
  isUser,
}: AudioMessagePlayerProps) {
  const player = useAudioPlayer(audioUri);
  const [isLoading, setIsLoading] = useState(false);
  const [audioDuration, setAudioDuration] = useState(duration * 1000); // Convert to ms

  useEffect(() => {
    // Actualizar duración si está disponible
    if (player.duration && player.duration > 0) {
      setAudioDuration(player.duration * 1000);
    }
  }, [player.duration]);

  const loadAndPlayAudio = async () => {
    try {
      setIsLoading(true);

      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error al reproducir audio:', error);
      setIsLoading(false);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (audioDuration === 0) return 0;
    const currentPos = (player.currentTime || 0) * 1000;
    return (currentPos / audioDuration) * 100;
  };

  const getCurrentPosition = (): number => {
    return (player.currentTime || 0) * 1000;
  };

  const iconColor = isUser ? colors.text.primary : colors.primary[500];
  const textColor = isUser ? colors.text.primary : colors.text.primary;

  return (
    <View style={styles.container}>
      {/* Botón de play/pause */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={loadAndPlayAudio}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <Ionicons
            name={player.playing ? 'pause' : 'play'}
            size={24}
            color={iconColor}
          />
        )}
      </TouchableOpacity>

      {/* Barra de progreso y tiempo */}
      <View style={styles.progressContainer}>
        {/* Barra de progreso */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${getProgress()}%`,
                backgroundColor: isUser ? 'rgba(255,255,255,0.5)' : colors.primary[400],
              },
            ]}
          />
        </View>

        {/* Tiempo */}
        <Text style={[styles.timeText, { color: textColor }]}>
          {player.playing || getCurrentPosition() > 0
            ? formatTime(getCurrentPosition())
            : formatTime(audioDuration)}
        </Text>
      </View>

      {/* Ícono de audio */}
      <Ionicons name="mic" size={16} color={iconColor} style={styles.micIcon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
    paddingVertical: spacing.xs,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeText: {
    fontSize: typography.fontSize.xs,
    fontVariant: ['tabular-nums'],
  },
  micIcon: {
    marginLeft: spacing.sm,
  },
});
