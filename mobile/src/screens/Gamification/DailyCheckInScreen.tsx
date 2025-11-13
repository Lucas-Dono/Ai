import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MainStackParamList } from '../../navigation/types';
import gamificationApi, { UserReputation } from '../../services/api/gamification.api';
import { colors, spacing, typography, borderRadius } from '../../theme';

type DailyCheckInScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'DailyCheckIn'>;
};

export default function DailyCheckInScreen({ navigation }: DailyCheckInScreenProps) {
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [hasCheckedToday, setHasCheckedToday] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadReputation();
  }, []);

  const loadReputation = async () => {
    try {
      setLoading(true);
      const data = await gamificationApi.getReputation();
      setReputation(data);

      // Check if already checked in today
      if (data.lastCheckIn) {
        const lastCheckIn = new Date(data.lastCheckIn);
        const today = new Date();
        const isToday =
          lastCheckIn.getDate() === today.getDate() &&
          lastCheckIn.getMonth() === today.getMonth() &&
          lastCheckIn.getFullYear() === today.getFullYear();
        setHasCheckedToday(isToday);
      }
    } catch (error) {
      console.error('Error loading reputation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setChecking(true);

      // Animate button
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const result = await gamificationApi.dailyCheckIn();

      Alert.alert(
        '¡Check-In Exitoso! 🎉',
        `¡Racha de ${result.streak} días!\n+${result.pointsEarned} puntos ganados`,
        [
          {
            text: 'Genial',
            onPress: () => {
              setHasCheckedToday(true);
              loadReputation();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo completar el check-in');
    } finally {
      setChecking(false);
    }
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return '¡Comienza tu racha hoy!';
    if (streak === 1) return '¡Primera día! Sigue así';
    if (streak < 7) return `¡${streak} días seguidos! 🔥`;
    if (streak < 30) return `¡${streak} días! ¡Increíble! 🔥🔥`;
    if (streak < 100) return `¡${streak} días! ¡Eres una leyenda! 🔥🔥🔥`;
    return `¡${streak} días! ¡IMPARABLE! 🔥🔥🔥🔥`;
  };

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '🌱';
    if (streak < 7) return '🔥';
    if (streak < 30) return '⚡';
    if (streak < 100) return '💫';
    return '👑';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Check-In Diario</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </View>
    );
  }

  const streak = reputation?.streak || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-In Diario</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Streak Display */}
        <LinearGradient
          colors={[colors.primary[600], colors.primary[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streakCard}
        >
          <Text style={styles.streakEmoji}>{getStreakEmoji(streak)}</Text>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>Días Seguidos</Text>
          <Text style={styles.streakMessage}>{getStreakMessage(streak)}</Text>
        </LinearGradient>

        {/* Calendar Preview (Simple) */}
        <View style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>Últimos 7 días</Text>
          <View style={styles.calendarDays}>
            {[...Array(7)].map((_, index) => {
              const dayIndex = 6 - index;
              const isToday = dayIndex === 0;
              const isChecked = dayIndex < streak;

              return (
                <View
                  key={index}
                  style={[
                    styles.calendarDay,
                    isChecked && styles.calendarDayChecked,
                    isToday && styles.calendarDayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      isChecked && styles.calendarDayTextChecked,
                    ]}
                  >
                    {isToday ? 'Hoy' : `D${dayIndex + 1}`}
                  </Text>
                  {isChecked && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.text.primary}
                      style={styles.checkIcon}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Rewards Info */}
        <View style={styles.rewardsCard}>
          <Text style={styles.rewardsTitle}>Recompensas Diarias</Text>
          <View style={styles.rewardsList}>
            <View style={styles.rewardItem}>
              <Ionicons name="star" size={20} color={colors.warning.main} />
              <Text style={styles.rewardText}>+10 puntos por check-in</Text>
            </View>
            <View style={styles.rewardItem}>
              <Ionicons name="flame" size={20} color={colors.error.main} />
              <Text style={styles.rewardText}>Racha aumenta cada día</Text>
            </View>
            <View style={styles.rewardItem}>
              <Ionicons name="trophy" size={20} color={colors.primary[500]} />
              <Text style={styles.rewardText}>Badges especiales por rachas</Text>
            </View>
          </View>
        </View>

        {/* Check-In Button */}
        <Animated.View style={[styles.checkInButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={styles.checkInButton}
            onPress={handleCheckIn}
            disabled={hasCheckedToday || checking}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                hasCheckedToday
                  ? [colors.text.tertiary, colors.text.tertiary]
                  : [colors.primary[500], colors.primary[600]]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.checkInGradient}
            >
              {checking ? (
                <ActivityIndicator color="#fff" />
              ) : hasCheckedToday ? (
                <>
                  <Ionicons name="checkmark-circle" size={24} color={colors.text.primary} />
                  <Text style={styles.checkInText}>Ya hiciste check-in hoy</Text>
                </>
              ) : (
                <>
                  <Ionicons name="calendar" size={24} color={colors.text.primary} />
                  <Text style={styles.checkInText}>Hacer Check-In</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {hasCheckedToday && (
          <Text style={styles.nextCheckInText}>
            Vuelve mañana para continuar tu racha 🔥
          </Text>
        )}
      </View>
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
    padding: spacing.lg,
  },
  streakCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  streakEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  streakNumber: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  streakLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  streakMessage: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  calendarCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  calendarTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  calendarDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: 40,
    height: 60,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  calendarDayChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: colors.primary[400],
  },
  calendarDayText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  calendarDayTextChecked: {
    color: colors.text.primary,
  },
  checkIcon: {
    marginTop: 4,
  },
  rewardsCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  rewardsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  rewardsList: {
    gap: spacing.md,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rewardText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  checkInButtonContainer: {
    marginBottom: spacing.md,
  },
  checkInButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  checkInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  checkInText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  nextCheckInText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
