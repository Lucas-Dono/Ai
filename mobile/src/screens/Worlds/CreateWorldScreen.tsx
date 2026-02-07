import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MainStackParamList } from '../../navigation/types';
// TODO: Migrar a Groups API - World API deprecated
// import worldApi from '../../services/api/world.api';
import { AgentsService } from '../../services/api';
import { colors, spacing, typography, borderRadius } from '../../theme';

type CreateWorldScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'CreateWorld'>;
};

const GENRES = [
  { id: 'romance', name: 'Romance', icon: '💕' },
  { id: 'fantasy', name: 'Fantasy', icon: '🧙' },
  { id: 'scifi', name: 'Sci-Fi', icon: '🚀' },
  { id: 'mystery', name: 'Mystery', icon: '🕵️' },
  { id: 'adventure', name: 'Adventure', icon: '🗺️' },
  { id: 'slice-of-life', name: 'Slice of Life', icon: '☕' },
  { id: 'drama', name: 'Drama', icon: '🎭' },
  { id: 'horror', name: 'Horror', icon: '👻' },
];

const FORMATS = [
  { id: 'chat', name: 'Chat', description: 'Conversación tradicional', icon: 'chatbubbles' },
  { id: 'visual-novel', name: 'Visual Novel', description: 'Estilo novela visual', icon: 'book' },
];

export default function CreateWorldScreen({ navigation }: CreateWorldScreenProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<'chat' | 'visual-novel'>('chat');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoadingAgents(true);
      const response = await AgentsService.list({ limit: 50 }) as any;
      setAvailableAgents(response.agents || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para tu mundo');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Por favor agrega una descripción');
      return;
    }

    try {
      setLoading(true);
      // TODO: Migrar a Groups API - World API deprecated
      // const world = await worldApi.createWorld({
      //   name: name.trim(),
      //   description: description.trim(),
      //   genre: selectedGenre || undefined,
      //   format: selectedFormat,
      //   agentIds: selectedAgents.length > 0 ? selectedAgents : undefined,
      // });

      Alert.alert(
        'Función en Migración',
        'La creación de mundos está siendo migrada al nuevo sistema de grupos. Por favor, intenta más tarde.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear el mundo');
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return name.trim().length > 0 && description.trim().length > 0;
    if (step === 2) return selectedGenre.length > 0;
    if (step === 3) return true; // Format is optional
    return true;
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información Básica</Text>
      <Text style={styles.stepSubtitle}>Dale un nombre y descripción a tu mundo</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nombre del Mundo</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ej: Academia Sakura"
          placeholderTextColor={colors.text.tertiary}
          maxLength={50}
        />
        <Text style={styles.characterCount}>{name.length}/50</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe tu mundo, su ambiente y qué sucederá..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={styles.characterCount}>{description.length}/500</Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Género</Text>
      <Text style={styles.stepSubtitle}>¿Qué tipo de experiencia quieres crear?</Text>

      <View style={styles.genreGrid}>
        {GENRES.map(genre => (
          <TouchableOpacity
            key={genre.id}
            style={[
              styles.genreCard,
              selectedGenre === genre.id && styles.genreCardSelected,
            ]}
            onPress={() => setSelectedGenre(genre.id)}
          >
            <Text style={styles.genreEmoji}>{genre.icon}</Text>
            <Text
              style={[
                styles.genreName,
                selectedGenre === genre.id && styles.genreNameSelected,
              ]}
            >
              {genre.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Formato</Text>
      <Text style={styles.stepSubtitle}>¿Cómo quieres experimentar tu mundo?</Text>

      <View style={styles.formatContainer}>
        {FORMATS.map(format => (
          <TouchableOpacity
            key={format.id}
            style={[
              styles.formatCard,
              selectedFormat === format.id && styles.formatCardSelected,
            ]}
            onPress={() => setSelectedFormat(format.id as any)}
          >
            <View style={styles.formatIconContainer}>
              <Ionicons
                name={format.icon as any}
                size={32}
                color={selectedFormat === format.id ? colors.primary[500] : colors.text.secondary}
              />
            </View>
            <Text
              style={[
                styles.formatName,
                selectedFormat === format.id && styles.formatNameSelected,
              ]}
            >
              {format.name}
            </Text>
            <Text style={styles.formatDescription}>{format.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personajes (Opcional)</Text>
      <Text style={styles.stepSubtitle}>
        Selecciona los agentes que participarán en este mundo
      </Text>

      {loadingAgents ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : availableAgents.length === 0 ? (
        <View style={styles.emptyAgents}>
          <Ionicons name="person-add-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyAgentsText}>
            No tienes agentes aún. Crea uno primero.
          </Text>
          <TouchableOpacity
            style={styles.createAgentButton}
            onPress={() => navigation.navigate('CreateAgent')}
          >
            <Text style={styles.createAgentButtonText}>Crear Agente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.agentsList}>
          {availableAgents.map(agent => (
            <TouchableOpacity
              key={agent.id}
              style={[
                styles.agentItem,
                selectedAgents.includes(agent.id) && styles.agentItemSelected,
              ]}
              onPress={() => toggleAgent(agent.id)}
            >
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{agent.name}</Text>
                <Text style={styles.agentPersonality} numberOfLines={1}>
                  {agent.personality || 'Sin personalidad definida'}
                </Text>
              </View>
              {selectedAgents.includes(agent.id) && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary[500]} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Mundo</Text>
        <View style={styles.headerRight}>
          <Text style={styles.stepIndicator}>
            {step}/4
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${(step / 4) * 100}%` }]} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backStepButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backStepButtonText}>Atrás</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            !canGoNext() && styles.nextButtonDisabled,
            step === 1 && styles.nextButtonFull,
          ]}
          onPress={() => {
            if (step < 4) {
              setStep(step + 1);
            } else {
              handleCreate();
            }
          }}
          disabled={!canGoNext() || loading}
        >
          <LinearGradient
            colors={
              canGoNext() && !loading
                ? [colors.primary[500], colors.primary[600]]
                : [colors.text.tertiary, colors.text.tertiary]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {step === 4 ? 'Crear Mundo' : 'Siguiente'}
                </Text>
                {step < 4 && <Ionicons name="arrow-forward" size={20} color="#fff" />}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.secondary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  stepIndicator: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: colors.background.elevated,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  genreCard: {
    width: '48%',
    margin: '1%',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genreCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500] + '10',
  },
  genreEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  genreName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  genreNameSelected: {
    color: colors.primary[500],
  },
  formatContainer: {
    gap: spacing.md,
  },
  formatCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  formatCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500] + '10',
  },
  formatIconContainer: {
    marginBottom: spacing.sm,
  },
  formatName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  formatNameSelected: {
    color: colors.primary[500],
  },
  formatDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  agentsList: {
    maxHeight: 400,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  agentItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500] + '10',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  agentPersonality: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  emptyAgents: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyAgentsText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  createAgentButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  createAgentButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.md,
  },
  backStepButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backStepButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  nextButton: {
    flex: 2,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  nextButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
