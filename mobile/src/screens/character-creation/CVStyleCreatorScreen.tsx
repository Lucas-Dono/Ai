/**
 * CV Style Creator Screen - React Native version
 * Puerto completo del componente web CVStyleCreator
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DEV_API_URL } from '@env';
import { DarkInput } from '../../components/character-creation/DarkInput';
import { MagicButton } from '../../components/character-creation/MagicButton';
import { SectionHeader } from '../../components/character-creation/SectionHeader';
import { GenderSelector } from '../../components/character-creation/GenderSelector';
import { SkillsList } from '../../components/character-creation/SkillsList';
import { BigFiveSliders } from '../../components/character-creation/BigFiveSliders';
import { ImportantPeopleList } from '../../components/character-creation/ImportantPeopleList';
import { EventsTimeline } from '../../components/character-creation/EventsTimeline';
import { colors } from '../../theme';

// Tipos
interface CharacterDraft {
  // Identity (Required)
  name: string;
  age: number | undefined;
  gender: 'male' | 'female' | 'non-binary' | undefined;
  origin: string;
  generalDescription: string;
  physicalDescription: string;
  avatarUrl: string | null;

  // Work (Required)
  occupation: string;
  skills: Skill[];
  achievements: string[];

  // Personality (Optional)
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  coreValues: string[];
  fears: string[];

  // Relationships (Optional)
  importantPeople: ImportantPerson[];
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'complicated' | undefined;

  // History (Optional)
  importantEvents: HistoryEvent[];
  traumas: string[];
  personalAchievements: string[];
}

interface Skill {
  name: string;
  level: number;
}

interface ImportantPerson {
  id: string;
  name: string;
  relationship: string;
  description: string;
  type: 'family' | 'friend' | 'romantic' | 'rival' | 'mentor' | 'colleague' | 'other';
  closeness: number;
  status: 'active' | 'estranged' | 'deceased' | 'distant';
}

interface HistoryEvent {
  id: string;
  year: number;
  title: string;
  description: string;
}

const API_URL = DEV_API_URL || 'http://localhost:3000';

export function CVStyleCreatorScreen() {
  const navigation = useNavigation();
  const [character, setCharacter] = useState<CharacterDraft>({
    name: '',
    age: undefined,
    gender: undefined,
    origin: '',
    generalDescription: '',
    physicalDescription: '',
    avatarUrl: null,
    occupation: '',
    skills: [],
    achievements: [],
    bigFive: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },
    coreValues: [],
    fears: [],
    importantPeople: [],
    maritalStatus: undefined,
    importantEvents: [],
    traumas: [],
    personalAchievements: [],
  });

  const [generatingIdentity, setGeneratingIdentity] = useState(false);
  const [generatingWork, setGeneratingWork] = useState(false);
  const [generatingPersonality, setGeneratingPersonality] = useState(false);
  const [generatingRelationships, setGeneratingRelationships] = useState(false);
  const [generatingHistory, setGeneratingHistory] = useState(false);

  const updateCharacter = (updates: Partial<CharacterDraft>) => {
    setCharacter((prev) => ({ ...prev, ...updates }));
  };

  const handleGenerateIdentity = async () => {
    if (!character.generalDescription.trim()) {
      Alert.alert('Error', 'Debes proporcionar una descripción general del personaje');
      return;
    }

    setGeneratingIdentity(true);
    try {
      const response = await fetch(`${API_URL}/api/character-creation/generate-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: character.generalDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar identidad');
      }

      const data = await response.json();
      updateCharacter({
        name: data.name,
        age: data.age,
        gender: data.gender,
        origin: data.origin,
        physicalDescription: data.physicalDescription || character.physicalDescription,
      });
    } catch (error) {
      console.error('Error generating identity:', error);
      Alert.alert('Error', 'No se pudo generar la identidad. Intenta de nuevo.');
    } finally {
      setGeneratingIdentity(false);
    }
  };

  const handleGenerateWork = async () => {
    if (!character.generalDescription.trim()) {
      Alert.alert('Error', 'Debes proporcionar una descripción general del personaje');
      return;
    }

    setGeneratingWork(true);
    try {
      const response = await fetch(`${API_URL}/api/character-creation/generate-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: character.generalDescription,
          name: character.name,
          age: character.age,
          gender: character.gender,
          origin: character.origin,
          existingSkills: character.skills,
          existingAchievements: character.achievements,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar trabajo');
      }

      const data = await response.json();
      updateCharacter({
        occupation: data.occupation,
        skills: data.skills,
        achievements: data.achievements,
      });
    } catch (error) {
      console.error('Error generating work:', error);
      Alert.alert('Error', 'No se pudo generar el trabajo. Intenta de nuevo.');
    } finally {
      setGeneratingWork(false);
    }
  };

  const handleGeneratePersonality = async () => {
    if (!character.generalDescription.trim()) {
      Alert.alert('Error', 'Debes proporcionar una descripción general del personaje');
      return;
    }

    setGeneratingPersonality(true);
    try {
      const response = await fetch(`${API_URL}/api/character-creation/generate-personality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: character.generalDescription,
          name: character.name,
          age: character.age,
          gender: character.gender,
          origin: character.origin,
          occupation: character.occupation,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar personalidad');
      }

      const data = await response.json();
      updateCharacter({
        bigFive: data.bigFive,
        coreValues: data.coreValues,
        fears: data.fears,
      });
    } catch (error) {
      console.error('Error generating personality:', error);
      Alert.alert('Error', 'No se pudo generar la personalidad. Intenta de nuevo.');
    } finally {
      setGeneratingPersonality(false);
    }
  };

  const handleGenerateRelationships = async () => {
    if (!character.generalDescription.trim()) {
      Alert.alert('Error', 'Debes proporcionar una descripción general del personaje');
      return;
    }

    setGeneratingRelationships(true);
    try {
      const response = await fetch(`${API_URL}/api/character-creation/generate-relationships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: character.generalDescription,
          name: character.name,
          age: character.age,
          gender: character.gender,
          origin: character.origin,
          occupation: character.occupation,
          bigFive: character.bigFive,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar relaciones');
      }

      const data = await response.json();
      updateCharacter({
        importantPeople: data.importantPeople,
        maritalStatus: data.maritalStatus,
      });
    } catch (error) {
      console.error('Error generating relationships:', error);
      Alert.alert('Error', 'No se pudo generar las relaciones. Intenta de nuevo.');
    } finally {
      setGeneratingRelationships(false);
    }
  };

  const handleGenerateHistory = async () => {
    if (!character.generalDescription.trim()) {
      Alert.alert('Error', 'Debes proporcionar una descripción general del personaje');
      return;
    }

    setGeneratingHistory(true);
    try {
      const response = await fetch(`${API_URL}/api/character-creation/generate-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: character.generalDescription,
          name: character.name,
          age: character.age,
          gender: character.gender,
          origin: character.origin,
          occupation: character.occupation,
          importantPeople: character.importantPeople,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar historia');
      }

      const data = await response.json();
      updateCharacter({
        importantEvents: data.importantEvents,
        traumas: data.traumas,
        personalAchievements: data.personalAchievements,
      });
    } catch (error) {
      console.error('Error generating history:', error);
      Alert.alert('Error', 'No se pudo generar la historia. Intenta de nuevo.');
    } finally {
      setGeneratingHistory(false);
    }
  };

  const handleSave = async () => {
    // Validar campos requeridos
    if (!character.name || !character.generalDescription || !character.occupation) {
      Alert.alert('Error', 'Completa todos los campos requeridos (nombre, descripción, ocupación)');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/character-creation/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(character),
      });

      if (!response.ok) {
        throw new Error('Error al guardar personaje');
      }

      const data = await response.json();
      Alert.alert('Éxito', 'Personaje creado exitosamente', [
        {
          text: 'OK',
          onPress: () => {
            // TODO: Navegar a la pantalla del personaje
            console.log('Navigate to character:', data.id);
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving character:', error);
      Alert.alert('Error', 'No se pudo guardar el personaje. Intenta de nuevo.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* App Header */}
      <View style={styles.appHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.appTitle}>Creación Manual</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Creador de Personajes</Text>
          <Text style={styles.subtitle}>
            Crea un personaje detallado con IA o manualmente
          </Text>
        </View>

        {/* Identity Section */}
        <View style={styles.section}>
          <SectionHeader
            icon="person"
            title="Identidad"
            badge="Requerido"
          />

          <DarkInput
            value={character.generalDescription}
            onChangeText={(text) => updateCharacter({ generalDescription: text })}
            placeholder="Describe al personaje en pocas palabras (ej: 'Una detective privada cínica de 35 años')"
            multiline
          />

          <MagicButton
            onPress={handleGenerateIdentity}
            loading={generatingIdentity}
            text="Generar Identidad con IA"
            fullWidth
            variant="primary"
            icon="sparkles"
          />

          <View style={styles.divider} />

          <DarkInput
            value={character.name}
            onChangeText={(text) => updateCharacter({ name: text })}
            placeholder="Nombre completo"
          />

          <DarkInput
            value={character.age?.toString() || ''}
            onChangeText={(text) => updateCharacter({ age: text ? parseInt(text, 10) : undefined })}
            placeholder="Edad"
            keyboardType="numeric"
          />

          <GenderSelector
            value={character.gender}
            onChange={(gender) => updateCharacter({ gender })}
          />

          <DarkInput
            value={character.origin}
            onChangeText={(text) => updateCharacter({ origin: text })}
            placeholder="Origen (ciudad, país)"
          />

          <DarkInput
            value={character.physicalDescription}
            onChangeText={(text) => updateCharacter({ physicalDescription: text })}
            placeholder="Descripción física detallada"
            multiline
          />
        </View>

        {/* Work Section */}
        <View style={styles.section}>
          <SectionHeader
            icon="briefcase"
            title="Trabajo y Habilidades"
            badge="Requerido"
          />

          <MagicButton
            onPress={handleGenerateWork}
            loading={generatingWork}
            text="Generar Trabajo con IA"
            fullWidth
            variant="primary"
            icon="sparkles"
          />

          <View style={styles.divider} />

          <DarkInput
            value={character.occupation}
            onChangeText={(text) => updateCharacter({ occupation: text })}
            placeholder="Ocupación actual"
          />

          <SkillsList
            skills={character.skills}
            onChange={(skills) => updateCharacter({ skills })}
          />

          <View style={styles.achievementsList}>
            <Text style={styles.fieldLabel}>Logros Profesionales</Text>
            {character.achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementItem}>
                <Text style={styles.achievementText}>{achievement}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const updated = character.achievements.filter((_, i) => i !== index);
                    updateCharacter({ achievements: updated });
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.error.main} />
                </TouchableOpacity>
              </View>
            ))}
            <DarkInput
              value=""
              onChangeText={(text) => {
                if (text.trim()) {
                  updateCharacter({ achievements: [...character.achievements, text] });
                }
              }}
              placeholder="Agregar logro (presiona Enter)"
            />
          </View>
        </View>

        {/* Personality Section */}
        <View style={styles.section}>
          <SectionHeader
            icon="brain"
            title="Personalidad"
            badge="Opcional"
          />

          <MagicButton
            onPress={handleGeneratePersonality}
            loading={generatingPersonality}
            text="Generar Personalidad con IA"
            fullWidth
            variant="primary"
            icon="sparkles"
          />

          <View style={styles.divider} />

          <BigFiveSliders
            values={character.bigFive}
            onChange={(bigFive) => updateCharacter({ bigFive })}
          />

          <View style={styles.listSection}>
            <Text style={styles.fieldLabel}>Valores Fundamentales</Text>
            {character.coreValues.map((value, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{value}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const updated = character.coreValues.filter((_, i) => i !== index);
                    updateCharacter({ coreValues: updated });
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.error.main} />
                </TouchableOpacity>
              </View>
            ))}
            <DarkInput
              value=""
              onChangeText={(text) => {
                if (text.trim()) {
                  updateCharacter({ coreValues: [...character.coreValues, text] });
                }
              }}
              placeholder="Agregar valor"
            />
          </View>

          <View style={styles.listSection}>
            <Text style={styles.fieldLabel}>Miedos</Text>
            {character.fears.map((fear, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{fear}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const updated = character.fears.filter((_, i) => i !== index);
                    updateCharacter({ fears: updated });
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.error.main} />
                </TouchableOpacity>
              </View>
            ))}
            <DarkInput
              value=""
              onChangeText={(text) => {
                if (text.trim()) {
                  updateCharacter({ fears: [...character.fears, text] });
                }
              }}
              placeholder="Agregar miedo"
            />
          </View>
        </View>

        {/* Relationships Section */}
        <View style={styles.section}>
          <SectionHeader
            icon="people"
            title="Relaciones"
            badge="Opcional"
          />

          <MagicButton
            onPress={handleGenerateRelationships}
            loading={generatingRelationships}
            text="Generar Relaciones con IA"
            fullWidth
            variant="primary"
            icon="sparkles"
          />

          <View style={styles.divider} />

          <ImportantPeopleList
            people={character.importantPeople}
            onChange={(importantPeople) => updateCharacter({ importantPeople })}
          />
        </View>

        {/* History Section */}
        <View style={styles.section}>
          <SectionHeader
            icon="time"
            title="Historia"
            badge="Opcional"
          />

          <MagicButton
            onPress={handleGenerateHistory}
            loading={generatingHistory}
            text="Generar Historia con IA"
            fullWidth
            variant="primary"
            icon="sparkles"
          />

          <View style={styles.divider} />

          <EventsTimeline
            events={character.importantEvents}
            onChange={(importantEvents) => updateCharacter({ importantEvents })}
          />

          <View style={styles.listSection}>
            <Text style={styles.fieldLabel}>Traumas</Text>
            {character.traumas.map((trauma, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{trauma}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const updated = character.traumas.filter((_, i) => i !== index);
                    updateCharacter({ traumas: updated });
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.error.main} />
                </TouchableOpacity>
              </View>
            ))}
            <DarkInput
              value=""
              onChangeText={(text) => {
                if (text.trim()) {
                  updateCharacter({ traumas: [...character.traumas, text] });
                }
              }}
              placeholder="Agregar trauma"
              multiline
            />
          </View>

          <View style={styles.listSection}>
            <Text style={styles.fieldLabel}>Logros Personales</Text>
            {character.personalAchievements.map((achievement, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{achievement}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const updated = character.personalAchievements.filter((_, i) => i !== index);
                    updateCharacter({ personalAchievements: updated });
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.error.main} />
                </TouchableOpacity>
              </View>
            ))}
            <DarkInput
              value=""
              onChangeText={(text) => {
                if (text.trim()) {
                  updateCharacter({ personalAchievements: [...character.personalAchievements, text] });
                }
              }}
              placeholder="Agregar logro personal"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <MagicButton
            onPress={handleSave}
            loading={false}
            text="Crear Personaje"
            fullWidth
            variant="gradient"
            icon="checkmark-circle"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: 32,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: 16,
  },
  helperText: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  saveButtonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  listSection: {
    marginTop: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  achievementsList: {
    marginTop: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  achievementText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
});
