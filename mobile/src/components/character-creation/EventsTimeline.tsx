/**
 * Events Timeline Component - Timeline de eventos históricos
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

interface HistoryEvent {
  id: string;
  year: number;
  title: string;
  description: string;
}

interface EventsTimelineProps {
  events: HistoryEvent[];
  onChange: (events: HistoryEvent[]) => void;
}

export function EventsTimeline({ events, onChange }: EventsTimelineProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempEvent, setTempEvent] = useState<Partial<HistoryEvent>>({
    year: new Date().getFullYear(),
    title: '',
    description: '',
  });

  const handleAddEvent = () => {
    setEditingIndex(null);
    setTempEvent({
      year: new Date().getFullYear(),
      title: '',
      description: '',
    });
    setModalVisible(true);
  };

  const handleEditEvent = (index: number) => {
    setEditingIndex(index);
    setTempEvent(events[index]);
    setModalVisible(true);
  };

  const handleSaveEvent = () => {
    if (!tempEvent.title?.trim() || !tempEvent.year) return;

    const newEvent: HistoryEvent = {
      id: editingIndex !== null ? events[editingIndex].id : Date.now().toString(),
      year: tempEvent.year!,
      title: tempEvent.title!,
      description: tempEvent.description || '',
    };

    if (editingIndex !== null) {
      const updated = [...events];
      updated[editingIndex] = newEvent;
      onChange(updated);
    } else {
      onChange([...events, newEvent]);
    }

    setModalVisible(false);
  };

  const handleDeleteEvent = (index: number) => {
    const updated = events.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Ordenar eventos por año (más reciente primero)
  const sortedEvents = [...events].sort((a, b) => b.year - a.year);

  const getEventAge = (year: number): string => {
    const currentYear = new Date().getFullYear();
    const diff = currentYear - year;
    if (diff === 0) return 'Este año';
    if (diff === 1) return 'Hace 1 año';
    if (diff > 0) return `Hace ${diff} años`;
    return `En ${Math.abs(diff)} años`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Eventos Importantes</Text>
        <TouchableOpacity onPress={handleAddEvent} style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color={colors.primary[400]} />
        </TouchableOpacity>
      </View>

      {sortedEvents.length === 0 ? (
        <Text style={styles.emptyText}>No hay eventos agregados</Text>
      ) : (
        <View style={styles.timeline}>
          {sortedEvents.map((event, index) => {
            const originalIndex = events.findIndex((e) => e.id === event.id);
            return (
              <View key={event.id} style={styles.eventContainer}>
                {/* Timeline connector */}
                {index < sortedEvents.length - 1 && <View style={styles.connector} />}

                {/* Timeline dot */}
                <View style={styles.timelineDot}>
                  <View style={styles.dotInner} />
                </View>

                {/* Event card */}
                <View style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTitleRow}>
                      <Text style={styles.eventYear}>{event.year}</Text>
                      <Text style={styles.eventAge}>{getEventAge(event.year)}</Text>
                    </View>
                    <View style={styles.eventActions}>
                      <TouchableOpacity onPress={() => handleEditEvent(originalIndex)}>
                        <Ionicons name="pencil" size={18} color={colors.text.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteEvent(originalIndex)}>
                        <Ionicons name="trash" size={18} color={colors.error.main} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}
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
                  {editingIndex !== null ? 'Editar Evento' : 'Agregar Evento'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <DarkInput
                value={tempEvent.year?.toString() || ''}
                onChangeText={(text) =>
                  setTempEvent({ ...tempEvent, year: text ? parseInt(text, 10) : undefined })
                }
                placeholder="Año"
                keyboardType="numeric"
              />

              <DarkInput
                value={tempEvent.title || ''}
                onChangeText={(text) => setTempEvent({ ...tempEvent, title: text })}
                placeholder="Título del evento"
              />

              <DarkInput
                value={tempEvent.description || ''}
                onChangeText={(text) => setTempEvent({ ...tempEvent, description: text })}
                placeholder="Descripción detallada"
                multiline
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
                  onPress={handleSaveEvent}
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
    marginBottom: 16,
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
  timeline: {
    paddingLeft: 8,
  },
  eventContainer: {
    position: 'relative',
    marginBottom: 20,
    paddingLeft: 32,
  },
  connector: {
    position: 'absolute',
    left: 11,
    top: 24,
    width: 2,
    height: '100%',
    backgroundColor: colors.border.light,
  },
  timelineDot: {
    position: 'absolute',
    left: 4,
    top: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[400],
  },
  eventCard: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitleRow: {
    flex: 1,
  },
  eventYear: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary[400],
    marginBottom: 2,
  },
  eventAge: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 12,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
  },
  eventDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
