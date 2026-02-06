/**
 * Pantalla de bienvenida
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Logo } from '../../components/ui/Logo';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Logo size="xl" showText textColor="#FFFFFF" style={styles.logo} />
        <Text style={styles.subtitle}>
          Crea y personaliza tus propios agentes de IA con personalidades únicas
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.secondaryButtonText}>Crear Cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
    paddingBottom: 24,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
});
