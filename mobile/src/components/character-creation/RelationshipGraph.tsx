/**
 * Relationship Graph - Interactive Force-Directed Network
 *
 * Visualización interactiva de red de relaciones con nodos arrastrables,
 * zoom/pan gestures, y color coding por tipo de relación.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import {
  Users,
  Plus,
  X,
  Edit2,
  Trash2,
  Heart,
  UserPlus,
  Briefcase,
  Home,
  Zap,
} from 'lucide-react-native';
import { colors } from '../../theme';

const { width, height } = Dimensions.get('window');
const GRAPH_WIDTH = width - 48;
const GRAPH_HEIGHT = 400;

// ============================================================================
// TYPES
// ============================================================================

export interface RelationshipNode {
  id: string;
  name: string;
  relationship: string;
  type: 'family' | 'friend' | 'romantic' | 'professional' | 'other';
  x: number;
  y: number;
  description?: string;
}

interface RelationshipGraphProps {
  nodes: RelationshipNode[];
  onNodesChange: (nodes: RelationshipNode[]) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const getTypeColor = (type: RelationshipNode['type']): string => {
  switch (type) {
    case 'family':
      return '#10b981'; // Green
    case 'friend':
      return '#3b82f6'; // Blue
    case 'romantic':
      return '#ec4899'; // Pink
    case 'professional':
      return '#f59e0b'; // Orange
    case 'other':
      return '#8b5cf6'; // Purple
    default:
      return colors.text.tertiary;
  }
};

const getTypeIcon = (type: RelationshipNode['type']) => {
  switch (type) {
    case 'family':
      return Home;
    case 'friend':
      return UserPlus;
    case 'romantic':
      return Heart;
    case 'professional':
      return Briefcase;
    case 'other':
      return Zap;
    default:
      return Users;
  }
};

const getTypeLabel = (type: RelationshipNode['type']): string => {
  switch (type) {
    case 'family':
      return 'Familia';
    case 'friend':
      return 'Amistad';
    case 'romantic':
      return 'Romántica';
    case 'professional':
      return 'Profesional';
    case 'other':
      return 'Otra';
    default:
      return 'Desconocida';
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

export function RelationshipGraph({ nodes, onNodesChange }: RelationshipGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNode, setEditingNode] = useState<RelationshipNode | null>(null);

  // Form state
  const [newNode, setNewNode] = useState({
    name: '',
    relationship: '',
    type: 'friend' as RelationshipNode['type'],
    description: '',
  });

  const modalScale = useRef(new Animated.Value(0)).current;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddNode = () => {
    if (!newNode.name.trim() || !newNode.relationship.trim()) {
      return;
    }

    const node: RelationshipNode = {
      id: Date.now().toString(),
      name: newNode.name.trim(),
      relationship: newNode.relationship.trim(),
      type: newNode.type,
      description: newNode.description.trim(),
      // Random initial position
      x: Math.random() * (GRAPH_WIDTH - 100) + 50,
      y: Math.random() * (GRAPH_HEIGHT - 100) + 50,
    };

    onNodesChange([...nodes, node]);
    setNewNode({ name: '', relationship: '', type: 'friend', description: '' });
    handleCloseModal();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleEditNode = (node: RelationshipNode) => {
    setEditingNode(node);
    setNewNode({
      name: node.name,
      relationship: node.relationship,
      type: node.type,
      description: node.description || '',
    });
    handleOpenModal();
  };

  const handleSaveEdit = () => {
    if (!editingNode || !newNode.name.trim() || !newNode.relationship.trim()) {
      return;
    }

    const updatedNodes = nodes.map((n) =>
      n.id === editingNode.id
        ? {
            ...n,
            name: newNode.name.trim(),
            relationship: newNode.relationship.trim(),
            type: newNode.type,
            description: newNode.description.trim(),
          }
        : n
    );

    onNodesChange(updatedNodes);
    setEditingNode(null);
    setNewNode({ name: '', relationship: '', type: 'friend', description: '' });
    handleCloseModal();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteNode = (id: string) => {
    onNodesChange(nodes.filter((n) => n.id !== id));
    setSelectedNode(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handleNodePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedNode(selectedNode === id ? null : id);
  };

  const handleOpenModal = () => {
    setShowAddModal(true);
    Animated.spring(modalScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(modalScale, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowAddModal(false);
      setEditingNode(null);
      setNewNode({ name: '', relationship: '', type: 'friend', description: '' });
    });
  };

  // ============================================================================
  // RENDER GRAPH
  // ============================================================================

  const renderGraph = () => {
    // Centro del grafo (personaje principal)
    const centerX = GRAPH_WIDTH / 2;
    const centerY = GRAPH_HEIGHT / 2;

    return (
      <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
        {/* Lines from center to nodes */}
        {nodes.map((node) => (
          <Line
            key={`line-${node.id}`}
            x1={centerX}
            y1={centerY}
            x2={node.x}
            y2={node.y}
            stroke={getTypeColor(node.type)}
            strokeWidth="2"
            opacity="0.4"
          />
        ))}

        {/* Center node (character) */}
        <G>
          <Circle
            cx={centerX}
            cy={centerY}
            r="30"
            fill="#8b5cf6"
            stroke="#a78bfa"
            strokeWidth="3"
          />
          <SvgText
            x={centerX}
            y={centerY + 5}
            fontSize="14"
            fontWeight="700"
            fill="#ffffff"
            textAnchor="middle"
          >
            TÚ
          </SvgText>
        </G>

        {/* Relationship nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNode === node.id;
          return (
            <G key={node.id}>
              <Circle
                cx={node.x}
                cy={node.y}
                r={isSelected ? 28 : 24}
                fill={getTypeColor(node.type)}
                stroke={isSelected ? '#ffffff' : getTypeColor(node.type)}
                strokeWidth={isSelected ? '3' : '2'}
                opacity="0.9"
                onPress={() => handleNodePress(node.id)}
              />
              <SvgText
                x={node.x}
                y={node.y - 35}
                fontSize="12"
                fontWeight="600"
                fill={colors.text.primary}
                textAnchor="middle"
              >
                {node.name}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Users size={20} color="#8b5cf6" />
        <Text style={styles.title}>Red de Relaciones</Text>
      </View>

      <Text style={styles.subtitle}>
        Visualiza las conexiones importantes del personaje
      </Text>

      {/* Graph */}
      <View style={styles.graphContainer}>
        {nodes.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>Sin relaciones aún</Text>
            <Text style={styles.emptySubtext}>
              Agrega personas importantes para crear la red
            </Text>
          </View>
        ) : (
          renderGraph()
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Tipos de Relación</Text>
        <View style={styles.legendItems}>
          {(['family', 'friend', 'romantic', 'professional', 'other'] as const).map(
            (type) => (
              <View key={type} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: getTypeColor(type) }]}
                />
                <Text style={styles.legendText}>{getTypeLabel(type)}</Text>
              </View>
            )
          )}
        </View>
      </View>

      {/* Node Details */}
      {selectedNode && (
        <View style={styles.nodeDetails}>
          {(() => {
            const node = nodes.find((n) => n.id === selectedNode);
            if (!node) return null;

            const Icon = getTypeIcon(node.type);

            return (
              <>
                <View style={styles.nodeDetailsHeader}>
                  <View style={styles.nodeDetailsInfo}>
                    <Icon size={18} color={getTypeColor(node.type)} />
                    <Text style={styles.nodeDetailsName}>{node.name}</Text>
                  </View>
                  <View style={styles.nodeDetailsActions}>
                    <TouchableOpacity
                      onPress={() => handleEditNode(node)}
                      style={styles.nodeAction}
                    >
                      <Edit2 size={16} color="#8b5cf6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteNode(node.id)}
                      style={styles.nodeAction}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.nodeDetailsRelation}>{node.relationship}</Text>
                {node.description && (
                  <Text style={styles.nodeDetailsDesc}>{node.description}</Text>
                )}
              </>
            );
          })()}
        </View>
      )}

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleOpenModal}>
        <Plus size={18} color="#ffffff" />
        <Text style={styles.addButtonText}>Agregar Relación</Text>
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ scale: modalScale }] },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingNode ? 'Editar Relación' : 'Nueva Relación'}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la persona"
                placeholderTextColor={colors.text.tertiary}
                value={newNode.name}
                onChangeText={(text) => setNewNode({ ...newNode, name: text })}
              />

              <Text style={styles.label}>Relación *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Mejor amigo, Hermana, Mentor..."
                placeholderTextColor={colors.text.tertiary}
                value={newNode.relationship}
                onChangeText={(text) =>
                  setNewNode({ ...newNode, relationship: text })
                }
              />

              <Text style={styles.label}>Tipo de Relación</Text>
              <View style={styles.typeButtons}>
                {(['family', 'friend', 'romantic', 'professional', 'other'] as const).map(
                  (type) => {
                    const Icon = getTypeIcon(type);
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          newNode.type === type && styles.typeButtonActive,
                          {
                            borderColor: getTypeColor(type),
                            backgroundColor:
                              newNode.type === type
                                ? getTypeColor(type)
                                : 'transparent',
                          },
                        ]}
                        onPress={() => {
                          setNewNode({ ...newNode, type });
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Icon
                          size={16}
                          color={newNode.type === type ? '#ffffff' : getTypeColor(type)}
                        />
                        <Text
                          style={[
                            styles.typeButtonText,
                            newNode.type === type && styles.typeButtonTextActive,
                          ]}
                        >
                          {getTypeLabel(type)}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>

              <Text style={styles.label}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe la relación..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={3}
                value={newNode.description}
                onChangeText={(text) =>
                  setNewNode({ ...newNode, description: text })
                }
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={editingNode ? handleSaveEdit : handleAddNode}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {editingNode ? 'Guardar' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    marginBottom: 20,
    lineHeight: 20,
  },
  graphContainer: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: GRAPH_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 32,
  },
  legend: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  nodeDetails: {
    backgroundColor: colors.background.elevated,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  nodeDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nodeDetailsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  nodeDetailsName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  nodeDetailsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  nodeAction: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 8,
  },
  nodeDetailsRelation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  nodeDetailsDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  modalForm: {
    padding: 20,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  typeButtonActive: {},
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#8b5cf6',
  },
  modalButtonSecondary: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});
