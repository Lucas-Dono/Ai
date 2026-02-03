/**
 * Section Header Component - Visual header for form sections
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

interface SectionHeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  badge?: string;
}

export function SectionHeader({ icon, title, badge }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={colors.primary[400]} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.background.elevated,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary[900] + '33', // 20% opacity
    borderWidth: 1,
    borderColor: colors.primary[500] + '33',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary[400],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
