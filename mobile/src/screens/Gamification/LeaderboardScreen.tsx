import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MainStackParamList } from '../../navigation/types';
import gamificationApi, { LeaderboardEntry } from '../../services/api/gamification.api';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

type LeaderboardScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Leaderboard'>;
};

type Period = 'week' | 'month' | 'all';

export default function LeaderboardScreen({ navigation }: LeaderboardScreenProps) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('week');

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await gamificationApi.getLeaderboard(period, 50);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return { icon: '🥇', gradient: ['#FFD700', '#FFA500'] as [string, string] };
    if (rank === 2) return { icon: '🥈', gradient: ['#C0C0C0', '#A8A8A8'] as [string, string] };
    if (rank === 3) return { icon: '🥉', gradient: ['#CD7F32', '#8B4513'] as [string, string] };
    return null;
  };

  const getPeriodLabel = (p: Period) => {
    switch (p) {
      case 'week':
        return 'Esta Semana';
      case 'month':
        return 'Este Mes';
      case 'all':
        return 'Todo el Tiempo';
    }
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = item.userId === user?.id;
    const medal = getRankMedal(item.rank);

    return (
      <TouchableOpacity
        style={[styles.leaderboardItem, isCurrentUser && styles.leaderboardItemCurrent]}
        activeOpacity={0.7}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          {medal ? (
            <LinearGradient
              colors={medal.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.medalContainer}
            >
              <Text style={styles.medalIcon}>{medal.icon}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.rankNumber}>
              <Text style={styles.rankText}>#{item.rank}</Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          {item.userAvatar ? (
            <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.userName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}

          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.userName}
              {isCurrentUser && ' (Tú)'}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={12} color={colors.warning.main} />
                <Text style={styles.statText}>{item.level}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star" size={12} color={colors.primary[400]} />
                <Text style={styles.statText}>{item.points}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={12} color={colors.error.main} />
                <Text style={styles.statText}>{item.karma}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Badge Count */}
        <View style={styles.badgeCount}>
          <Ionicons name="ribbon" size={16} color={colors.primary[500]} />
          <Text style={styles.badgeCountText}>{item.badges}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Title */}
      <Text style={styles.title}>Clasificación</Text>
      <Text style={styles.subtitle}>Compite con otros creadores</Text>

      {/* Period Filters */}
      <View style={styles.filters}>
        {(['week', 'month', 'all'] as Period[]).map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.filterButton, period === p && styles.filterButtonActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.filterText, period === p && styles.filterTextActive]}>
              {getPeriodLabel(p)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="podium-outline" size={64} color={colors.text.tertiary} />
      <Text style={styles.emptyText}>No hay datos de clasificación aún</Text>
    </View>
  );

  if (loading && leaderboard.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clasificación</Text>
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
        <Text style={styles.headerTitle}>Clasificación</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item, index) => `${item.userId}-${index}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        onRefresh={loadLeaderboard}
        refreshing={loading}
      />
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
  listContent: {
    padding: spacing.lg,
  },
  headerContent: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  leaderboardItemCurrent: {
    borderWidth: 2,
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500] + '10',
  },
  rankContainer: {
    width: 56,
    marginRight: spacing.md,
  },
  medalContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalIcon: {
    fontSize: 28,
  },
  rankNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  badgeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[500] + '20',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  badgeCountText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
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
