import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MainStackParamList } from '../../navigation/types';
import billingApi, { UsageStats, Subscription, Plan } from '../../services/api/billing.api';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAlert } from '../../contexts/AlertContext';

type BillingScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Billing'>;
};

export default function BillingScreen({ navigation }: BillingScreenProps) {
  const { showAlert } = useAlert();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usageData, subscriptionData, plansData] = await Promise.all([
        billingApi.getUsage(),
        billingApi.getSubscription().catch(() => null),
        billingApi.getPlans(),
      ]);
      setUsage(usageData);
      setSubscription(subscriptionData);
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading billing data:', error);
      showAlert('No se pudo cargar tu información de facturación', {
        type: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: 'plus' | 'ultra') => {
    try {
      setUpgrading(true);
      const { url } = await billingApi.createCheckout(tier, 'month');
      await Linking.openURL(url);
    } catch (error: any) {
      showAlert(error.message || 'No se pudo iniciar el proceso de upgrade', {
        type: 'error',
        duration: 4000,
      });
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await billingApi.getPortalUrl();
      await Linking.openURL(url);
    } catch (error: any) {
      showAlert(error.message || 'No se pudo abrir el portal de gestión', {
        type: 'error',
        duration: 4000,
      });
    }
  };

  const getTierBadge = (tier: string) => {
    const badges = {
      free: { color: colors.text.tertiary, label: 'Free', icon: '🆓' },
      plus: { color: colors.primary[500], label: 'Plus', icon: '⭐' },
      ultra: { color: '#FFD700', label: 'Ultra', icon: '👑' },
    };
    return badges[tier as keyof typeof badges] || badges.free;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Ilimitado
    return Math.min((used / limit) * 100, 100);
  };

  const renderUsageCard = () => {
    if (!usage) return null;

    const tierBadge = getTierBadge(usage.tier);

    return (
      <View style={styles.usageCard}>
        <View style={styles.usageHeader}>
          <View>
            <Text style={styles.usageTitle}>Tu Plan</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierEmoji}>{tierBadge.icon}</Text>
              <Text style={[styles.tierName, { color: tierBadge.color }]}>
                {tierBadge.label}
              </Text>
            </View>
          </View>
          {usage.tier !== 'ultra' && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => handleUpgrade(usage.tier === 'free' ? 'plus' : 'ultra')}
            >
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Usage Metrics */}
        <View style={styles.metricsContainer}>
          {/* Messages */}
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Ionicons name="chatbubbles" size={20} color={colors.primary[500]} />
              <Text style={styles.metricLabel}>Mensajes</Text>
            </View>
            <Text style={styles.metricValue}>
              {usage.messagesLimit === -1
                ? 'Ilimitados'
                : `${usage.messagesUsed} / ${usage.messagesLimit}`}
            </Text>
            {usage.messagesLimit !== -1 && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${getUsagePercentage(usage.messagesUsed, usage.messagesLimit)}%` },
                  ]}
                />
              </View>
            )}
          </View>

          {/* Voice */}
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Ionicons name="mic" size={20} color={colors.primary[500]} />
              <Text style={styles.metricLabel}>Voz</Text>
            </View>
            <Text style={styles.metricValue}>
              {usage.voiceMinutesLimit === 0
                ? 'No disponible'
                : usage.voiceMinutesLimit === -1
                ? 'Ilimitados'
                : `${usage.voiceMinutesUsed} / ${usage.voiceMinutesLimit} min`}
            </Text>
            {usage.voiceMinutesLimit > 0 && usage.voiceMinutesLimit !== -1 && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getUsagePercentage(
                        usage.voiceMinutesUsed,
                        usage.voiceMinutesLimit
                      )}%`,
                    },
                  ]}
                />
              </View>
            )}
          </View>

          {/* Images */}
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Ionicons name="image" size={20} color={colors.primary[500]} />
              <Text style={styles.metricLabel}>Imágenes</Text>
            </View>
            <Text style={styles.metricValue}>
              {usage.imagesLimit === -1
                ? 'Ilimitadas'
                : `${usage.imagesGenerated} / ${usage.imagesLimit}`}
            </Text>
            {usage.imagesLimit !== -1 && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getUsagePercentage(usage.imagesGenerated, usage.imagesLimit)}%`,
                    },
                  ]}
                />
              </View>
            )}
          </View>

          {/* Agents */}
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Ionicons name="people" size={20} color={colors.primary[500]} />
              <Text style={styles.metricLabel}>Agentes</Text>
            </View>
            <Text style={styles.metricValue}>
              {usage.agentsLimit === -1
                ? 'Ilimitados'
                : `${usage.agentsCreated} / ${usage.agentsLimit}`}
            </Text>
            {usage.agentsLimit !== -1 && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${getUsagePercentage(usage.agentsCreated, usage.agentsLimit)}%` },
                  ]}
                />
              </View>
            )}
          </View>
        </View>

        <Text style={styles.resetDate}>
          Se reinicia: {new Date(usage.resetDate).toLocaleDateString('es')}
        </Text>
      </View>
    );
  };

  const renderPlanCard = (plan: Plan) => {
    const tierBadge = getTierBadge(plan.tier);
    const isCurrentPlan = usage?.tier === plan.tier;

    return (
      <View key={plan.id} style={[styles.planCard, plan.isPopular && styles.planCardPopular]}>
        {plan.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Más Popular</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planEmoji}>{tierBadge.icon}</Text>
          <Text style={styles.planName}>{plan.name}</Text>
        </View>

        <View style={styles.planPricing}>
          <Text style={styles.planPrice}>
            ${plan.price}
            <Text style={styles.planCurrency}> USD</Text>
          </Text>
          <Text style={styles.planInterval}>/ mes</Text>
        </View>

        <View style={styles.planFeatures}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {isCurrentPlan ? (
          <View style={styles.currentPlanButton}>
            <Text style={styles.currentPlanText}>Plan Actual</Text>
          </View>
        ) : plan.tier === 'free' ? (
          <View style={styles.freePlanButton}>
            <Text style={styles.freePlanText}>Gratis</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.selectPlanButton}
            onPress={() => handleUpgrade(plan.tier as any)}
            disabled={upgrading}
          >
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.selectPlanGradient}
            >
              {upgrading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.selectPlanText}>Seleccionar</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Suscripción</Text>
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
        <Text style={styles.headerTitle}>Suscripción</Text>
        {subscription && (
          <TouchableOpacity onPress={handleManageSubscription} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderUsageCard()}

        <Text style={styles.sectionTitle}>Planes Disponibles</Text>
        {plans.map(plan => renderPlanCard(plan))}
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
  settingsButton: {
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
  usageCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  usageTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tierEmoji: {
    fontSize: 24,
  },
  tierName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  upgradeButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  upgradeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  metricsContainer: {
    gap: spacing.md,
  },
  metricItem: {
    paddingVertical: spacing.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  metricValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  resetDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  planCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardPopular: {
    borderColor: colors.primary[500],
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary[500],
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  popularText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  planName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  planPricing: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  planPrice: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  planCurrency: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
  },
  planInterval: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  planFeatures: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    flex: 1,
  },
  currentPlanButton: {
    backgroundColor: colors.text.tertiary + '30',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  currentPlanText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  freePlanButton: {
    backgroundColor: colors.background.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  freePlanText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  selectPlanButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  selectPlanGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  selectPlanText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
