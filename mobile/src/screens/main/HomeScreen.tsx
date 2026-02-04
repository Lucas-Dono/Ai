/**
 * Pantalla principal (Home) - Feed con discovery inmediato
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { WorldCard } from '../../components/ui/WorldCard';
import { AgentCard } from '../../components/ui/AgentCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { WorldsService, AgentsService, buildAvatarUrl } from '../../services/api';
import { colors, spacing, typography, borderRadius } from '../../theme';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList>;
};

interface World {
  id: string;
  name: string;
  description: string;
  category?: string;
  image?: string;
  messagesCount?: number;
  isActive?: boolean;
}

interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  kind: string;
  featured?: boolean;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const [recentWorlds, setRecentWorlds] = useState<World[]>([]);
  const [recommended, setRecommended] = useState<World[]>([]);
  const [trending, setTrending] = useState<World[]>([]);
  const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar datos reales del API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // NOTA: Los endpoints de grupos trending fueron deprecados
      // El servidor solo expone:
      // - /api/groups - Lista de grupos del usuario (requiere auth)
      // - /api/groups/user-groups - Lista simplificada

      // Por ahora, cargar solo grupos del usuario
      try {
        const userGroupsResponse: any = await WorldsService.list({ limit: 10 });
        if (userGroupsResponse?.groups) {
          const mapped = userGroupsResponse.groups.map((group: any) => ({
            id: group.id,
            name: group.name,
            description: group.description,
            category: group.category || 'general',
            image: buildAvatarUrl(group.GroupMember?.[0]?.Agent?.avatar || group.GroupMember?.[0]?.User?.image),
            messagesCount: group._count?.GroupMessage || 0,
            isActive: group.status === 'ACTIVE',
          }));
          setRecentWorlds(mapped.slice(0, 5));
        }
      } catch (error) {
        console.log('[HomeScreen] No groups available (user may not have any)');
        setRecentWorlds([]);
      }

      // Dejar trending y recommended vacíos (no hay endpoint)
      setTrending([]);
      setRecommended([]);

      // Cargar agents
      const agentsResponse = await AgentsService.list({ limit: 50 });
      if (Array.isArray(agentsResponse)) {
        // Separar destacados y del usuario
        // NOTA: No filtrar por kind para incluir todos los tipos de agentes (companion, original, etc.)
        const featured = agentsResponse.filter(
          (agent: any) => agent.featured === true && !agent.userId
        );
        const userAgents = agentsResponse.filter(
          (agent: any) => agent.userId !== null
        );

        // Mapear y construir URLs completas de avatares
        const mappedFeatured = featured.map((agent: any) => ({
          ...agent,
          avatar: buildAvatarUrl(agent.avatar),
        }));
        const mappedUserAgents = userAgents.map((agent: any) => ({
          ...agent,
          avatar: buildAvatarUrl(agent.avatar),
        }));

        console.log('[HomeScreen] Featured agents:', mappedFeatured.length);
        console.log('[HomeScreen] User agents:', mappedUserAgents.length);

        setFeaturedAgents(mappedFeatured.slice(0, 6));
        setMyAgents(mappedUserAgents.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorldPress = (worldId: string) => {
    navigation.navigate('Chat', { worldId });
  };

  const handleAgentPress = (agentId: string) => {
    // Ver detalles del agente
    navigation.navigate('AgentDetail', { agentId });
  };

  const handleAgentChatPress = (agentId: string) => {
    // Ir directo al chat
    navigation.navigate('Chat', { worldId: agentId });
  };

  return (
    <View style={styles.container}>
      {/* Header minimalista */}
      <View style={styles.header}>
        {/* Logo y título */}
        <View style={styles.headerTop}>
          <View style={styles.brandContainer}>
            <Ionicons name="sparkles" size={24} color={colors.primary[500]} />
            <Text style={styles.brandText}> Blaniel</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('CreateAgent')}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { marginLeft: spacing.md }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar compañeros, mundos..."
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Saludo personalizado */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Hola, {user?.name?.split(' ')[0] || 'Usuario'} 👋</Text>
          <Text style={styles.greetingSubtitle}>¿Con quién quieres conversar hoy?</Text>
        </View>

        {/* Loading state */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Cargando tus mundos...</Text>
          </View>
        ) : (
          <>
            {/* Continuar donde lo dejaste */}
            {recentWorlds.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Continuar conversación"
              subtitle="Tus chats recientes"
              onViewAll={() => navigation.navigate('MainTabs', { screen: 'Worlds' })}
            />
            <FlatList
              horizontal
              data={recentWorlds}
              renderItem={({ item }) => (
                <WorldCard
                  {...item}
                  onPress={() => handleWorldPress(item.id)}
                />
              )}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Mis Compañeros */}
        <View style={styles.section}>
          <SectionHeader
            title="Mis Compañeros"
            subtitle="Tus IAs personalizadas"
            onViewAll={myAgents.length > 0 ? () => navigation.navigate('MainTabs', { screen: 'Community' }) : undefined}
          />
          {myAgents.length > 0 ? (
            <FlatList
              horizontal
              data={myAgents}
              renderItem={({ item }) => (
                <AgentCard
                  {...item}
                  onPress={() => handleAgentPress(item.id)}
                  onChatPress={() => handleAgentChatPress(item.id)}
                />
              )}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            <View style={styles.emptyCompanions}>
              <EmptyState
                icon="people-outline"
                title="Crea tu primer compañero"
                subtitle="Diseña una IA con personalidad única"
                buttonText="Crear ahora"
                buttonIcon="add-circle"
                onButtonPress={() => navigation.navigate('CreateAgent')}
                compact
              />
            </View>
          )}
        </View>

        {/* Compañeros Destacados */}
        {featuredAgents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Compañeros Destacados"
              subtitle="IAs con personalidades únicas"
              onViewAll={() => navigation.navigate('MainTabs', { screen: 'Community' })}
            />
            <FlatList
              horizontal
              data={featuredAgents}
              renderItem={({ item }) => (
                <AgentCard
                  {...item}
                  onPress={() => handleAgentPress(item.id)}
                  onChatPress={() => handleAgentChatPress(item.id)}
                />
              )}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Para Ti */}
        <View style={styles.section}>
          <SectionHeader
            title="Para Ti"
            subtitle="Basado en tus intereses"
            onViewAll={() => navigation.navigate('MainTabs', { screen: 'Community' })}
          />
          <FlatList
            horizontal
            data={recommended}
            renderItem={({ item }) => (
              <WorldCard
                {...item}
                onPress={() => handleWorldPress(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Tendencias */}
        <View style={styles.section}>
          <SectionHeader
            title="Tendencias"
            subtitle="Los más populares ahora"
            onViewAll={() => navigation.navigate('MainTabs', { screen: 'Community' })}
          />
          <FlatList
            horizontal
            data={trending}
            renderItem={({ item }) => (
              <WorldCard
                {...item}
                onPress={() => handleWorldPress(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

            {/* Botón de crear destacado */}
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateAgent')}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.primary[500]} />
              <Text style={styles.createText}> Crear tu propia IA</Text>
            </TouchableOpacity>
          </>
        )}
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
    backgroundColor: colors.background.secondary,
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  },
  brandText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
  },
  greetingSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
  },
  createButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  emptyCompanions: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
});
