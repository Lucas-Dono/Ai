/**
 * Important People List Component - Lista de personas importantes
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
import { Slider } from '../common/SimpleSlider';
import { colors } from '../../theme';
import { DarkInput } from './DarkInput';
import { MagicButton } from './MagicButton';

interface ImportantPerson {
  id: string;
  name: string;
  relationship: string;
  description: string;
  type: 'family' | 'friend' | 'romantic' | 'rival' | 'mentor' | 'colleague' | 'other';
  closeness: number; // 0-100
  status: 'active' | 'estranged' | 'deceased' | 'distant';
}

interface ImportantPeopleListProps {
  people: ImportantPerson[];
  onChange: (people: ImportantPerson[]) => void;
}

const relationshipTypes = [
  { value: 'family' as const, label: 'Familia', icon: 'home' as const },
  { value: 'friend' as const, label: 'Amigo', icon: 'people' as const },
  { value: 'romantic' as const, label: 'Romántico', icon: 'heart' as const },
  { value: 'rival' as const, label: 'Rival', icon: 'flash' as const },
  { value: 'mentor' as const, label: 'Mentor', icon: 'school' as const },
  { value: 'colleague' as const, label: 'Colega', icon: 'briefcase' as const },
  { value: 'other' as const, label: 'Otro', icon: 'ellipsis-horizontal' as const },
];

const statusOptions = [
  { value: 'active' as const, label: 'Activa', color: colors.success.main },
  { value: 'estranged' as const, label: 'Distanciada', color: colors.warning.main },
  { value: 'deceased' as const, label: 'Fallecido', color: colors.text.tertiary },
  { value: 'distant' as const, label: 'Distante', color: colors.info.main },
];

export function ImportantPeopleList({ people, onChange }: ImportantPeopleListProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempPerson, setTempPerson] = useState<Partial<ImportantPerson>>({
    name: '',
    relationship: '',
    description: '',
    type: 'friend',
    closeness: 50,
    status: 'active',
  });

  const handleAddPerson = () => {
    setEditingIndex(null);
    setTempPerson({
      name: '',
      relationship: '',
      description: '',
      type: 'friend',
      closeness: 50,
      status: 'active',
    });
    setModalVisible(true);
  };

  const handleEditPerson = (index: number) => {
    setEditingIndex(index);
    setTempPerson(people[index]);
    setModalVisible(true);
  };

  const handleSavePerson = () => {
    if (!tempPerson.name?.trim() || !tempPerson.relationship?.trim()) return;

    const newPerson: ImportantPerson = {
      id: editingIndex !== null ? people[editingIndex].id : Date.now().toString(),
      name: tempPerson.name!,
      relationship: tempPerson.relationship!,
      description: tempPerson.description || '',
      type: tempPerson.type || 'friend',
      closeness: tempPerson.closeness || 50,
      status: tempPerson.status || 'active',
    };

    if (editingIndex !== null) {
      const updated = [...people];
      updated[editingIndex] = newPerson;
      onChange(updated);
    } else {
      onChange([...people, newPerson]);
    }

    setModalVisible(false);
  };

  const handleDeletePerson = (index: number) => {
    const updated = people.filter((_, i) => i !== index);
    onChange(updated);
  };

  const getTypeIcon = (type: ImportantPerson['type']) => {
    return relationshipTypes.find((t) => t.value === type)?.icon || 'person';
  };

  const getStatusInfo = (status: ImportantPerson['status']) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Personas Importantes</Text>
        <TouchableOpacity onPress={handleAddPerson} style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color={colors.primary[400]} />
        </TouchableOpacity>
      </View>

      {people.length === 0 ? (
        <Text style={styles.emptyText}>No hay personas agregadas</Text>
      ) : (
        <View style={styles.peopleList}>
          {people.map((person, index) => {
            const statusInfo = getStatusInfo(person.status);
            return (
              <View key={person.id} style={styles.personCard}>
                <View style={styles.personHeader}>
                  <View style={styles.personTitleRow}>
                    <Ionicons
                      name={getTypeIcon(person.type)}
                      size={20}
                      color={colors.primary[400]}
                    />
                    <Text style={styles.personName}>{person.name}</Text>
                  </View>
                  <View style={styles.personActions}>
                    <TouchableOpacity onPress={() => handleEditPerson(index)}>
                      <Ionicons name="pencil" size={18} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePerson(index)}>
                      <Ionicons name="trash" size={18} color={colors.error.main} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.personRelationship}>{person.relationship}</Text>
                {person.description && (
                  <Text style={styles.personDescription} numberOfLines={2}>
                    {person.description}
                  </Text>
                )}

                <View style={styles.personMetaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Cercanía:</Text>
                    <Text style={styles.metaValue}>{person.closeness}/100</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Estado:</Text>
                    <Text style={[styles.metaValue, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingIndex !== null ? 'Editar Persona' : 'Agregar Persona'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <DarkInput
                value={tempPerson.name || ''}
                onChangeText={(text) => setTempPerson({ ...tempPerson, name: text })}
                placeholder="Nombre"
              />

              <DarkInput
                value={tempPerson.relationship || ''}
                onChangeText={(text) => setTempPerson({ ...tempPerson, relationship: text })}
                placeholder="Relación (ej: Mejor amigo, Padre, Ex-pareja)"
              />

              <DarkInput
                value={tempPerson.description || ''}
                onChangeText={(text) => setTempPerson({ ...tempPerson, description: text })}
                placeholder="Descripción"
                multiline
              />

              <Text style={styles.fieldLabel}>Tipo de Relación</Text>
              <View style={styles.typeGrid}>
                {relationshipTypes.map((type) => {
                  const isSelected = tempPerson.type === type.value;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                      onPress={() => setTempPerson({ ...tempPerson, type: type.value })}
                    >
                      <Ionicons
                        name={type.icon}
                        size={16}
                        color={isSelected ? colors.primary[400] : colors.text.secondary}
                      />
                      <Text
                        style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Estado de la Relación</Text>
              <View style={styles.statusRow}>
                {statusOptions.map((status) => {
                  const isSelected = tempPerson.status === status.value;
                  return (
                    <TouchableOpacity
                      key={status.value}
                      style={[styles.statusChip, isSelected && styles.statusChipSelected]}
                      onPress={() => setTempPerson({ ...tempPerson, status: status.value })}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          isSelected && { color: status.color },
                        ]}
                      >
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>
                Cercanía: {tempPerson.closeness || 50}/100
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={5}
                value={tempPerson.closeness || 50}
                onValueChange={(val) => {
                  const numVal = Array.isArray(val) ? val[0] : val;
                  setTempPerson({ ...tempPerson, closeness: numVal });
                }}
                minimumTrackTintColor={colors.primary[400]}
                maximumTrackTintColor={colors.border.light}
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
                  onPress={handleSavePerson}
                  loading={false}
                  text="Guardar"
                  variant="primary"
                  icon="checkmark"
                />
              </View>
            </View>
          </ScrollView>
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
  peopleList: {
    gap: 12,
  },
  personCard: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: 12,
  },
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  personTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  personActions: {
    flexDirection: 'row',
    gap: 12,
  },
  personRelationship: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary[400],
    marginBottom: 4,
  },
  personDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  personMetaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 8,
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 6,
  },
  typeChipSelected: {
    backgroundColor: colors.primary[900] + '33',
    borderColor: colors.primary[500],
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  typeChipTextSelected: {
    color: colors.primary[400],
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusChipSelected: {
    backgroundColor: colors.primary[900] + '33',
    borderColor: colors.primary[500],
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
