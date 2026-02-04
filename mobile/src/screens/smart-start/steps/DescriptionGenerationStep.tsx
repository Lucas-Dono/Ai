/**
 * Description Generation Step - React Native
 * NEW LEGAL FLOW: User describes character freely, AI generates original character
 * Replaces old CharacterSearch component
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { DEV_API_URL } from '@env';
import { colors } from '../../../theme';

const API_URL = DEV_API_URL || 'http://localhost:3000';

interface DescriptionGenerationStepProps {
  sessionId: string;
  userTier: 'FREE' | 'PLUS' | 'ULTRA';
  onCharacterGenerated: (draft: any) => void;
  onBack?: () => void;
}

export function DescriptionGenerationStep({
  sessionId,
  userTier,
  onCharacterGenerated,
  onBack,
}: DescriptionGenerationStepProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Optional refinement options
  const [genreHint, setGenreHint] = useState<string>('');
  const [archetypeHint, setArchetypeHint] = useState<string>('');
  const [era, setEra] = useState<string>('');

  // Avatar management
  const [avatarMode, setAvatarMode] = useState<'generate' | 'upload'>('generate');
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [uploadedAvatarFile, setUploadedAvatarFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handlePickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Necesitamos permisos para acceder a tus fotos');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      // Check file size (5MB max)
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert('Error', 'La imagen es demasiado grande. Tamaño máximo: 5MB');
        return;
      }

      setUploadedAvatar(asset.uri);
      setUploadedAvatarFile({
        uri: asset.uri,
        name: asset.fileName || 'avatar.jpg',
        type: asset.type === 'image' ? 'image/jpeg' : 'image/png',
      });
      setAvatarMode('upload');
    }
  };

  const handleRemoveAvatar = () => {
    setUploadedAvatar(null);
    setUploadedAvatarFile(null);
    setAvatarMode('generate');
  };

  const handleGenerate = async () => {
    if (description.trim().length < 10) {
      Alert.alert('Error', 'Por favor, escribe al menos 10 caracteres para describir tu personaje');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // If user uploaded avatar, upload it first
      let uploadedAvatarUrl: string | undefined = undefined;

      if (avatarMode === 'upload' && uploadedAvatarFile) {
        const formData = new FormData();
        formData.append('avatar', {
          uri: uploadedAvatarFile.uri,
          name: uploadedAvatarFile.name,
          type: uploadedAvatarFile.type,
        } as any);

        const uploadResponse = await fetch(`${API_URL}/api/smart-start/upload-avatar`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Error al subir la imagen');
        }

        uploadedAvatarUrl = uploadData.avatarUrl;
      }

      const response = await fetch(`${API_URL}/api/smart-start/generate-from-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          description,
          uploadedAvatarUrl,
          options: showAdvanced
            ? {
                genreHint: genreHint || undefined,
                archetypeHint: archetypeHint || undefined,
                era: era || undefined,
              }
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar personaje');
      }

      // Success - pass generated character to parent
      onCharacterGenerated(data.draft);
    } catch (err) {
      console.error('Error generating character:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      Alert.alert('Error', err instanceof Error ? err.message : 'Error al generar personaje');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSurpriseMe = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/smart-start/generate-random`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar personaje aleatorio');
      }

      onCharacterGenerated(data.draft);
    } catch (err) {
      console.error('Error generating random character:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      Alert.alert('Error', err instanceof Error ? err.message : 'Error al generar personaje');
    } finally {
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    'un detective noir de los años 40, cínico pero con buen corazón',
    'una hacker rebelde con mohawk morado, experta en ciberseguridad',
    'un chef francés obsesionado con la perfección culinaria',
    'una piloto de drones de carreras con actitud desafiante',
    'un profesor de filosofía con teorías poco convencionales',
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="sparkles" size={32} color="#8b5cf6" />
        </View>
        <Text style={styles.title}>Describe tu Personaje</Text>
        <Text style={styles.subtitle}>
          Escribe libremente cómo imaginas tu personaje y la IA lo creará para ti
        </Text>
        <View style={styles.tierBadge}>
          <Ionicons name="star" size={14} color="#60a5fa" />
          <Text style={styles.tierText}>Plan {userTier}</Text>
        </View>
      </View>

      {/* Main Description Input */}
      <View style={styles.inputSection}>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Ej: una guerrera elfa con cicatrices de batalla, valiente pero con trauma de guerra..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          numberOfLines={6}
          style={styles.textArea}
          editable={!isGenerating}
          textAlignVertical="top"
        />
        <View style={styles.charCount}>
          <Text style={styles.charCountText}>{description.length}/2000</Text>
        </View>
      </View>

      {/* Example Prompts */}
      <View style={styles.examplesSection}>
        <Text style={styles.examplesLabel}>Ejemplos rápidos:</Text>
        <View style={styles.examplesChips}>
          {examplePrompts.map((example, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setDescription(example)}
              disabled={isGenerating}
              style={styles.exampleChip}
            >
              <Text style={styles.exampleChipText} numberOfLines={1}>
                {example.slice(0, 40)}...
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Advanced Options */}
      <View style={styles.advancedSection}>
        <TouchableOpacity
          onPress={() => setShowAdvanced(!showAdvanced)}
          style={styles.advancedToggle}
        >
          <Ionicons
            name={showAdvanced ? 'chevron-down' : 'chevron-forward'}
            size={16}
            color={colors.text.secondary}
          />
          <Text style={styles.advancedToggleText}>
            Opciones avanzadas (opcional)
          </Text>
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.advancedOptions}>
            <View style={styles.advancedRow}>
              <View style={styles.advancedInput}>
                <Text style={styles.advancedLabel}>Género</Text>
                <TextInput
                  value={genreHint}
                  onChangeText={setGenreHint}
                  placeholder="Romance, Roleplay..."
                  placeholderTextColor={colors.text.tertiary}
                  style={styles.advancedTextInput}
                  editable={!isGenerating}
                />
              </View>
            </View>
            <View style={styles.advancedRow}>
              <View style={styles.advancedInput}>
                <Text style={styles.advancedLabel}>Época</Text>
                <TextInput
                  value={era}
                  onChangeText={setEra}
                  placeholder="Moderna, Victoriana..."
                  placeholderTextColor={colors.text.tertiary}
                  style={styles.advancedTextInput}
                  editable={!isGenerating}
                />
              </View>
            </View>
            <View style={styles.advancedRow}>
              <View style={styles.advancedInput}>
                <Text style={styles.advancedLabel}>Arquetipo</Text>
                <TextInput
                  value={archetypeHint}
                  onChangeText={setArchetypeHint}
                  placeholder="Héroe, Rebelde..."
                  placeholderTextColor={colors.text.tertiary}
                  style={styles.advancedTextInput}
                  editable={!isGenerating}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarHeader}>
          <Ionicons name="image" size={20} color="#8b5cf6" />
          <Text style={styles.avatarTitle}>Foto de Perfil (Avatar)</Text>
        </View>
        <Text style={styles.avatarSubtitle}>
          Elige entre subir tu propia foto o dejar que la IA la genere
        </Text>

        <View style={styles.avatarOptions}>
          {/* Upload Option */}
          <TouchableOpacity
            onPress={handlePickImage}
            disabled={isGenerating || isUploadingAvatar}
            style={[
              styles.avatarOption,
              avatarMode === 'upload' && uploadedAvatar && styles.avatarOptionActive,
            ]}
          >
            {uploadedAvatar ? (
              <View style={styles.avatarPreviewContainer}>
                <Image source={{ uri: uploadedAvatar }} style={styles.avatarPreview} />
                <TouchableOpacity
                  onPress={handleRemoveAvatar}
                  style={styles.avatarRemove}
                  disabled={isGenerating}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={32} color={colors.text.secondary} />
                <Text style={styles.avatarOptionTitle}>Subir Foto</Text>
                <Text style={styles.avatarOptionSubtitle}>PNG, JPG, WEBP, GIF</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Generate Option */}
          <TouchableOpacity
            onPress={() => {
              setAvatarMode('generate');
              handleRemoveAvatar();
            }}
            disabled={isGenerating || isUploadingAvatar}
            style={[
              styles.avatarOption,
              avatarMode === 'generate' && styles.avatarOptionActive,
            ]}
          >
            <Ionicons name="sparkles" size={32} color="#8b5cf6" />
            <Text style={styles.avatarOptionTitle}>Generar con IA</Text>
            <Text style={styles.avatarOptionSubtitle}>Basado en descripción</Text>
          </TouchableOpacity>
        </View>

        {/* Info about full-body image */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#60a5fa" />
          <Text style={styles.infoText}>
            La IA generará automáticamente una foto de cuerpo completo basada en tu descripción
          </Text>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={isGenerating || description.trim().length < 10}
          style={[
            styles.primaryButton,
            (isGenerating || description.trim().length < 10) && styles.buttonDisabled,
          ]}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.primaryButtonText}>Generando...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Generar con IA</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSurpriseMe}
          disabled={isGenerating}
          style={[styles.secondaryButton, isGenerating && styles.buttonDisabled]}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#8b5cf6" />
          ) : (
            <>
              <Ionicons name="shuffle" size={20} color="#8b5cf6" />
              <Text style={styles.secondaryButtonText}>Sorpréndeme</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Back Button */}
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          disabled={isGenerating}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={16} color={colors.text.secondary} />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      )}

      {/* Tier Benefits Info */}
      <View style={styles.tierInfo}>
        <Text style={styles.tierInfoTitle}>Tu plan {userTier} incluye:</Text>
        <View style={styles.tierBenefits}>
          {userTier === 'FREE' && (
            <>
              <Text style={styles.tierBenefit}>✓ Perfil básico (~60 campos)</Text>
              <Text style={styles.tierBenefit}>✓ 2,000 tokens de generación</Text>
              <Text style={styles.tierBenefit}>✓ Biografía de 200-300 palabras</Text>
            </>
          )}
          {userTier === 'PLUS' && (
            <>
              <Text style={styles.tierBenefit}>✓ Perfil enriquecido (~160 campos)</Text>
              <Text style={styles.tierBenefit}>✓ 8,000 tokens de generación</Text>
              <Text style={styles.tierBenefit}>✓ Biografía de 400-600 palabras</Text>
              <Text style={styles.tierBenefit}>✓ Relaciones y metas detalladas</Text>
            </>
          )}
          {userTier === 'ULTRA' && (
            <>
              <Text style={styles.tierBenefit}>✓ Perfil psicológico completo (~240+ campos)</Text>
              <Text style={styles.tierBenefit}>✓ 20,000 tokens de generación</Text>
              <Text style={styles.tierBenefit}>✓ Biografía épica de 600-800 palabras</Text>
              <Text style={styles.tierBenefit}>✓ Análisis Big Five, arcos narrativos, traumas</Text>
              <Text style={styles.tierBenefit}>✓ Red de relaciones compleja</Text>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    borderRadius: 12,
  },
  tierText: {
    fontSize: 12,
    color: '#60a5fa',
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.text.primary,
    minHeight: 120,
  },
  charCount: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  charCountText: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  examplesSection: {
    marginBottom: 20,
  },
  examplesLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  examplesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 16,
  },
  exampleChipText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  advancedSection: {
    marginBottom: 20,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  advancedToggleText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  advancedOptions: {
    marginTop: 12,
    gap: 12,
  },
  advancedRow: {
    flexDirection: 'row',
    gap: 12,
  },
  advancedInput: {
    flex: 1,
  },
  advancedLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  advancedTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: colors.text.primary,
  },
  avatarSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
  },
  avatarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  avatarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  avatarSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  avatarOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatarOption: {
    flex: 1,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.subtle,
    borderRadius: 12,
    gap: 6,
  },
  avatarOptionActive: {
    borderColor: '#8b5cf6',
    borderStyle: 'solid',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  avatarOptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  avatarOptionSubtitle: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  avatarPreviewContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  avatarRemove: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#60a5fa',
    lineHeight: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#ef4444',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  tierInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 12,
  },
  tierInfoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 10,
  },
  tierBenefits: {
    gap: 6,
  },
  tierBenefit: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
