/**
 * Pantalla de detalles del chat - Estilo WhatsApp/Snapchat
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MainStackParamList } from '../../navigation/types';
import { WorldsService, AgentsService, buildAvatarUrl, apiClient } from '../../services/api';
import { colors, spacing, typography, borderRadius } from '../../theme';

type ChatDetailScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ChatDetail'>;
  route: RouteProp<MainStackParamList, 'ChatDetail'>;
};

interface AgentInfo {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  personality?: string;
  kind?: string;
}

export default function ChatDetailScreen({ navigation, route }: ChatDetailScreenProps) {
  const { worldId, agentName, agentAvatar } = route.params;
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingMessages, setDeletingMessages] = useState(false);

  useEffect(() => {
    loadAgentInfo();
  }, [worldId]);

  const loadAgentInfo = async () => {
    try {
      setLoading(true);

      // Intentar cargar información del agente
      const response: any = await AgentsService.get(worldId);

      if (response) {
        setAgent({
          id: response.id,
          name: response.name || agentName,
          description: response.description || '',
          avatar: buildAvatarUrl(response.avatar) || agentAvatar,
          personality: response.personality,
          kind: response.kind,
        });
      }
    } catch (error) {
      console.error('Error loading agent info:', error);
      // Si falla, usar info de params
      setAgent({
        id: worldId,
        name: agentName,
        description: '',
        avatar: agentAvatar,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search in chat
   * TODO: Implement full search functionality with modal
   */
  const handleSearchChat = () => {
    Alert.alert(
      'Buscar en chat',
      'La funcionalidad de búsqueda estará disponible próximamente.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Handle clear chat - delete all messages
   */
  const handleClearChat = () => {
    Alert.alert(
      'Limpiar chat',
      '¿Estás seguro de que quieres eliminar todos los mensajes? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingMessages(true);

              // Call API to delete all messages for this world/agent
              await apiClient.delete(`/api/messages/delete-all?worldId=${worldId}`);

              Alert.alert(
                'Chat limpiado',
                'Se han eliminado todos los mensajes correctamente.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error: any) {
              console.error('Error clearing chat:', error);
              Alert.alert(
                'Error',
                'No se pudieron eliminar los mensajes. Por favor, inténtalo de nuevo.'
              );
            } finally {
              setDeletingMessages(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!agent) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={colors.error.main} />
        <Text style={styles.errorText}>No se pudo cargar la información</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Chat</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar grande */}
        <View style={styles.avatarSection}>
          {agent.avatar ? (
            <Image source={{ uri: agent.avatar }} style={styles.largeAvatar} />
          ) : (
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.largeAvatar}
            >
              <Text style={styles.largeAvatarText}>
                {agent.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}
          <Text style={styles.agentName}>{agent.name}</Text>
          {agent.kind && (
            <Text style={styles.agentKind}>
              {agent.kind === 'companion' ? 'Compañero' : 'Asistente'}
            </Text>
          )}
        </View>

        {/* Descripción */}
        {agent.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}> Descripción</Text>
            </View>
            <Text style={styles.description}>{agent.description}</Text>
          </View>
        )}

        {/* Personalidad */}
        {agent.personality && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles-outline" size={20} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}> Personalidad</Text>
            </View>
            <Text style={styles.description}>{agent.personality}</Text>
          </View>
        )}

        {/* Archivos compartidos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="image-outline" size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}> Archivos compartidos</Text>
          </View>
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No hay archivos compartidos</Text>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSearchChat}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="search-outline" size={24} color={colors.primary[500]} />
            </View>
            <Text style={styles.actionText}>Buscar en el chat</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              navigation.navigate('AgentDetail', { agentId: agent.id });
            }}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="person-outline" size={24} color={colors.primary[500]} />
            </View>
            <Text style={styles.actionText}>Ver perfil del agente</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerAction]}
            onPress={handleClearChat}
            disabled={deletingMessages}
          >
            <View style={styles.actionIconContainer}>
              {deletingMessages ? (
                <ActivityIndicator size="small" color={colors.error.main} />
              ) : (
                <Ionicons name="trash-outline" size={24} color={colors.error.main} />
              )}
            </View>
            <Text style={[styles.actionText, styles.dangerText]}>
              {deletingMessages ? 'Eliminando...' : 'Limpiar chat'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  largeAvatarText: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  agentName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  agentKind: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  actionsSection: {
    paddingVertical: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.card,
    marginBottom: 1,
  },
  dangerAction: {
    marginTop: spacing.md,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  dangerText: {
    color: colors.error.main,
  },
});
