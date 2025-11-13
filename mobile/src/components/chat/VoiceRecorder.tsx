/**
 * Componente de grabación de voz con visualización de ondas en tiempo real
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import {
  useAudioRecorder,
  RecordingOptions,
  AudioModule,
  AudioQuality,
  IOSOutputFormat,
} from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface VoiceRecorderProps {
  onSend: (audioUri: string, duration: number) => void;
  onCancel: () => void;
  isHoldMode?: boolean;
}

const WAVE_BAR_COUNT = 30;
const MAX_RECORDING_TIME = 120; // 2 minutos

export function VoiceRecorder({ onSend, onCancel, isHoldMode = false }: VoiceRecorderProps) {
  const audioRecorder = useAudioRecorder({
    extension: '.m4a',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    android: {
      outputFormat: 'mpeg4',
      audioEncoder: 'aac',
    },
    ios: {
      outputFormat: IOSOutputFormat.MPEG4AAC,
      audioQuality: AudioQuality.HIGH,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  });
  const [duration, setDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(
    new Array(WAVE_BAR_COUNT).fill(0.1)
  );

  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const levelUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const prevHoldMode = useRef(isHoldMode);

  useEffect(() => {
    startRecording();

    // Animación de entrada
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();

    // Animación de pulso del botón
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      stopRecording();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (levelUpdateInterval.current) {
        clearInterval(levelUpdateInterval.current);
      }
    };
  }, []);

  // Auto-enviar cuando se suelta en modo hold
  useEffect(() => {
    // Detectar cuando cambia de true (presionado) a false (soltado)
    if (prevHoldMode.current === true && isHoldMode === false && audioRecorder.isRecording && duration > 0) {
      // El usuario soltó el botón en modo hold
      handleSend();
    }

    // Actualizar el valor anterior
    prevHoldMode.current = isHoldMode;
  }, [isHoldMode, audioRecorder.isRecording, duration]);

  const startRecording = async () => {
    try {
      // Solicitar permisos
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        console.error('Permiso de audio denegado');
        onCancel();
        return;
      }

      // Iniciar grabación
      await audioRecorder.record();

      // Iniciar contador de duración
      durationInterval.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= MAX_RECORDING_TIME) {
            handleSend();
          }
          return newDuration;
        });
      }, 1000) as unknown as NodeJS.Timeout;

      // Actualizar niveles de audio simulados
      levelUpdateInterval.current = setInterval(() => {
        const randomLevel = Math.random() * 0.8 + 0.2;
        updateAudioLevels(randomLevel);
      }, 100) as unknown as NodeJS.Timeout;
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      onCancel();
    }
  };

  const updateAudioLevels = (level: number) => {
    setAudioLevels((prev) => {
      const newLevels = [...prev.slice(1), Math.abs(level)];
      return newLevels;
    });
  };

  const stopRecording = async () => {
    if (!audioRecorder.isRecording) return;

    try {
      await audioRecorder.stop();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (levelUpdateInterval.current) {
        clearInterval(levelUpdateInterval.current);
      }
    } catch (error) {
      console.error('Error al detener grabación:', error);
    }
  };

  const handleSend = async () => {
    if (!audioRecorder.isRecording) return;

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        onSend(uri, duration);
      }
    } catch (error) {
      console.error('Error al enviar audio:', error);
      onCancel();
    }
  };

  const handleCancel = async () => {
    await stopRecording();
    onCancel();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX }],
        },
      ]}
    >
      {/* Indicador de grabación */}
      <View style={styles.recordingIndicator}>
        <View style={styles.recordingDot} />
        <Text style={styles.recordingText}>
          {isHoldMode ? 'Suelta para enviar' : 'Grabando...'}
        </Text>
      </View>

      <View style={styles.gradient}>
        {/* Botón de cancelar */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>

        {/* Visualización de ondas */}
        <View style={styles.waveContainer}>
          <View style={styles.waveBars}>
            {audioLevels.map((level, index) => {
              // Normalizar el nivel entre 4 y 40 píxeles
              const normalizedLevel = Math.min(Math.max(level, 0), 1);
              const height = 4 + (normalizedLevel * 36); // Min 4px, Max 40px
              const opacity = 0.4 + (normalizedLevel * 0.6);

              return (
                <View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      height,
                      opacity,
                      backgroundColor: colors.primary[500],
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Tiempo de grabación */}
          <Text style={styles.duration}>{formatDuration(duration)}</Text>
        </View>

        {/* Botón de enviar */}
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="send" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  cancelButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  waveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 80,
  },
  waveBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    gap: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    minHeight: 4,
    maxHeight: 40,
  },
  duration: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginLeft: spacing.sm,
  },
  sendButtonGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: spacing.xs,
  },
  recordingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#fff',
  },
});
