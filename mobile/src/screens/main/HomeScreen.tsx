/**
 * Pantalla principal (Home) - Feed con discovery inmediato
 * Diseño moderno con secciones de Compañeros, Círculo y Explorar por Vibe
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { CompanionCard } from '../../components/ui/CompanionCard';
import { CreateCompanionCard } from '../../components/ui/CreateCompanionCard';
import { CircleConversationItem } from '../../components/ui/CircleConversationItem';
import { VibeChip, VibeType } from '../../components/ui/VibeChip';
import { VibeCategorySection } from '../../components/ui/VibeCategorySection';
import { WorldsService, AgentsService, buildAvatarUrl } from '../../services/api';
import { colors, spacing, typography, borderRadius } from '../../theme';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList>;
};

interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  kind: string;
  featured?: boolean;
}

interface CircleConversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
}

// Categorías de vibe con sus configuraciones
const VIBE_CATEGORIES = [
  {
    id: 'love' as VibeType,
    title: 'Amor y Conexión',
    subtitle: 'Vínculos profundos y románticos',
    icon: 'heart' as const,
    color: '#EC4899',
    chipLabel: 'Amor',
  },
  {
    id: 'chaos' as VibeType,
    title: 'Energía Caótica',
    subtitle: 'Impredecibles y divertidos',
    icon: 'flash' as const,
    color: '#FACC15',
    chipLabel: 'Energía',
  },
  {
    id: 'conflict' as VibeType,
    title: 'Conflicto & Drama',
    subtitle: 'Relaciones complicadas y retos',
    icon: 'flame' as const,
    color: '#EF4444',
    chipLabel: 'Conflicto',
  },
  {
    id: 'stable' as VibeType,
    title: 'Zona de Confort',
    subtitle: 'Tranquilos y de apoyo',
    icon: 'shield' as const,
    color: '#10B981',
    chipLabel: 'Zona',
  },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [circleConversations, setCircleConversations] = useState<CircleConversation[]>([]);
  const [vibeAgents, setVibeAgents] = useState<Record<VibeType, Agent[]>>({
    love: [],
    chaos: [],
    conflict: [],
    stable: [],
  });
  const [selectedVibe, setSelectedVibe] = useState<VibeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar datos del API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar agentes
      const agentsResponse = await AgentsService.list({ limit: 50 });
      if (Array.isArray(agentsResponse)) {
        // Agentes del usuario
        const userAgents = agentsResponse
          .filter((agent: any) => agent.userId !== null)
          .map((agent: any) => ({
            ...agent,
            avatar: buildAvatarUrl(agent.avatar),
          }));

        setMyAgents(userAgents.slice(0, 6));

        // Agentes featured para categorías de vibe
        const featured = agentsResponse
          .filter((agent: any) => agent.featured === true && !agent.userId)
          .map((agent: any) => ({
            ...agent,
            avatar: buildAvatarUrl(agent.avatar),
          }));

        // Distribuir agentes en categorías (por ahora aleatoriamente)
        // TODO: En el futuro, esto debería basarse en tags o categorías del backend
        const shuffled = [...featured].sort(() => 0.5 - Math.random());
        const chunkSize = Math.ceil(shuffled.length / 4);

        setVibeAgents({
          love: shuffled.slice(0, chunkSize),
          chaos: shuffled.slice(chunkSize, chunkSize * 2),
          conflict: shuffled.slice(chunkSize * 2, chunkSize * 3),
          stable: shuffled.slice(chunkSize * 3),
        });

        // Simular conversaciones recientes (Mock data por ahora)
        // TODO: Integrar con API de mensajes reales
        const mockConversations: CircleConversation[] = userAgents.slice(0, 3).map((agent, index) => ({
          id: agent.id,
          name: agent.name,
          avatar: agent.avatar,
          lastMessage: index === 0
            ? '¡Hola! ¿Cómo estuvo tu día?'
            : index === 1
            ? 'Necesito contarte algo importante...'
            : 'Gracias por todo el apoyo 💜',
          time: index === 0 ? '2m' : index === 1 ? '1h' : '3h',
          unread: index === 0 ? 2 : 0,
        }));

        setCircleConversations(mockConversations);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentPress = (agentId: string) => {
    navigation.navigate('AgentDetail', { agentId });
  };

  const handleCirclePress = (conversationId: string) => {
    navigation.navigate('Chat', { worldId: conversationId });
  };

  const handleCreateAgent = () => {
    navigation.navigate('CreateAgent');
  };

  const filteredVibeCategories = selectedVibe
    ? VIBE_CATEGORIES.filter(cat => cat.id === selectedVibe)
    : VIBE_CATEGORIES;

  return (
    <View style={styles.container}>
      {/* Header moderno */}
      <View style={styles.header}>
        {/* Logo y título */}
        <View style={styles.headerTop}>
          <View style={styles.brandContainer}>
            <Ionicons name="sparkles" size={24} color={colors.primary[600]} />
            <Text style={styles.brandText}>Blaniel</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleCreateAgent}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de búsqueda mejorada */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Hola ${user?.name?.split(' ')[0] || 'Usuario'}, ¿qué vibra buscas hoy?`}
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loading state */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Cargando tus compañeros...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* SECCIÓN 1: Mis Compañeros */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mis Compañeros</Text>
            </View>

            <FlatList
              horizontal
              data={[{ id: 'create', type: 'create' }, ...myAgents]}
              renderItem={({ item }) => {
                if ('type' in item && item.type === 'create') {
                  return <CreateCompanionCard onPress={handleCreateAgent} />;
                }

                const agent = item as Agent;
                return (
                  <CompanionCard
                    id={agent.id}
                    name={agent.name}
                    role={agent.description || agent.kind}
                    avatar={agent.avatar}
                    status="offline"
                    onPress={() => handleAgentPress(agent.id)}
                  />
                );
              }}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* SECCIÓN 2: Mi Círculo */}
          {circleConversations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Text style={styles.sectionTitle}>Mi Círculo</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Recientes</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Worlds' })}>
                  <Text style={styles.viewAllText}>Ver todo</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.circleList}>
                {circleConversations.map((conversation) => (
                  <CircleConversationItem
                    key={conversation.id}
                    {...conversation}
                    onPress={() => handleCirclePress(conversation.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* SECCIÓN 3: Explorar por Vibe */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Explorar por Vibe</Text>
            </View>

            {/* Chips de filtro */}
            <View style={styles.vibeChipsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.vibeChips}
              >
                {VIBE_CATEGORIES.map((category) => (
                  <VibeChip
                    key={category.id}
                    type={category.id}
                    label={category.chipLabel}
                    icon={category.icon}
                    selected={selectedVibe === category.id}
                    onPress={() => setSelectedVibe(selectedVibe === category.id ? null : category.id)}
                  />
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Categorías de Vibe */}
          {filteredVibeCategories.map((category) => (
            <VibeCategorySection
              key={category.id}
              title={category.title}
              subtitle={category.subtitle}
              icon={category.icon}
              color={category.color}
              items={vibeAgents[category.id].map(agent => ({
                id: agent.id,
                name: agent.name,
                role: agent.description || agent.kind,
                image: agent.avatar,
              }))}
              onItemPress={handleAgentPress}
              onViewAll={() => navigation.navigate('MainTabs', { screen: 'Community' })}
            />
          ))}

          {/* Espacio adicional al final */}
          <View style={{ height: spacing['2xl'] }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    backgroundColor: colors.background.primary,
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.regular,
  },
  viewAllText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[400],
    fontWeight: typography.fontWeight.medium,
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
  },
  circleList: {
    paddingHorizontal: spacing.lg,
  },
  vibeChipsContainer: {
    marginBottom: spacing.md,
  },
  vibeChips: {
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
});
