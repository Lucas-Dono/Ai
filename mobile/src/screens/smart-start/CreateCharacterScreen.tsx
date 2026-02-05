/**
 * Create Character Screen (Single Page)
 *
 * Formulario completo en una sola pantalla para crear personajes.
 * Reemplaza el wizard de múltiples pasos con un enfoque más directo.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import {
  X,
  Sparkles,
  User,
  Camera,
  Image as ImageIcon,
  Briefcase,
  Users,
  Brain,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { colors } from '../../theme';
import { useSmartStartContext } from '../../contexts/SmartStartContext';
import type { DepthLevelId } from '@circuitpromptai/smart-start-core';
import { TemplateGallery } from '../../components/character-creation/TemplateGallery';
import { PersonalityRadarChart } from '../../components/character-creation/PersonalityRadarChart';
import { AdvancedPersonalityTabs } from '../../components/character-creation/AdvancedPersonalityTabs';
import { BiographyTimeline, BiographyEvent } from '../../components/character-creation/BiographyTimeline';
import { VoiceSelector } from '../../components/character-creation/VoiceSelector';
import { AvatarEditor } from '../../components/character-creation/AvatarEditor';
import { RelationshipGraph, RelationshipNode } from '../../components/character-creation/RelationshipGraph';
import { SyncStatusIndicator } from '../../components/character-creation/SyncStatusIndicator';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import type { CharacterDraft as OfflineCharacterDraft } from '../../utils/offlineStorage';

// ============================================================================
// TYPES
// ============================================================================

interface ImportantPerson {
  name: string;
  relationship: string;
  description: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CreateCharacterScreen() {
  const navigation = useNavigation();
  const { userTier } = useSmartStartContext();

  const scrollViewRef = useRef<ScrollView>(null);

  // Form state
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary' | ''>('');
  const [origin, setOrigin] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Appearance
  const [physicalAppearance, setPhysicalAppearance] = useState('');

  // Voice
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | undefined>(undefined);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | undefined>(undefined);

  // Biography
  const [biographyEvents, setBiographyEvents] = useState<BiographyEvent[]>([]);

  // Personality (Big Five)
  const [openness, setOpenness] = useState(50);
  const [conscientiousness, setConscientiousness] = useState(50);
  const [extraversion, setExtraversion] = useState(50);
  const [agreeableness, setAgreeableness] = useState(50);
  const [neuroticism, setNeuroticism] = useState(50);

  // Profession
  const [occupation, setOccupation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Relationships
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married' | 'divorced' | 'widowed' | 'complicated' | ''>('');
  const [importantPeople, setImportantPeople] = useState<ImportantPerson[]>([]);

  // Depth & Visibility
  const [depthLevel, setDepthLevel] = useState<DepthLevelId>('basic');
  const [isPublic, setIsPublic] = useState(false);

  // Loading states
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);

  // UI states
  const [showTemplates, setShowTemplates] = useState(true);
  const [showAdvancedPersonality, setShowAdvancedPersonality] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);

  // Relationship graph
  const [relationshipNodes, setRelationshipNodes] = useState<RelationshipNode[]>([]);

  // Advanced personality
  const [facets, setFacets] = useState({});
  const [darkTriad, setDarkTriad] = useState({
    machiavellianism: 50,
    narcissism: 50,
    psychopathy: 50,
  });
  const [attachment, setAttachment] = useState({
    style: 'secure' as const,
    anxiety: 50,
    avoidance: 50,
  });
  const [psychologicalNeeds, setPsychologicalNeeds] = useState({
    connection: 0.5,
    autonomy: 0.5,
    competence: 0.5,
    novelty: 0.5,
  });

  // ============================================================================
  // OFFLINE SYNC
  // ============================================================================

  const currentDraft: Partial<OfflineCharacterDraft> = {
    description,
    name,
    age,
    gender,
    origin,
    avatarUrl,
    physicalAppearance,
    selectedVoiceId,
    selectedVoiceName,
    biographyEvents,
    openness,
    conscientiousness,
    extraversion,
    agreeableness,
    neuroticism,
    facets,
    darkTriad,
    attachment,
    psychologicalNeeds,
    occupation,
    skills,
    maritalStatus,
    relationshipNodes,
    depthLevel,
    isPublic,
  };

  const {
    syncStatus,
    lastSyncTime,
    isOnline,
    saveDraftNow,
    clearDraftNow,
    hasDraftSaved,
  } = useOfflineSync(currentDraft, {
    onDraftLoaded: (draft) => {
      // Restaurar estado desde el draft guardado
      if (draft.description) setDescription(draft.description);
      if (draft.name) setName(draft.name);
      if (draft.age) setAge(draft.age);
      if (draft.gender) setGender(draft.gender);
      if (draft.origin) setOrigin(draft.origin);
      if (draft.avatarUrl) setAvatarUrl(draft.avatarUrl);
      if (draft.physicalAppearance) setPhysicalAppearance(draft.physicalAppearance);
      if (draft.selectedVoiceId) setSelectedVoiceId(draft.selectedVoiceId);
      if (draft.selectedVoiceName) setSelectedVoiceName(draft.selectedVoiceName);
      if (draft.biographyEvents) setBiographyEvents(draft.biographyEvents);
      if (draft.openness !== undefined) setOpenness(draft.openness);
      if (draft.conscientiousness !== undefined) setConscientiousness(draft.conscientiousness);
      if (draft.extraversion !== undefined) setExtraversion(draft.extraversion);
      if (draft.agreeableness !== undefined) setAgreeableness(draft.agreeableness);
      if (draft.neuroticism !== undefined) setNeuroticism(draft.neuroticism);
      if (draft.facets) setFacets(draft.facets);
      if (draft.darkTriad) setDarkTriad(draft.darkTriad);
      if (draft.attachment) setAttachment(draft.attachment);
      if (draft.psychologicalNeeds) setPsychologicalNeeds(draft.psychologicalNeeds);
      if (draft.occupation) setOccupation(draft.occupation);
      if (draft.skills) setSkills(draft.skills);
      if (draft.maritalStatus) setMaritalStatus(draft.maritalStatus);
      if (draft.relationshipNodes) setRelationshipNodes(draft.relationshipNodes);
      if (draft.depthLevel) setDepthLevel(draft.depthLevel);
      if (draft.isPublic !== undefined) setIsPublic(draft.isPublic);

      Alert.alert(
        'Draft restaurado',
        'Se ha cargado tu personaje en progreso desde el almacenamiento local.',
        [{ text: 'OK' }]
      );
    },
    onSaveError: (error) => {
      console.error('Error saving draft:', error);
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!description.trim()) {
      Alert.alert('Descripción requerida', 'Escribe una descripción del personaje para generar automáticamente sus detalles.');
      return;
    }

    setGenerating(true);

    try {
      // TODO: Call API to generate character details from description
      const response = await fetch('/api/smart-start/generate-from-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, tier: userTier }),
      });

      if (!response.ok) throw new Error('Error generating character');

      const data = await response.json();

      // Populate fields with generated data
      setName(data.name || '');
      setAge(data.age?.toString() || '');
      setGender(data.gender || '');
      setOrigin(data.origin || '');
      setPhysicalAppearance(data.physicalAppearance || '');
      setOccupation(data.occupation || '');

      if (data.personality) {
        setOpenness(data.personality.openness || 50);
        setConscientiousness(data.personality.conscientiousness || 50);
        setExtraversion(data.personality.extraversion || 50);
        setAgreeableness(data.personality.agreeableness || 50);
        setNeuroticism(data.personality.neuroticism || 50);
      }

      Alert.alert('¡Generado!', 'Los detalles del personaje han sido generados. Puedes editarlos antes de crear.');

    } catch (error) {
      console.error('Generate error:', error);
      Alert.alert('Error', 'No se pudo generar el personaje. Intenta nuevamente.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleVoiceSelect = (voiceId: string, voiceName: string) => {
    setSelectedVoiceId(voiceId);
    setSelectedVoiceName(voiceName);
  };

  const handleBiographyChange = (events: BiographyEvent[]) => {
    setBiographyEvents(events);
  };

  const handleAvatarSave = (editedUri: string) => {
    setAvatarUrl(editedUri);
    setShowAvatarEditor(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAvatarCancel = () => {
    setShowAvatarEditor(false);
  };

  const handleOpenAvatarEditor = () => {
    if (!avatarUrl) {
      Alert.alert('Sin imagen', 'Primero selecciona o toma una foto para editarla');
      return;
    }
    setShowAvatarEditor(true);
  };

  const handleRelationshipNodesChange = (nodes: RelationshipNode[]) => {
    setRelationshipNodes(nodes);

    // Sincronizar con importantPeople
    const people: ImportantPerson[] = nodes.map((node) => ({
      name: node.name,
      relationship: node.relationship,
      description: node.description || '',
    }));
    setImportantPeople(people);
  };

  const handleSelectTemplate = (template: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Pre-fill form with template data
    setName(template.name);
    setDescription(template.description);
    setOccupation(template.occupation);

    // Set personality
    setOpenness(template.personality.openness);
    setConscientiousness(template.personality.conscientiousness);
    setExtraversion(template.personality.extraversion);
    setAgreeableness(template.personality.agreeableness);
    setNeuroticism(template.personality.neuroticism);

    // Set skills from traits
    setSkills(template.traits);

    // Hide templates
    setShowTemplates(false);

    Alert.alert(
      '¡Template aplicado!',
      `${template.name} ha sido cargado. Puedes personalizar cualquier campo antes de crear.`,
      [{ text: 'OK' }]
    );
  };

  const handleCreateCharacter = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'El nombre del personaje es obligatorio.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Campo requerido', 'La descripción del personaje es obligatoria.');
      return;
    }

    setCreating(true);

    try {
      const { smartStartService } = await import('../../services/smart-start.service');

      const result = await smartStartService.createCharacter({
        name,
        characterType: 'original',
        age: age ? parseInt(age) : undefined,
        gender,
        origin,
        physicalAppearance,
        occupation,
        skills,
        maritalStatus,
        importantPeople,
        personality: {
          openness,
          conscientiousness,
          extraversion,
          agreeableness,
          neuroticism,
        },
        depthLevel,
        visibility: isPublic ? 'public' : 'private',
        avatarUrl,
        voiceId: selectedVoiceId,
        biographyEvents,
      } as any);

      // Limpiar draft después de crear exitosamente
      await clearDraftNow();

      Alert.alert(
        '¡Personaje creado! ✨',
        `${result.agent.name} ha sido creado exitosamente!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Create character error:', error);
      Alert.alert('Error', 'No se pudo crear el personaje. Intenta nuevamente.');
    } finally {
      setCreating(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={20} color="#8b5cf6" />
          <Text style={styles.headerTitle}>Crear Personaje</Text>
        </View>
        <View style={styles.headerRight}>
          <SyncStatusIndicator
            status={syncStatus}
            lastSyncTime={lastSyncTime}
            compact
          />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 0. TEMPLATES (Collapsable) */}
        {showTemplates && (
          <TemplateGallery onSelectTemplate={handleSelectTemplate} />
        )}

        {showTemplates && (
          <TouchableOpacity
            style={styles.hideTemplatesButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowTemplates(false);
            }}
          >
            <ChevronUp size={16} color={colors.text.secondary} />
            <Text style={styles.hideTemplatesText}>Ocultar plantillas</Text>
          </TouchableOpacity>
        )}

        {!showTemplates && (
          <TouchableOpacity
            style={styles.showTemplatesButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowTemplates(true);
            }}
          >
            <Sparkles size={16} color="#8b5cf6" />
            <Text style={styles.showTemplatesText}>Ver plantillas de inicio rápido</Text>
          </TouchableOpacity>
        )}

        {/* 1. DESCRIPCIÓN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción del Personaje</Text>
          <Text style={styles.sectionSubtitle}>
            Describe la persona que quieres crear. Esta descripción servirá como base para generar automáticamente su historia, personalidad y trabajo.
          </Text>

          <TextInput
            style={styles.textArea}
            placeholder="Ej: Un profesor de historia jubilado que vive en una casa antigua con sus tres gatos. Es amable pero reservado, le gusta la jardinería y tiene miedo a la tecnología moderna..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
            maxLength={2000}
          />

          <TouchableOpacity
            style={[styles.aiButton, generating && styles.aiButtonDisabled]}
            onPress={handleGenerateWithAI}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Sparkles size={18} color="#ffffff" />
            )}
            <Text style={styles.aiButtonText}>
              {generating ? 'Generando...' : 'Generar Personaje Completo con IA'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. IDENTIDAD BÁSICA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identidad</Text>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <User size={40} color={colors.text.tertiary} />
              )}
            </View>
            <View style={styles.avatarButtons}>
              <TouchableOpacity style={styles.avatarButton} onPress={handlePickImage}>
                <ImageIcon size={16} color="#8b5cf6" />
                <Text style={styles.avatarButtonText}>Galería</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarButton} onPress={handleTakePhoto}>
                <Camera size={16} color="#8b5cf6" />
                <Text style={styles.avatarButtonText}>Cámara</Text>
              </TouchableOpacity>
              {avatarUrl && (
                <TouchableOpacity
                  style={[styles.avatarButton, styles.avatarEditButton]}
                  onPress={handleOpenAvatarEditor}
                >
                  <Sparkles size={16} color="#ffffff" />
                  <Text style={styles.avatarEditButtonText}>Editar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.label}>Nombre Completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del Personaje"
            placeholderTextColor={colors.text.tertiary}
            value={name}
            onChangeText={setName}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Edad</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Género</Text>
              <View style={styles.genderButtons}>
                {['male', 'female', 'non-binary'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderButton,
                      gender === g && styles.genderButtonActive,
                    ]}
                    onPress={() => setGender(g as any)}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      gender === g && styles.genderButtonTextActive,
                    ]}>
                      {g === 'male' ? 'M' : g === 'female' ? 'F' : 'NB'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.label}>Origen</Text>
          <TextInput
            style={styles.input}
            placeholder="Ciudad, país o lugar de origen"
            placeholderTextColor={colors.text.tertiary}
            value={origin}
            onChangeText={setOrigin}
          />
        </View>

        {/* 2.5 VOZ */}
        <View style={styles.section}>
          <VoiceSelector
            selectedVoiceId={selectedVoiceId}
            onVoiceSelect={handleVoiceSelect}
          />
          {selectedVoiceName && (
            <View style={styles.selectedVoiceInfo}>
              <Text style={styles.selectedVoiceLabel}>Voz seleccionada:</Text>
              <Text style={styles.selectedVoiceName}>{selectedVoiceName}</Text>
            </View>
          )}
        </View>

        {/* 3. APARIENCIA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia Física</Text>

          <TextInput
            style={styles.textArea}
            placeholder="Describe solo su apariencia: altura, complexión, color de ojos, cabello, rasgos faciales, estilo de vestir..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={4}
            value={physicalAppearance}
            onChangeText={setPhysicalAppearance}
          />
        </View>

        {/* 4. PERSONALIDAD */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Brain size={20} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Personalidad (Big Five)</Text>
          </View>

          {/* Openness */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Apertura</Text>
              <Text style={styles.sliderValue}>{openness}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={openness}
              onValueChange={(v) => {
                setOpenness(v);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              minimumTrackTintColor="#8b5cf6"
              maximumTrackTintColor={colors.border.light}
              thumbTintColor="#8b5cf6"
            />
          </View>

          {/* Conscientiousness */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Responsabilidad</Text>
              <Text style={styles.sliderValue}>{conscientiousness}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={conscientiousness}
              onValueChange={(v) => {
                setConscientiousness(v);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              minimumTrackTintColor="#8b5cf6"
              maximumTrackTintColor={colors.border.light}
              thumbTintColor="#8b5cf6"
            />
          </View>

          {/* Extraversion */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Extraversión</Text>
              <Text style={styles.sliderValue}>{extraversion}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={extraversion}
              onValueChange={(v) => {
                setExtraversion(v);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              minimumTrackTintColor="#8b5cf6"
              maximumTrackTintColor={colors.border.light}
              thumbTintColor="#8b5cf6"
            />
          </View>

          {/* Agreeableness */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Amabilidad</Text>
              <Text style={styles.sliderValue}>{agreeableness}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={agreeableness}
              onValueChange={(v) => {
                setAgreeableness(v);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              minimumTrackTintColor="#8b5cf6"
              maximumTrackTintColor={colors.border.light}
              thumbTintColor="#8b5cf6"
            />
          </View>

          {/* Neuroticism */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Neuroticismo</Text>
              <Text style={styles.sliderValue}>{neuroticism}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={neuroticism}
              onValueChange={(v) => {
                setNeuroticism(v);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              minimumTrackTintColor="#8b5cf6"
              maximumTrackTintColor={colors.border.light}
              thumbTintColor="#8b5cf6"
            />
          </View>

          {/* Radar Chart */}
          <View style={styles.radarContainer}>
            <PersonalityRadarChart
              openness={openness}
              conscientiousness={conscientiousness}
              extraversion={extraversion}
              agreeableness={agreeableness}
              neuroticism={neuroticism}
            />
          </View>

          {/* Advanced Options Toggle */}
          <TouchableOpacity
            style={styles.advancedToggle}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowAdvancedPersonality(!showAdvancedPersonality);
            }}
          >
            {showAdvancedPersonality ? (
              <ChevronUp size={20} color="#8b5cf6" />
            ) : (
              <ChevronDown size={20} color="#8b5cf6" />
            )}
            <Text style={styles.advancedToggleText}>
              {showAdvancedPersonality
                ? 'Ocultar Opciones Avanzadas'
                : 'Mostrar Opciones Avanzadas'}
            </Text>
            <View style={styles.advancedBadge}>
              <Text style={styles.advancedBadgeText}>Pro</Text>
            </View>
          </TouchableOpacity>

          {/* Advanced Personality Tabs */}
          {showAdvancedPersonality && (
            <View style={styles.advancedContainer}>
              <AdvancedPersonalityTabs
                facets={facets}
                darkTriad={darkTriad}
                attachment={attachment}
                needs={psychologicalNeeds}
                onFacetsChange={setFacets}
                onDarkTriadChange={setDarkTriad}
                onAttachmentChange={setAttachment}
                onNeedsChange={setPsychologicalNeeds}
              />
            </View>
          )}
        </View>

        {/* 5. PROFESIÓN */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Briefcase size={20} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Profesión y Habilidades</Text>
          </View>

          <Text style={styles.label}>Ocupación</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Desarrollador de Software, Artista, Estudiante..."
            placeholderTextColor={colors.text.tertiary}
            value={occupation}
            onChangeText={setOccupation}
          />

          <Text style={styles.label}>Habilidades</Text>
          <View style={styles.skillsContainer}>
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillTagText}>{skill}</Text>
                <TouchableOpacity onPress={() => handleRemoveSkill(index)}>
                  <X size={14} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.skillInputContainer}>
            <TextInput
              style={[styles.input, styles.skillInput]}
              placeholder="Agregar habilidad..."
              placeholderTextColor={colors.text.tertiary}
              value={skillInput}
              onChangeText={setSkillInput}
              onSubmitEditing={handleAddSkill}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddSkill}
            >
              <Plus size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. RELACIONES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Relaciones Interpersonales</Text>
          </View>

          <Text style={styles.label}>Estado Civil</Text>
          <View style={styles.maritalStatusButtons}>
            {[
              { key: 'single', label: 'Soltero/a' },
              { key: 'married', label: 'Casado/a' },
              { key: 'divorced', label: 'Divorciado/a' },
            ].map((status) => (
              <TouchableOpacity
                key={status.key}
                style={[
                  styles.statusButton,
                  maritalStatus === status.key && styles.statusButtonActive,
                ]}
                onPress={() => setMaritalStatus(status.key as any)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    maritalStatus === status.key && styles.statusButtonTextActive,
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <RelationshipGraph
            nodes={relationshipNodes}
            onNodesChange={handleRelationshipNodesChange}
          />
        </View>

        {/* 6.5 BIOGRAFÍA */}
        <View style={styles.section}>
          <BiographyTimeline
            events={biographyEvents}
            onEventsChange={handleBiographyChange}
            characterAge={age ? parseInt(age) : undefined}
          />
        </View>

        {/* 7. DEPTH LEVEL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nivel de Profundidad</Text>
          <Text style={styles.sectionSubtitle}>
            Elige cuántos detalles tendrá el perfil del personaje
          </Text>

          <View style={styles.depthButtons}>
            {[
              { key: 'basic', label: 'Básico', desc: '60 campos' },
              { key: 'realistic', label: 'Realista', desc: '160 campos' },
              { key: 'ultra', label: 'Ultra', desc: '240+ campos' },
            ].map((depth) => (
              <TouchableOpacity
                key={depth.key}
                style={[
                  styles.depthButton,
                  depthLevel === depth.key && styles.depthButtonActive,
                ]}
                onPress={() => setDepthLevel(depth.key as DepthLevelId)}
              >
                <Text
                  style={[
                    styles.depthButtonLabel,
                    depthLevel === depth.key && styles.depthButtonLabelActive,
                  ]}
                >
                  {depth.label}
                </Text>
                <Text
                  style={[
                    styles.depthButtonDesc,
                    depthLevel === depth.key && styles.depthButtonDescActive,
                  ]}
                >
                  {depth.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 8. VISIBILIDAD */}
        <View style={styles.section}>
          <View style={styles.visibilityContainer}>
            <View style={styles.visibilityInfo}>
              {isPublic ? (
                <Eye size={20} color="#8b5cf6" />
              ) : (
                <EyeOff size={20} color={colors.text.secondary} />
              )}
              <View style={styles.visibilityTextContainer}>
                <Text style={styles.visibilityTitle}>
                  {isPublic ? 'Público' : 'Privado'}
                </Text>
                <Text style={styles.visibilitySubtitle}>
                  {isPublic
                    ? 'Otros usuarios podrán ver y usar este personaje'
                    : 'Solo tú podrás ver y usar este personaje'}
                </Text>
              </View>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: colors.border.light, true: '#8b5cf6' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* 9. CREATE BUTTON */}
        <TouchableOpacity
          style={[styles.createButton, creating && styles.createButtonDisabled]}
          onPress={handleCreateCharacter}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Sparkles size={20} color="#ffffff" />
          )}
          <Text style={styles.createButtonText}>
            {creating ? 'Creando...' : 'Crear Personaje'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Avatar Editor Modal */}
      {avatarUrl && (
        <AvatarEditor
          visible={showAvatarEditor}
          imageUri={avatarUrl}
          onSave={handleAvatarSave}
          onCancel={handleAvatarCancel}
        />
      )}
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: colors.text.primary,
  },
  textArea: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
  },
  aiButtonDisabled: {
    backgroundColor: colors.background.elevated,
  },
  aiButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.elevated,
    borderWidth: 2,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarButtons: {
    flex: 1,
    gap: 8,
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  avatarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  avatarEditButton: {
    backgroundColor: '#8b5cf6',
  },
  avatarEditButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  genderButtonTextActive: {
    color: '#8b5cf6',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  sliderValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  skillTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  skillInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  skillInput: {
    flex: 1,
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
  },
  maritalStatusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statusButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  statusButtonTextActive: {
    color: '#8b5cf6',
  },
  personCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 10,
    marginBottom: 8,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  personRelationship: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  addPersonForm: {
    padding: 16,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    gap: 12,
  },
  addPersonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  addPersonButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#8b5cf6',
  },
  buttonSecondary: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  buttonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  depthButtons: {
    gap: 12,
  },
  depthButton: {
    padding: 16,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
  },
  depthButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8b5cf6',
  },
  depthButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  depthButtonLabelActive: {
    color: '#8b5cf6',
  },
  depthButtonDesc: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  depthButtonDescActive: {
    color: '#a78bfa',
  },
  visibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
  },
  visibilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  visibilityTextContainer: {
    flex: 1,
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  visibilitySubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 24,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  createButtonDisabled: {
    backgroundColor: colors.background.elevated,
    shadowOpacity: 0,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  hideTemplatesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 10,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  hideTemplatesText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  showTemplatesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderStyle: 'dashed',
  },
  showTemplatesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  radarContainer: {
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  advancedToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  advancedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#8b5cf6',
    borderRadius: 6,
  },
  advancedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  advancedContainer: {
    marginTop: 16,
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    minHeight: 400,
  },
  selectedVoiceInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedVoiceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  selectedVoiceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8b5cf6',
  },
});
