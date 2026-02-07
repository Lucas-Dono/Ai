/**
 * Voice Selector with ElevenLabs Samples
 *
 * Galería de voces con previews gratuitos usando samples de ElevenLabs
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Audio } from 'expo-av';
import {
  Play,
  Pause,
  Volume2,
  Search,
  User,
  Check,
  Filter,
} from 'lucide-react-native';
import { colors } from '../../theme';
import * as Haptics from 'expo-haptics';

// ============================================================================
// TYPES
// ============================================================================

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  preview_url: string;
  category: string;
  labels: {
    accent?: string;
    age?: string;
    gender?: string;
    use_case?: string;
    descriptive?: string;
  };
  description?: string;
}

interface VoiceSelectorProps {
  selectedVoiceId?: string;
  onVoiceSelect: (voiceId: string, voiceName: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function VoiceSelector({
  selectedVoiceId,
  onVoiceSelect,
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Cargar voces de ElevenLabs
  useEffect(() => {
    loadVoices();

    // Cleanup audio al desmontar
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadVoices = async () => {
    try {
      setLoading(true);

      // Llamar al endpoint de ElevenLabs
      const response = await fetch('https://api.elevenlabs.io/v1/voices');

      if (!response.ok) {
        throw new Error('Error loading voices');
      }

      const data = await response.json();
      setVoices(data.voices || []);
    } catch (error) {
      console.error('Error loading voices:', error);
      // Fallback con algunas voces de ejemplo
      setVoices([
        {
          voice_id: 'pNInz6obpgDQGcFmaJgB',
          name: 'Adam',
          preview_url: '',
          category: 'premade',
          labels: {
            gender: 'male',
            age: 'middle_aged',
            accent: 'american',
            use_case: 'narration',
          },
        },
        {
          voice_id: 'EXAVITQu4vr4xnSDxMaL',
          name: 'Sarah',
          preview_url: '',
          category: 'premade',
          labels: {
            gender: 'female',
            age: 'young',
            accent: 'american',
            use_case: 'conversational',
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const playVoicePreview = async (voice: ElevenLabsVoice) => {
    try {
      // Si ya está reproduciendo, pausar
      if (playingVoiceId === voice.voice_id && sound) {
        await sound.pauseAsync();
        setPlayingVoiceId(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
      }

      // Si hay otro sonido reproduciéndose, detenerlo
      if (sound) {
        await sound.unloadAsync();
      }

      // Si no hay preview_url, usar la API de ElevenLabs para obtener un sample
      const audioUrl = voice.preview_url ||
        `https://api.elevenlabs.io/v1/text-to-speech/${voice.voice_id}?text=Hello, this is a preview of my voice.`;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Configurar y reproducir audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingVoiceId(voice.voice_id);

      // Cuando termine, limpiar
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingVoiceId(null);
        }
      });
    } catch (error) {
      console.error('Error playing voice:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSelectVoice = (voice: ElevenLabsVoice) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onVoiceSelect(voice.voice_id, voice.name);
  };

  // Filtrar voces
  const filteredVoices = voices.filter((voice) => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.labels.accent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.labels.descriptive?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGender =
      genderFilter === 'all' ||
      voice.labels.gender === genderFilter;

    return matchesSearch && matchesGender;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Cargando voces...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Volume2 size={20} color="#8b5cf6" />
        <Text style={styles.title}>Seleccionar Voz</Text>
      </View>

      <Text style={styles.subtitle}>
        Escucha samples gratuitos de cientos de voces
      </Text>

      {/* Búsqueda y Filtros */}
      <View style={styles.filters}>
        {/* Búsqueda */}
        <View style={styles.searchContainer}>
          <Search size={16} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, acento..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filtro de género */}
        <View style={styles.genderFilters}>
          {[
            { value: 'all', label: 'Todos' },
            { value: 'male', label: 'Masculino' },
            { value: 'female', label: 'Femenino' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                genderFilter === filter.value && styles.filterButtonActive,
              ]}
              onPress={() => {
                setGenderFilter(filter.value as any);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  genderFilter === filter.value && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista de Voces */}
      <ScrollView
        style={styles.voiceList}
        showsVerticalScrollIndicator={false}
      >
        {filteredVoices.length === 0 ? (
          <View style={styles.emptyState}>
            <Filter size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No se encontraron voces</Text>
            <Text style={styles.emptySubtext}>
              Intenta con otros filtros o búsqueda
            </Text>
          </View>
        ) : (
          filteredVoices.map((voice) => {
            const isPlaying = playingVoiceId === voice.voice_id;
            const isSelected = selectedVoiceId === voice.voice_id;

            return (
              <View
                key={voice.voice_id}
                style={[
                  styles.voiceCard,
                  isSelected && styles.voiceCardSelected,
                ]}
              >
                <View style={styles.voiceInfo}>
                  {/* Avatar/Icon */}
                  <View style={[
                    styles.voiceAvatar,
                    isSelected && styles.voiceAvatarSelected,
                  ]}>
                    {isSelected ? (
                      <Check size={20} color="#ffffff" />
                    ) : (
                      <User size={20} color={colors.text.tertiary} />
                    )}
                  </View>

                  {/* Detalles */}
                  <View style={styles.voiceDetails}>
                    <Text style={styles.voiceName}>{voice.name}</Text>

                    <View style={styles.voiceLabels}>
                      {voice.labels.gender && (
                        <View style={styles.label}>
                          <Text style={styles.labelText}>
                            {voice.labels.gender === 'male' ? 'M' : 'F'}
                          </Text>
                        </View>
                      )}
                      {voice.labels.age && (
                        <View style={styles.label}>
                          <Text style={styles.labelText}>
                            {voice.labels.age === 'young' ? 'Joven' :
                             voice.labels.age === 'middle_aged' ? 'Adulto' : 'Mayor'}
                          </Text>
                        </View>
                      )}
                      {voice.labels.accent && (
                        <View style={styles.label}>
                          <Text style={styles.labelText}>{voice.labels.accent}</Text>
                        </View>
                      )}
                    </View>

                    {voice.labels.descriptive && (
                      <Text style={styles.voiceDescription} numberOfLines={1}>
                        {voice.labels.descriptive}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Acciones */}
                <View style={styles.voiceActions}>
                  <TouchableOpacity
                    style={[
                      styles.playButton,
                      isPlaying && styles.playButtonActive,
                    ]}
                    onPress={() => playVoicePreview(voice)}
                  >
                    {isPlaying ? (
                      <Pause size={16} color="#ffffff" />
                    ) : (
                      <Play size={16} color="#ffffff" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      isSelected && styles.selectButtonSelected,
                    ]}
                    onPress={() => handleSelectVoice(voice)}
                  >
                    <Text
                      style={[
                        styles.selectButtonText,
                        isSelected && styles.selectButtonTextSelected,
                      ]}
                    >
                      {isSelected ? 'Seleccionada' : 'Seleccionar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  filters: {
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  genderFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  filterButtonTextActive: {
    color: '#8b5cf6',
  },
  voiceList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  voiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.elevated,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: 14,
    marginBottom: 12,
  },
  voiceCardSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: '#8b5cf6',
  },
  voiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  voiceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceAvatarSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  voiceDetails: {
    flex: 1,
  },
  voiceName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 6,
  },
  voiceLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  label: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 4,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8b5cf6',
    textTransform: 'capitalize',
  },
  voiceDescription: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  voiceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: '#6d28d9',
  },
  selectButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 10,
  },
  selectButtonSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  selectButtonTextSelected: {
    color: '#ffffff',
  },
});
