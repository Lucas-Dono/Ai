/**
 * Navegación por tabs (pestañas) principal de la app con diseño moderno
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabsParamList } from './types';
import { colors } from '../theme';

// Pantallas
import HomeScreen from '../screens/main/HomeScreen';
import WorldsScreen from '../screens/main/WorldsScreen';
import { CommunityFeedScreen } from '../screens/Community';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.border.light,
          borderTopWidth: 1,
          paddingBottom: insets.bottom + 8, // Ajusta al safe area
          paddingTop: 8,
          height: 65 + insets.bottom, // Ajusta altura total
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.background.secondary,
          borderBottomColor: colors.border.light,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          title: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Worlds"
        component={WorldsScreen}
        options={{
          headerShown: false,
          title: 'Mundos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'planet' : 'planet-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityFeedScreen}
        options={{
          headerShown: false,
          title: 'Community',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
