/**
 * Skills List Component - Lista de habilidades con niveles
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { DarkInput } from './DarkInput';
import { MagicButton } from './MagicButton';
import Slider from '@react-native-community/slider';

interface Skill {
  name: string;
  level: number; // 0-100
}

interface SkillsListProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

const getSkillLevelLabel = (level: number): string => {
  if (level <= 20) return 'Novato';
  if (level <= 40) return 'Principiante';
  if (level <= 60) return 'Intermedio';
  if (level <= 80) return 'Avanzado';
  return 'Experto';
};

const getSkillLevelColor = (level: number): string => {
  if (level <= 20) return colors.text.tertiary;
  if (level <= 40) return colors.info.main;
  if (level <= 60) return colors.warning.main;
  if (level <= 80) return colors.primary[400];
  return colors.success.main;
};

export function SkillsList({ skills, onChange }: SkillsListProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempSkillName, setTempSkillName] = useState('');
  const [tempSkillLevel, setTempSkillLevel] = useState(50);

  const handleAddSkill = () => {
    setEditingIndex(null);
    setTempSkillName('');
    setTempSkillLevel(50);
    setModalVisible(true);
  };

  const handleEditSkill = (index: number) => {
    setEditingIndex(index);
    setTempSkillName(skills[index].name);
    setTempSkillLevel(skills[index].level);
    setModalVisible(true);
  };

  const handleSaveSkill = () => {
    if (!tempSkillName.trim()) return;

    const newSkill = { name: tempSkillName, level: tempSkillLevel };

    if (editingIndex !== null) {
      // Editar existente
      const updated = [...skills];
      updated[editingIndex] = newSkill;
      onChange(updated);
    } else {
      // Agregar nuevo
      onChange([...skills, newSkill]);
    }

    setModalVisible(false);
  };

  const handleDeleteSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Habilidades</Text>
        <TouchableOpacity onPress={handleAddSkill} style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color={colors.primary[400]} />
        </TouchableOpacity>
      </View>

      {skills.length === 0 ? (
        <Text style={styles.emptyText}>No hay habilidades agregadas</Text>
      ) : (
        <View style={styles.skillsList}>
          {skills.map((skill, index) => (
            <View key={index} style={styles.skillItem}>
              <View style={styles.skillInfo}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={[styles.skillLevel, { color: getSkillLevelColor(skill.level) }]}>
                  {getSkillLevelLabel(skill.level)} ({skill.level}/100)
                </Text>
              </View>
              <View style={styles.skillActions}>
                <TouchableOpacity onPress={() => handleEditSkill(index)}>
                  <Ionicons name="pencil" size={18} color={colors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteSkill(index)}>
                  <Ionicons name="trash" size={18} color={colors.error.main} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Modal de edición */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingIndex !== null ? 'Editar Habilidad' : 'Agregar Habilidad'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <DarkInput
              value={tempSkillName}
              onChangeText={setTempSkillName}
              placeholder="Nombre de la habilidad"
            />

            <Text style={styles.sliderLabel}>
              Nivel: {getSkillLevelLabel(tempSkillLevel)} ({tempSkillLevel}/100)
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={tempSkillLevel}
              onValueChange={setTempSkillLevel}
              minimumTrackTintColor={colors.primary[400]}
              maximumTrackTintColor={colors.border.subtle}
              thumbTintColor={colors.primary[400]}
            />

            <View style={styles.modalActions}>
              <MagicButton
                onPress={() => setModalVisible(false)}
                loading={false}
                text="Cancelar"
                variant="secondary"
                icon="close"
              />
              <MagicButton
                onPress={handleSaveSkill}
                loading={false}
                text="Guardar"
                variant="primary"
                icon="checkmark"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  addButton: {
    padding: 4,
  },
  emptyText: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  skillsList: {
    gap: 8,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    padding: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  skillLevel: {
    fontSize: 12,
    fontWeight: '500',
  },
  skillActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 8,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
