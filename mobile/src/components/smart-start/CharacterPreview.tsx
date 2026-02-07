/**
 * Character Preview Component
 * Shows real-time preview of the character being described
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { User as UserIcon } from 'lucide-react-native';
import {
  Shield,
  Sword,
  Laptop,
  ChefHat,
  Plane,
  BookOpen,
  Smile,
  Zap,
  Heart,
  Frown,
} from 'lucide-react-native';
import { colors } from '../../theme';

interface CharacterPreviewProps {
  description: string;
  avatarUrl?: string | null;
  name?: string;
  age?: number;
  gender?: string;
}

export function CharacterPreview({
  description,
  avatarUrl,
  name,
  age,
  gender,
}: CharacterPreviewProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [description, name, age, gender]);

  // Extract hints from description
  const getCharacterHints = () => {
    const hints: Array<{ icon: any; label: string }> = [];

    if (description.toLowerCase().includes('detective')) hints.push({ icon: Shield, label: 'Detective' });
    if (description.toLowerCase().includes('guerrera') || description.toLowerCase().includes('warrior')) hints.push({ icon: Sword, label: 'Guerrera' });
    if (description.toLowerCase().includes('hacker')) hints.push({ icon: Laptop, label: 'Hacker' });
    if (description.toLowerCase().includes('chef')) hints.push({ icon: ChefHat, label: 'Chef' });
    if (description.toLowerCase().includes('pilot')) hints.push({ icon: Plane, label: 'Piloto' });
    if (description.toLowerCase().includes('profesor') || description.toLowerCase().includes('teacher')) hints.push({ icon: BookOpen, label: 'Profesor' });

    // Personality traits
    if (description.toLowerCase().includes('tímid') || description.toLowerCase().includes('shy')) hints.push({ icon: Smile, label: 'Tímido' });
    if (description.toLowerCase().includes('rebelde') || description.toLowerCase().includes('rebel')) hints.push({ icon: Zap, label: 'Rebelde' });
    if (description.toLowerCase().includes('amable') || description.toLowerCase().includes('kind')) hints.push({ icon: Heart, label: 'Amable' });
    if (description.toLowerCase().includes('cínic') || description.toLowerCase().includes('cynic')) hints.push({ icon: Frown, label: 'Cínico' });

    return hints;
  };

  const hints = getCharacterHints();
  const hasAnyData = name || age || gender || hints.length > 0;

  if (!hasAnyData && !description) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <UserIcon size={40} color={colors.text.tertiary} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          {name ? (
            <Text style={styles.name}>{name}</Text>
          ) : (
            <Text style={styles.namePlaceholder}>Tu personaje...</Text>
          )}

          {(age || gender) && (
            <Text style={styles.details}>
              {age && `${age} años`}
              {age && gender && ' • '}
              {gender}
            </Text>
          )}

          {/* Hints from description */}
          {hints.length > 0 && (
            <View style={styles.hints}>
              {hints.slice(0, 3).map((hint, index) => {
                const Icon = hint.icon;
                return (
                  <View key={index} style={styles.hint}>
                    <Icon size={12} color="#8b5cf6" />
                    <Text style={styles.hintText}>{hint.label}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Description snippet */}
          {description && (
            <Text style={styles.snippet} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 16,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.elevated,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  namePlaceholder: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  details: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  hints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 8,
  },
  hintText: {
    fontSize: 11,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  snippet: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
    lineHeight: 18,
  },
});
