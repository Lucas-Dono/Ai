/**
 * Advanced Personality Tabs
 *
 * Sistema de tabs avanzado para personalidad con:
 * - Big Five Facets (30 dimensiones)
 * - Dark Triad
 * - Attachment Styles
 * - Psychological Needs
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Brain, Flame, Heart, Zap } from 'lucide-react-native';
import { colors } from '../../theme';
import * as Haptics from 'expo-haptics';

// ============================================================================
// TYPES
// ============================================================================

interface BigFiveFacets {
  // Openness (6 facetas)
  imagination: number;
  artisticInterests: number;
  emotionality: number;
  adventurousness: number;
  intellect: number;
  liberalism: number;

  // Conscientiousness (6 facetas)
  selfEfficacy: number;
  orderliness: number;
  dutifulness: number;
  achievementStriving: number;
  selfDiscipline: number;
  cautiousness: number;

  // Extraversion (6 facetas)
  friendliness: number;
  gregariousness: number;
  assertiveness: number;
  activityLevel: number;
  excitementSeeking: number;
  cheerfulness: number;

  // Agreeableness (6 facetas)
  trust: number;
  morality: number;
  altruism: number;
  cooperation: number;
  modesty: number;
  sympathy: number;

  // Neuroticism (6 facetas)
  anxiety: number;
  anger: number;
  depression: number;
  selfConsciousness: number;
  immoderation: number;
  vulnerability: number;
}

interface DarkTriad {
  machiavellianism: number; // Manipulación, cinismo
  narcissism: number; // Grandiosidad, búsqueda de admiración
  psychopathy: number; // Falta de empatía, impulsividad
}

interface AttachmentStyle {
  style: 'secure' | 'anxious' | 'avoidant' | 'fearful-avoidant';
  anxiety: number; // Ansiedad relacional (0-100)
  avoidance: number; // Evitación de intimidad (0-100)
}

interface PsychologicalNeeds {
  connection: number; // Necesidad de conexión social
  autonomy: number; // Necesidad de independencia
  competence: number; // Necesidad de logro
  novelty: number; // Necesidad de estimulación
}

interface AdvancedPersonalityTabsProps {
  facets: Partial<BigFiveFacets>;
  darkTriad: DarkTriad;
  attachment: AttachmentStyle;
  needs: PsychologicalNeeds;
  onFacetsChange: (facets: Partial<BigFiveFacets>) => void;
  onDarkTriadChange: (darkTriad: DarkTriad) => void;
  onAttachmentChange: (attachment: AttachmentStyle) => void;
  onNeedsChange: (needs: PsychologicalNeeds) => void;
}

type TabId = 'facets' | 'darkTriad' | 'attachment' | 'needs';

// ============================================================================
// COMPONENT
// ============================================================================

export function AdvancedPersonalityTabs({
  facets,
  darkTriad,
  attachment,
  needs,
  onFacetsChange,
  onDarkTriadChange,
  onAttachmentChange,
  onNeedsChange,
}: AdvancedPersonalityTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('facets');

  const tabs: Array<{ id: TabId; label: string; icon: any; color: string }> = [
    { id: 'facets', label: 'Facetas', icon: Brain, color: '#8b5cf6' },
    { id: 'darkTriad', label: 'Dark Triad', icon: Flame, color: '#ef4444' },
    { id: 'attachment', label: 'Apego', icon: Heart, color: '#ec4899' },
    { id: 'needs', label: 'Necesidades', icon: Zap, color: '#f59e0b' },
  ];

  const handleTabChange = (tabId: TabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  };

  const handleSliderChange = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isActive && { ...styles.tabActive, borderColor: tab.color },
              ]}
              onPress={() => handleTabChange(tab.id)}
            >
              <Icon
                size={16}
                color={isActive ? tab.color : colors.text.tertiary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive && { ...styles.tabLabelActive, color: tab.color },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'facets' && (
          <FacetsContent
            facets={facets}
            onChange={onFacetsChange}
            onSliderChange={handleSliderChange}
          />
        )}

        {activeTab === 'darkTriad' && (
          <DarkTriadContent
            darkTriad={darkTriad}
            onChange={onDarkTriadChange}
            onSliderChange={handleSliderChange}
          />
        )}

        {activeTab === 'attachment' && (
          <AttachmentContent
            attachment={attachment}
            onChange={onAttachmentChange}
            onSliderChange={handleSliderChange}
          />
        )}

        {activeTab === 'needs' && (
          <NeedsContent
            needs={needs}
            onChange={onNeedsChange}
            onSliderChange={handleSliderChange}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// FACETS CONTENT
// ============================================================================

function FacetsContent({
  facets,
  onChange,
  onSliderChange,
}: {
  facets: Partial<BigFiveFacets>;
  onChange: (f: Partial<BigFiveFacets>) => void;
  onSliderChange: (v: number) => void;
}) {
  const facetGroups = [
    {
      title: 'Apertura',
      facets: [
        { key: 'imagination', label: 'Imaginación', desc: 'Fantasía y creatividad' },
        { key: 'artisticInterests', label: 'Interés Artístico', desc: 'Apreciación estética' },
        { key: 'emotionality', label: 'Emocionalidad', desc: 'Profundidad emocional' },
        { key: 'adventurousness', label: 'Aventurero', desc: 'Disposición a probar cosas nuevas' },
        { key: 'intellect', label: 'Intelecto', desc: 'Curiosidad intelectual' },
        { key: 'liberalism', label: 'Liberalismo', desc: 'Apertura a ideas no convencionales' },
      ],
    },
    {
      title: 'Responsabilidad',
      facets: [
        { key: 'selfEfficacy', label: 'Autoeficacia', desc: 'Confianza en capacidades' },
        { key: 'orderliness', label: 'Orden', desc: 'Necesidad de organización' },
        { key: 'dutifulness', label: 'Sentido del deber', desc: 'Adherencia a obligaciones' },
        { key: 'achievementStriving', label: 'Ambición', desc: 'Impulso por logros' },
        { key: 'selfDiscipline', label: 'Autodisciplina', desc: 'Capacidad de completar tareas' },
        { key: 'cautiousness', label: 'Cautela', desc: 'Tendencia a pensar antes de actuar' },
      ],
    },
    {
      title: 'Extraversión',
      facets: [
        { key: 'friendliness', label: 'Amigabilidad', desc: 'Calidez interpersonal' },
        { key: 'gregariousness', label: 'Gregarismo', desc: 'Preferencia por compañía' },
        { key: 'assertiveness', label: 'Asertividad', desc: 'Capacidad de liderazgo' },
        { key: 'activityLevel', label: 'Nivel de actividad', desc: 'Energía y dinamismo' },
        { key: 'excitementSeeking', label: 'Búsqueda de emoción', desc: 'Necesidad de estimulación' },
        { key: 'cheerfulness', label: 'Alegría', desc: 'Tendencia a experiencias positivas' },
      ],
    },
    {
      title: 'Amabilidad',
      facets: [
        { key: 'trust', label: 'Confianza', desc: 'Fe en intenciones ajenas' },
        { key: 'morality', label: 'Moralidad', desc: 'Sinceridad y franqueza' },
        { key: 'altruism', label: 'Altruismo', desc: 'Preocupación por otros' },
        { key: 'cooperation', label: 'Cooperación', desc: 'Preferencia por armonía' },
        { key: 'modesty', label: 'Modestia', desc: 'Humildad' },
        { key: 'sympathy', label: 'Simpatía', desc: 'Compasión y empatía' },
      ],
    },
    {
      title: 'Neuroticismo',
      facets: [
        { key: 'anxiety', label: 'Ansiedad', desc: 'Tendencia a preocupación' },
        { key: 'anger', label: 'Ira', desc: 'Propensión al enojo' },
        { key: 'depression', label: 'Depresión', desc: 'Tendencia a tristeza' },
        { key: 'selfConsciousness', label: 'Autoconciencia', desc: 'Timidez y vergüenza' },
        { key: 'immoderation', label: 'Inmoderación', desc: 'Dificultad con autocontrol' },
        { key: 'vulnerability', label: 'Vulnerabilidad', desc: 'Susceptibilidad al estrés' },
      ],
    },
  ];

  return (
    <View style={styles.content}>
      <Text style={styles.contentTitle}>Facetas del Big Five</Text>
      <Text style={styles.contentSubtitle}>
        30 sub-dimensiones que definen la personalidad con mayor detalle
      </Text>

      {facetGroups.map((group, groupIndex) => (
        <View key={groupIndex} style={styles.facetGroup}>
          <Text style={styles.facetGroupTitle}>{group.title}</Text>

          {group.facets.map((facet) => {
            const value = (facets as any)[facet.key] || 50;
            return (
              <View key={facet.key} style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <View>
                    <Text style={styles.sliderLabel}>{facet.label}</Text>
                    <Text style={styles.sliderDesc}>{facet.desc}</Text>
                  </View>
                  <Text style={styles.sliderValue}>{value}%</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={value}
                  onValueChange={(v) => {
                    onChange({ ...facets, [facet.key]: Math.round(v) });
                    onSliderChange(v);
                  }}
                  minimumTrackTintColor="#8b5cf6"
                  maximumTrackTintColor={colors.border.light}
                  thumbTintColor="#8b5cf6"
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// DARK TRIAD CONTENT
// ============================================================================

function DarkTriadContent({
  darkTriad,
  onChange,
  onSliderChange,
}: {
  darkTriad: DarkTriad;
  onChange: (d: DarkTriad) => void;
  onSliderChange: (v: number) => void;
}) {
  const traits = [
    {
      key: 'machiavellianism',
      label: 'Maquiavelismo',
      desc: 'Manipulación estratégica, cinismo, pragmatismo',
      interpretation: (v: number) =>
        v < 30
          ? 'Honesto y directo'
          : v < 60
          ? 'Ocasionalmente estratégico'
          : v < 80
          ? 'Altamente manipulador'
          : 'Maquiavélico extremo',
    },
    {
      key: 'narcissism',
      label: 'Narcisismo',
      desc: 'Grandiosidad, búsqueda de admiración, sentido de especial',
      interpretation: (v: number) =>
        v < 30
          ? 'Modesto y realista'
          : v < 60
          ? 'Confianza saludable'
          : v < 80
          ? 'Ego inflado'
          : 'Narcisista patológico',
    },
    {
      key: 'psychopathy',
      label: 'Psicopatía',
      desc: 'Falta de empatía, impulsividad, búsqueda de sensaciones',
      interpretation: (v: number) =>
        v < 30
          ? 'Empático y considerado'
          : v < 60
          ? 'Ocasionalmente desapegado'
          : v < 80
          ? 'Emocionalmente frío'
          : 'Psicopático',
    },
  ];

  return (
    <View style={styles.content}>
      <Text style={styles.contentTitle}>Dark Triad</Text>
      <Text style={styles.contentSubtitle}>
        Rasgos de personalidad oscuros que añaden profundidad y complejidad
      </Text>

      <View style={styles.warningBox}>
        <Flame size={16} color="#f59e0b" />
        <Text style={styles.warningText}>
          Estos rasgos crean personajes más complejos y realistas. Valores altos pueden resultar en comportamientos moralmente ambiguos.
        </Text>
      </View>

      {traits.map((trait) => {
        const value = darkTriad[trait.key as keyof DarkTriad];
        return (
          <View key={trait.key} style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sliderLabel}>{trait.label}</Text>
                <Text style={styles.sliderDesc}>{trait.desc}</Text>
                <Text style={styles.interpretation}>
                  {trait.interpretation(value)}
                </Text>
              </View>
              <Text style={styles.sliderValue}>{value}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={value}
              onValueChange={(v) => {
                onChange({ ...darkTriad, [trait.key]: Math.round(v) });
                onSliderChange(v);
              }}
              minimumTrackTintColor="#ef4444"
              maximumTrackTintColor={colors.border.light}
              thumbTintColor="#ef4444"
            />
          </View>
        );
      })}
    </View>
  );
}

// ============================================================================
// ATTACHMENT CONTENT
// ============================================================================

function AttachmentContent({
  attachment,
  onChange,
  onSliderChange,
}: {
  attachment: AttachmentStyle;
  onChange: (a: AttachmentStyle) => void;
  onSliderChange: (v: number) => void;
}) {
  const styles_attachment = [
    {
      id: 'secure',
      label: 'Seguro',
      desc: 'Relaciones estables, confianza, independencia saludable',
    },
    {
      id: 'anxious',
      label: 'Ansioso',
      desc: 'Miedo al abandono, necesidad de cercanía constante',
    },
    {
      id: 'avoidant',
      label: 'Evitativo',
      desc: 'Independencia extrema, dificultad con intimidad',
    },
    {
      id: 'fearful-avoidant',
      label: 'Temeroso-Evitativo',
      desc: 'Deseo y temor de intimidad simultáneamente',
    },
  ];

  return (
    <View style={styles.content}>
      <Text style={styles.contentTitle}>Estilo de Apego</Text>
      <Text style={styles.contentSubtitle}>
        Cómo el personaje forma y mantiene vínculos emocionales
      </Text>

      {/* Style Selector */}
      <View style={styles.styleGrid}>
        {styles_attachment.map((style) => {
          const isActive = attachment.style === style.id;
          return (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleCard,
                isActive && styles.styleCardActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onChange({ ...attachment, style: style.id as any });
              }}
            >
              <Text style={[styles.styleLabel, isActive && styles.styleLabelActive]}>
                {style.label}
              </Text>
              <Text style={[styles.styleDesc, isActive && styles.styleDescActive]}>
                {style.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dimensions */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>Ansiedad Relacional</Text>
          <Text style={styles.sliderValue}>{attachment.anxiety}%</Text>
        </View>
        <Text style={styles.sliderDesc}>
          Miedo al abandono y necesidad de cercanía constante
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={attachment.anxiety}
          onValueChange={(v) => {
            onChange({ ...attachment, anxiety: Math.round(v) });
            onSliderChange(v);
          }}
          minimumTrackTintColor="#ec4899"
          maximumTrackTintColor={colors.border.light}
          thumbTintColor="#ec4899"
        />
      </View>

      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>Evitación de Intimidad</Text>
          <Text style={styles.sliderValue}>{attachment.avoidance}%</Text>
        </View>
        <Text style={styles.sliderDesc}>
          Incomodidad con cercanía emocional y vulnerabilidad
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={attachment.avoidance}
          onValueChange={(v) => {
            onChange({ ...attachment, avoidance: Math.round(v) });
            onSliderChange(v);
          }}
          minimumTrackTintColor="#ec4899"
          maximumTrackTintColor={colors.border.light}
          thumbTintColor="#ec4899"
        />
      </View>
    </View>
  );
}

// ============================================================================
// NEEDS CONTENT
// ============================================================================

function NeedsContent({
  needs,
  onChange,
  onSliderChange,
}: {
  needs: PsychologicalNeeds;
  onChange: (n: PsychologicalNeeds) => void;
  onSliderChange: (v: number) => void;
}) {
  const needsList = [
    {
      key: 'connection',
      label: 'Conexión Social',
      desc: 'Necesidad de relaciones cercanas y pertenencia',
      icon: Heart,
      color: '#ec4899',
    },
    {
      key: 'autonomy',
      label: 'Autonomía',
      desc: 'Necesidad de independencia y autodirigirse',
      icon: Zap,
      color: '#f59e0b',
    },
    {
      key: 'competence',
      label: 'Competencia',
      desc: 'Necesidad de sentirse capaz y efectivo',
      icon: Brain,
      color: '#8b5cf6',
    },
    {
      key: 'novelty',
      label: 'Novedad',
      desc: 'Necesidad de estimulación y experiencias nuevas',
      icon: Flame,
      color: '#ef4444',
    },
  ];

  return (
    <View style={styles.content}>
      <Text style={styles.contentTitle}>Necesidades Psicológicas</Text>
      <Text style={styles.contentSubtitle}>
        Motivaciones fundamentales que impulsan el comportamiento
      </Text>

      {needsList.map((need) => {
        const Icon = need.icon;
        const value = Math.round((needs[need.key as keyof PsychologicalNeeds] || 0.5) * 100);
        return (
          <View key={need.key} style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Icon size={20} color={need.color} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sliderLabel}>{need.label}</Text>
                  <Text style={styles.sliderDesc}>{need.desc}</Text>
                </View>
              </View>
              <Text style={[styles.sliderValue, { color: need.color }]}>{value}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={value}
              onValueChange={(v) => {
                onChange({
                  ...needs,
                  [need.key]: Math.round(v) / 100,
                });
                onSliderChange(v);
              }}
              minimumTrackTintColor={need.color}
              maximumTrackTintColor={colors.border.light}
              thumbTintColor={need.color}
            />
          </View>
        );
      })}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.background.elevated,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  contentSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#f59e0b',
    lineHeight: 18,
  },
  facetGroup: {
    marginBottom: 32,
  },
  facetGroupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  sliderDesc: {
    fontSize: 12,
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  interpretation: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '600',
    marginTop: 4,
  },
  styleGrid: {
    gap: 12,
    marginBottom: 24,
  },
  styleCard: {
    padding: 16,
    backgroundColor: colors.background.elevated,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: 12,
  },
  styleCardActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: '#ec4899',
  },
  styleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  styleLabelActive: {
    color: '#ec4899',
    fontWeight: '700',
  },
  styleDesc: {
    fontSize: 13,
    color: colors.text.tertiary,
    lineHeight: 18,
  },
  styleDescActive: {
    color: colors.text.secondary,
  },
});
