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
import gamificationApi, { UserBadge, Badge } from '../../services/api/gamification.api';
import { colors, spacing, typography, borderRadius } from '../../theme';

type AchievementsScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Achievements'>;
};

const { width } = Dimensions.get('window');
const BADGE_SIZE = (width - spacing.lg * 3) / 3;

export default function AchievementsScreen({ navigation }: AchievementsScreenProps) {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const [userBadgesData, allBadgesData] = await Promise.all([
        gamificationApi.getUserBadges(),
        gamificationApi.getAllBadges(),
      ]);
      setUserBadges(userBadgesData);
      setAllBadges(allBadgesData);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeGradient = (rarity: string): [string, string] => {
    const gradients = {
      common: ['#9CA3AF', '#6B7280'] as [string, string],
      rare: ['#60A5FA', '#3B82F6'] as [string, string],
      epic: ['#A78BFA', '#8B5CF6'] as [string, string],
      legendary: ['#FCD34D', '#F59E0B'] as [string, string],
    };
    return gradients[rarity as keyof typeof gradients] || gradients.common;
  };

  const isEarned = (badgeId: string) => {
    return userBadges.some(ub => ub.badgeId === badgeId);
  };

  const filteredBadges = allBadges.filter(badge => {
    if (filter === 'earned') return isEarned(badge.id);
    if (filter === 'locked') return !isEarned(badge.id);
    return true;
  });

  const earnedCount = allBadges.filter(b => isEarned(b.id)).length;
  const totalCount = allBadges.length;
  const completionPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  const renderBadge = (badge: Badge) => {
    const earned = isEarned(badge.id);
    const gradient = getBadgeGradient(badge.rarity);

    return (
      <TouchableOpacity
        key={badge.id}
        style={styles.badgeCard}
        activeOpacity={0.8}
        onPress={() => {
          // TODO: Show badge detail modal
        }}
      >
        <LinearGradient
          colors={earned ? gradient : ['#374151', '#1F2937']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.badgeGradient, !earned && styles.badgeLocked]}
        >
          <Text style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>
            {badge.icon}
          </Text>
        </LinearGradient>
        <Text style={styles.badgeName} numberOfLines={2}>
          {badge.name}
        </Text>
        {!earned && (
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.text.tertiary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Logros</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
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
        <Text style={styles.headerTitle}>Logros</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <LinearGradient
            colors={[colors.primary[600], colors.primary[500]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressGradient}
          >
            <Text style={styles.progressTitle}>Tu Progreso</Text>
            <Text style={styles.progressCount}>
              {earnedCount} / {totalCount}
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${completionPercentage}%` }]} />
            </View>
            <Text style={styles.progressPercentage}>{completionPercentage.toFixed(0)}%</Text>
          </LinearGradient>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[styles.filterText, filter === 'all' && styles.filterTextActive]}
            >
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'earned' && styles.filterButtonActive]}
            onPress={() => setFilter('earned')}
          >
            <Text
              style={[styles.filterText, filter === 'earned' && styles.filterTextActive]}
            >
              Ganados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'locked' && styles.filterButtonActive]}
            onPress={() => setFilter('locked')}
          >
            <Text
              style={[styles.filterText, filter === 'locked' && styles.filterTextActive]}
            >
              Bloqueados
            </Text>
          </TouchableOpacity>
        </View>

        {/* Badges Grid */}
        <View style={styles.badgesGrid}>
          {filteredBadges.map(badge => renderBadge(badge))}
        </View>

        {filteredBadges.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>
              {filter === 'earned'
                ? 'Aún no has ganado badges'
                : 'No hay badges bloqueados'}
            </Text>
          </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  progressCard: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  progressGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  progressCount: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.text.primary,
  },
  progressPercentage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.primary,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  badgeCard: {
    width: BADGE_SIZE,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  badgeGradient: {
    width: BADGE_SIZE - spacing.xs * 2,
    height: BADGE_SIZE - spacing.xs * 2,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeLocked: {
    opacity: 0.4,
  },
  badgeIcon: {
    fontSize: 48,
  },
  badgeIconLocked: {
    opacity: 0.3,
  },
  badgeName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 14,
  },
  lockedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.background.elevated,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});
