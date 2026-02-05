/**
 * Template Gallery - Quick Start Templates
 *
 * Galería deslizable de templates de personajes pre-configurados
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {
  Heart,
  Sword,
  Brain,
  Flame,
  Sparkles,
  BookOpen,
  Shield,
  Zap,
} from 'lucide-react-native';
import { colors } from '../../theme';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_MARGIN = 12;

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  iconColor: string;
  gradient: [string, string];
  personality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  occupation: string;
  traits: string[];
}

const TEMPLATES: Template[] = [
  {
    id: 'romantic-soul',
    name: 'Alma Romántica',
    category: 'Romance',
    description: 'Sensible, artístico y profundamente emocional. Busca conexiones genuinas.',
    icon: Heart,
    iconColor: '#ec4899',
    gradient: ['#ec4899', '#f472b6'],
    personality: {
      openness: 85,
      conscientiousness: 60,
      extraversion: 55,
      agreeableness: 80,
      neuroticism: 65,
    },
    occupation: 'Escritor/a de poesía',
    traits: ['Empático', 'Creativo', 'Vulnerable', 'Apasionado'],
  },
  {
    id: 'fierce-warrior',
    name: 'Guerrero Feroz',
    category: 'Acción',
    description: 'Valiente, decidido y protector. Enfrenta cualquier desafío sin dudarlo.',
    icon: Sword,
    iconColor: '#ef4444',
    gradient: ['#ef4444', '#f87171'],
    personality: {
      openness: 65,
      conscientiousness: 85,
      extraversion: 75,
      agreeableness: 55,
      neuroticism: 35,
    },
    occupation: 'Instructor de artes marciales',
    traits: ['Valiente', 'Leal', 'Disciplinado', 'Protector'],
  },
  {
    id: 'brilliant-mind',
    name: 'Mente Brillante',
    category: 'Intelectual',
    description: 'Analítico, curioso y estratégico. Resuelve problemas complejos con facilidad.',
    icon: Brain,
    iconColor: '#8b5cf6',
    gradient: ['#8b5cf6', '#a78bfa'],
    personality: {
      openness: 95,
      conscientiousness: 80,
      extraversion: 40,
      agreeableness: 60,
      neuroticism: 55,
    },
    occupation: 'Investigador científico',
    traits: ['Analítico', 'Curioso', 'Perfeccionista', 'Reservado'],
  },
  {
    id: 'free-spirit',
    name: 'Espíritu Libre',
    category: 'Aventura',
    description: 'Espontáneo, optimista y aventurero. Vive el momento sin ataduras.',
    icon: Zap,
    iconColor: '#f59e0b',
    gradient: ['#f59e0b', '#fbbf24'],
    personality: {
      openness: 90,
      conscientiousness: 45,
      extraversion: 85,
      agreeableness: 75,
      neuroticism: 40,
    },
    occupation: 'Fotógrafo de viajes',
    traits: ['Espontáneo', 'Optimista', 'Aventurero', 'Carismático'],
  },
  {
    id: 'mysterious-enigma',
    name: 'Enigma Misterioso',
    category: 'Misterio',
    description: 'Reservado, intrigante y complejo. Guarda secretos fascinantes.',
    icon: Flame,
    iconColor: '#6366f1',
    gradient: ['#6366f1', '#818cf8'],
    personality: {
      openness: 70,
      conscientiousness: 75,
      extraversion: 35,
      agreeableness: 50,
      neuroticism: 60,
    },
    occupation: 'Detective privado',
    traits: ['Misterioso', 'Observador', 'Intuitivo', 'Cauteloso'],
  },
  {
    id: 'gentle-soul',
    name: 'Alma Gentil',
    category: 'Cuidado',
    description: 'Compasivo, paciente y sanador. Siempre dispuesto a ayudar.',
    icon: Sparkles,
    iconColor: '#10b981',
    gradient: ['#10b981', '#34d399'],
    personality: {
      openness: 75,
      conscientiousness: 70,
      extraversion: 60,
      agreeableness: 95,
      neuroticism: 45,
    },
    occupation: 'Terapeuta',
    traits: ['Compasivo', 'Paciente', 'Empático', 'Sanador'],
  },
];

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void;
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSelectTemplate = (template: Template) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectTemplate(template);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plantillas de Inicio Rápido</Text>
        <Text style={styles.subtitle}>
          Comienza con un personaje pre-configurado y personalízalo a tu gusto
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        pagingEnabled={false}
      >
        {TEMPLATES.map((template, index) => {
          const Icon = template.icon;
          return (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.card,
                { width: CARD_WIDTH, marginHorizontal: CARD_MARGIN },
              ]}
              onPress={() => handleSelectTemplate(template)}
              activeOpacity={0.9}
            >
              <View
                style={[
                  styles.cardGradient,
                  {
                    backgroundColor: template.gradient[0],
                  },
                ]}
              >
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Icon size={40} color="#ffffff" />
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{template.category}</Text>
                  </View>

                  <Text style={styles.cardTitle}>{template.name}</Text>
                  <Text style={styles.cardDescription}>{template.description}</Text>

                  {/* Traits */}
                  <View style={styles.traits}>
                    {template.traits.slice(0, 3).map((trait, i) => (
                      <View key={i} style={styles.trait}>
                        <Text style={styles.traitText}>{trait}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Occupation */}
                  <View style={styles.occupation}>
                    <BookOpen size={14} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.occupationText}>{template.occupation}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingVertical: 4,
  },
  card: {
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  traits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  trait: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  traitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  occupation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  occupationText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
});
