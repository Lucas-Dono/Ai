/**
 * Pantalla de detalle de agente - Versión completa con datos reales
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MainStackParamList } from '../../navigation/types';
import { AgentsService, buildAvatarUrl } from '../../services/api';
import { colors, spacing, typography, borderRadius } from '../../theme';

type AgentDetailScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'AgentDetail'>;
  route: RouteProp<MainStackParamList, 'AgentDetail'>;
};

interface AgentDetail {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  kind: string;
  isPublic: boolean;
  userId?: string;
  featured?: boolean;
  systemPrompt?: string;
  rating?: number;
  reviewCount?: number;
  chatCount?: number;
}

// Generar gradiente basado en el nombre
const generateGradient = (name: string): string[] => {
  const gradients = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

export default function AgentDetailScreen({ navigation, route }: AgentDetailScreenProps) {
  const { agentId } = route.params;
  const insets = useSafeAreaInsets();
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgent();
  }, [agentId]);

  const loadAgent = async () => {
    try {
      setLoading(true);
      const response = await AgentsService.getById(agentId);

      if (response) {
        setAgent({
          id: response.id,
          name: response.name,
          description: response.description || 'Sin descripción',
          avatar: buildAvatarUrl(response.avatar),
          kind: response.kind,
          isPublic: response.isPublic ?? false,
          userId: response.userId,
          featured: response.featured ?? false,
          systemPrompt: response.systemPrompt,
          rating: response.rating,
          reviewCount: response.reviewCount || 0,
          chatCount: response.chatCount || 0,
        });
      }
    } catch (error) {
      console.error('Error loading agent:', error);
      Alert.alert('Error', 'No se pudo cargar la información del agente');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!agent) return;

    try {
      // Navegar al chat con este agente
      navigation.navigate('Chat', { worldId: agent.id });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'No se pudo iniciar la conversación');
    }
  };

  const handleEdit = () => {
    if (!agent) return;
    // TODO: Navegar a la pantalla de edición cuando esté lista
    Alert.alert('Próximamente', 'La funcionalidad de edición estará disponible pronto');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  if (!agent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error.main} />
          <Text style={styles.errorText}>No se encontró el agente</Text>
        </View>
      </View>
    );
  }

  const gradientColors = generateGradient(agent.name);
  const isOwnAgent = agent.userId !== null && agent.userId !== undefined;

  return (
    <View style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={[colors.background.secondary, colors.background.primary]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="share-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            {isOwnAgent && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleEdit}
              >
                <Ionicons name="create-outline" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {agent.avatar ? (
            <Image source={{ uri: agent.avatar }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {agent.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}

          {/* Badges */}
          <View style={styles.badges}>
            {agent.featured && (
              <View style={styles.badge}>
                <Ionicons name="star" size={12} color={colors.warning.main} />
                <Text style={styles.badgeText}> Premium</Text>
              </View>
            )}
            <View style={[styles.badge, agent.isPublic ? styles.badgePublic : styles.badgePrivate]}>
              <Ionicons
                name={agent.isPublic ? 'globe-outline' : 'lock-closed-outline'}
                size={12}
                color={agent.isPublic ? colors.info.main : colors.text.tertiary}
              />
              <Text style={[styles.badgeText, agent.isPublic ? styles.badgeTextPublic : styles.badgeTextPrivate]}>
                {' '}{agent.isPublic ? 'Público' : 'Privado'}
              </Text>
            </View>
          </View>
        </View>

        {/* Nombre */}
        <Text style={styles.name}>{agent.name}</Text>

        {/* Rating (solo si es público y tiene reviews) */}
        {agent.isPublic && agent.reviewCount > 0 && agent.rating ? (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.warning.main} />
            <Text style={styles.rating}> {agent.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}> ({agent.reviewCount} reseñas)</Text>
          </View>
        ) : null}

        {/* Stats */}
        {agent.chatCount > 0 ? (
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="chatbubbles" size={20} color={colors.primary[400]} />
              <Text style={styles.statValue}> {agent.chatCount.toLocaleString()}</Text>
              <Text style={styles.statLabel}> conversaciones</Text>
            </View>
          </View>
        ) : null}

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{agent.description}</Text>
        </View>

        {/* Personalidad/System Prompt */}
        {agent.systemPrompt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personalidad</Text>
            <Text style={styles.sectionContent}>{agent.systemPrompt}</Text>
          </View>
        )}

        {/* Tipo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo</Text>
          <View style={styles.kindContainer}>
            <Ionicons
              name={agent.kind === 'companion' ? 'heart' : 'business'}
              size={20}
              color={colors.primary[400]}
            />
            <Text style={styles.kindText}>
              {' '}{agent.kind === 'companion' ? 'Compañero' : 'Asistente'}
            </Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartChat}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Ionicons name="chatbubble" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>
                {' '}{isOwnAgent ? 'Continuar Conversación' : 'Iniciar Conversación'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Botón de editar si es tu agente */}
          {isOwnAgent && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleEdit}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary[500]} />
              <Text style={styles.secondaryButtonText}> Editar Agente</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Espaciado inferior para safe area */}
        <View style={{ height: Math.max(insets.bottom, spacing.xl) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  headerGradient: {
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.background.elevated,
    borderWidth: 4,
    borderColor: colors.background.secondary,
  },
  avatarGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.background.secondary,
  },
  avatarText: {
    fontSize: 56,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  badges: {
    position: 'absolute',
    bottom: -12,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border.light,
    marginHorizontal: 4,
  },
  badgePublic: {
    backgroundColor: colors.info.main + '20',
    borderColor: colors.info.main,
  },
  badgePrivate: {
    backgroundColor: colors.background.elevated,
    borderColor: colors.border.main,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  badgeTextPublic: {
    color: colors.info.light,
  },
  badgeTextPrivate: {
    color: colors.text.tertiary,
  },
  name: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rating: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  reviews: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  section: {
    width: '100%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: 24,
  },
  sectionContent: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  kindContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kindText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  actionsContainer: {
    width: '100%',
    marginTop: spacing.lg,
  },
  primaryButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  secondaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary[500],
    backgroundColor: 'transparent',
    marginTop: spacing.md,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
});
