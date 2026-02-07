/**
 * Pantalla de perfil de usuario
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { AgentsService, WorldsService } from '../../services/api';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../../theme';

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList>;
};

interface UserStats {
  agentsCount: number;
  worldsCount: number;
  messagesCount: number;
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

// Obtener iniciales
const getInitials = (name: string): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats>({ agentsCount: 0, worldsCount: 0, messagesCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setLoading(true);

      // Cargar agentes del usuario
      const agentsResponse = await AgentsService.list({ limit: 100 });
      const userAgents = Array.isArray(agentsResponse)
        ? agentsResponse.filter((a: any) => a.userId !== null)
        : [];

      // Cargar mundos del usuario
      const worldsResponse: any = await WorldsService.list({ limit: 100 });
      const userWorlds = worldsResponse?.worlds
        ? worldsResponse.worlds.filter((w: any) => !w.isPredefined)
        : [];

      // Calcular mensajes totales
      const totalMessages = userWorlds.reduce((acc: number, world: any) =>
        acc + (world.messageCount || 0), 0
      );

      setStats({
        agentsCount: userAgents.length,
        worldsCount: userWorlds.length,
        messagesCount: totalMessages,
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'Usuario';
  const userInitials = getInitials(userName);
  const gradientColors = generateGradient(userName);
  const userPlan = user?.plan || 'free';

  // Configuración de badge según el plan
  const getPlanConfig = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'ultra':
        return {
          label: 'Ultra',
          icon: 'business' as const,
          color: colors.info.main,
          bgStyle: styles.planBadgeUltra,
          textStyle: styles.planTextUltra,
        };
      case 'premium':
        return {
          label: 'Premium',
          icon: 'star' as const,
          color: colors.warning.main,
          bgStyle: styles.planBadgePremium,
          textStyle: styles.planTextPremium,
        };
      default:
        return {
          label: 'Free',
          icon: 'person' as const,
          color: colors.primary[400],
          bgStyle: null,
          textStyle: null,
        };
    }
  };

  const planConfig = getPlanConfig(userPlan);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={gradients.purple as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Avatar con gradiente e iniciales */}
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{userInitials}</Text>
        </LinearGradient>

        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        {/* Badge del plan */}
        <View style={[styles.planBadge, planConfig.bgStyle]}>
          <Ionicons
            name={planConfig.icon}
            size={14}
            color={planConfig.color}
          />
          <Text style={[styles.planText, planConfig.textStyle]}>
            {planConfig.label}
          </Text>
        </View>
      </LinearGradient>

      {/* Estadísticas */}
      {loading ? (
        <View style={styles.statsLoading}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
        </View>
      ) : (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={24} color={colors.primary[400]} />
            <Text style={styles.statValue}>{stats.agentsCount}</Text>
            <Text style={styles.statLabel}>Compañeros</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="planet" size={24} color={colors.secondary[400]} />
            <Text style={styles.statValue}>{stats.worldsCount}</Text>
            <Text style={styles.statLabel}>Mundos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="chatbubbles" size={24} color={colors.success.main} />
            <Text style={styles.statValue}>{stats.messagesCount}</Text>
            <Text style={styles.statLabel}>Mensajes</Text>
          </View>
        </View>
      )}

      {/* Menú de opciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="settings-outline" size={20} color={colors.primary[400]} />
            </View>
            <Text style={styles.menuItemText}>Configuración</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="people-outline" size={20} color={colors.secondary[400]} />
            </View>
            <Text style={styles.menuItemText}>Mis Compañeros</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Billing')}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="star-outline" size={20} color={colors.warning.main} />
            </View>
            <Text style={styles.menuItemText}>Suscripción</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Achievements')}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="trophy-outline" size={20} color={colors.warning.main} />
            </View>
            <Text style={styles.menuItemText}>Logros</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="podium-outline" size={20} color={colors.primary[500]} />
            </View>
            <Text style={styles.menuItemText}>Clasificación</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('DailyCheckIn')}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="calendar-outline" size={20} color={colors.success.main} />
            </View>
            <Text style={styles.menuItemText}>Check-In Diario</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyStats')}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="bar-chart-outline" size={20} color={colors.info.main} />
            </View>
            <Text style={styles.menuItemText}>Mis Estadísticas</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soporte</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="help-circle-outline" size={20} color={colors.info.main} />
            </View>
            <Text style={styles.menuItemText}>Centro de Ayuda</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="document-text-outline" size={20} color={colors.info.main} />
            </View>
            <Text style={styles.menuItemText}>Términos y Condiciones</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.text.primary} />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Versión 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  headerGradient: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  name: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500] + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  planBadgePremium: {
    backgroundColor: colors.warning.main + '20',
  },
  planBadgeUltra: {
    backgroundColor: colors.info.main + '20',
  },
  planText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[400],
  },
  planTextPremium: {
    color: colors.warning.light,
  },
  planTextUltra: {
    color: colors.info.light,
  },
  statsLoading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
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
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.regular,
  },
  logoutButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.error.main,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logoutButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  version: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
