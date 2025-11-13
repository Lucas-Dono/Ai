import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MainStackParamList } from '../../navigation/types';
import analyticsApi, { PersonalStats } from '../../services/api/analytics.api';
import { colors, spacing, typography, borderRadius } from '../../theme';

type MyStatsScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'MyStats'>;
};

const { width } = Dimensions.get('window');
const STAT_CARD_WIDTH = (width - spacing.lg * 3) / 2;

export default function MyStatsScreen({ navigation }: MyStatsScreenProps) {
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getMyStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis: { [key: string]: string } = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😨',
      love: '❤️',
      surprise: '😲',
      trust: '🤝',
      anticipation: '🤔',
    };
    return emojis[emotion.toLowerCase()] || '😐';
  };

  const getValenceColor = (valence: number) => {
    if (valence > 0.5) return colors.success.main;
    if (valence < -0.5) return colors.error.main;
    return colors.warning.main;
  };

  const renderStatCard = (icon: string, label: string, value: string | number, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderEmotionalProfile = () => {
    if (!stats?.emotionalProfile) return null;

    const { dominantEmotion, valence, emotionDistribution } = stats.emotionalProfile;
    const valenceColor = getValenceColor(valence);
    const valencePercentage = ((valence + 1) / 2) * 100;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perfil Emocional</Text>

        <View style={styles.emotionCard}>
          <View style={styles.dominantEmotion}>
            <Text style={styles.emotionEmoji}>{getEmotionEmoji(dominantEmotion)}</Text>
            <Text style={styles.emotionName}>{dominantEmotion}</Text>
            <Text style={styles.emotionSubtitle}>Emoción dominante</Text>
          </View>

          <View style={styles.valenceContainer}>
            <Text style={styles.valenceLabel}>Índice de Positividad</Text>
            <View style={styles.valenceBar}>
              <View
                style={[
                  styles.valenceBarFill,
                  { width: `${valencePercentage}%`, backgroundColor: valenceColor },
                ]}
              />
            </View>
            <Text style={[styles.valenceValue, { color: valenceColor }]}>
              {(valence * 100).toFixed(0)}%
            </Text>
          </View>

          {emotionDistribution.length > 0 && (
            <View style={styles.emotionDistribution}>
              <Text style={styles.distributionTitle}>Distribución</Text>
              {emotionDistribution.slice(0, 5).map((item, index) => (
                <View key={index} style={styles.distributionItem}>
                  <Text style={styles.distributionEmoji}>{getEmotionEmoji(item.emotion)}</Text>
                  <Text style={styles.distributionName}>{item.emotion}</Text>
                  <View style={styles.distributionBar}>
                    <View
                      style={[
                        styles.distributionBarFill,
                        { width: `${item.percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.distributionPercentage}>{item.percentage.toFixed(0)}%</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderRelationships = () => {
    if (!stats?.relationshipStats) return null;

    const { strongestRelationship, relationships } = stats.relationshipStats;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Relaciones</Text>

        {strongestRelationship && (
          <View style={styles.strongestRelationship}>
            <LinearGradient
              colors={[colors.primary[600], colors.primary[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.strongestGradient}
            >
              <Ionicons name="heart" size={32} color={colors.text.primary} />
              <Text style={styles.strongestName}>{strongestRelationship.agentName}</Text>
              <Text style={styles.strongestScore}>
                Afinidad: {strongestRelationship.affinityScore.toFixed(1)}%
              </Text>
              <Text style={styles.strongestStage}>{strongestRelationship.stage}</Text>
            </LinearGradient>
          </View>
        )}

        {relationships.length > 0 && (
          <View style={styles.relationshipsList}>
            {relationships.slice(0, 5).map((rel, index) => (
              <View key={index} style={styles.relationshipItem}>
                <View style={styles.relationshipInfo}>
                  <Text style={styles.relationshipName}>{rel.agentName}</Text>
                  <Text style={styles.relationshipStage}>{rel.stage}</Text>
                </View>
                <View style={styles.relationshipStats}>
                  <View style={styles.relationshipStatItem}>
                    <Ionicons name="heart" size={14} color={colors.error.main} />
                    <Text style={styles.relationshipStatText}>
                      {rel.affinityScore.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.relationshipStatItem}>
                    <Ionicons name="chatbubbles" size={14} color={colors.primary[500]} />
                    <Text style={styles.relationshipStatText}>{rel.messagesExchanged}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Estadísticas</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Estadísticas</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>No hay estadísticas disponibles aún</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Estadísticas</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          {renderStatCard('chatbubbles', 'Mensajes', stats.totalMessages, colors.primary[500])}
          {renderStatCard('people', 'Agentes', stats.totalAgents, colors.secondary[500])}
          {renderStatCard('planet', 'Mundos', stats.totalWorlds, colors.info.main)}
          {renderStatCard('time', 'Tiempo', formatTime(stats.totalTimeSpent), colors.warning.main)}
        </View>

        {/* Favorite Agent */}
        {stats.favoriteAgent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agente Favorito</Text>
            <View style={styles.favoriteCard}>
              <Ionicons name="star" size={32} color={colors.warning.main} />
              <Text style={styles.favoriteName}>{stats.favoriteAgent.name}</Text>
              <Text style={styles.favoriteMessages}>
                {stats.favoriteAgent.messageCount} mensajes
              </Text>
            </View>
          </View>
        )}

        {/* Emotional Profile */}
        {renderEmotionalProfile()}

        {/* Relationships */}
        {renderRelationships()}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: STAT_CARD_WIDTH,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    margin: spacing.xs,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  favoriteCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  favoriteName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  favoriteMessages: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  emotionCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  dominantEmotion: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emotionEmoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  emotionName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textTransform: 'capitalize',
    marginBottom: spacing.xs,
  },
  emotionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  valenceContainer: {
    marginBottom: spacing.lg,
  },
  valenceLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  valenceBar: {
    height: 8,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  valenceBarFill: {
    height: '100%',
  },
  valenceValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'right',
  },
  emotionDistribution: {
    gap: spacing.sm,
  },
  distributionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  distributionEmoji: {
    fontSize: 20,
    width: 24,
  },
  distributionName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    textTransform: 'capitalize',
    width: 80,
  },
  distributionBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  distributionPercentage: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    width: 32,
    textAlign: 'right',
  },
  strongestRelationship: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  strongestGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  strongestName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  strongestScore: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  strongestStage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    opacity: 0.8,
    textTransform: 'capitalize',
  },
  relationshipsList: {
    gap: spacing.sm,
  },
  relationshipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  relationshipInfo: {
    flex: 1,
  },
  relationshipName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  relationshipStage: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  relationshipStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  relationshipStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relationshipStatText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
});
