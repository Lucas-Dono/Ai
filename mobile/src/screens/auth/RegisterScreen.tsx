/**
 * Pantalla de registro
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAlert } from '../../contexts/AlertContext';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/ui/Logo';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register } = useAuth();
  const { showAlert } = useAlert();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      showAlert('Completa todos los campos', { type: 'warning', duration: 3000 });
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Las contraseñas no coinciden', { type: 'warning', duration: 3000 });
      return;
    }

    if (password.length < 8) {
      showAlert('La contraseña debe tener al menos 8 caracteres', { type: 'warning', duration: 3000 });
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
    } catch (error: any) {
      showAlert(error.message || 'Error al registrarse', { type: 'error', duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Logo size={48} showText textColor="#FFFFFF" style={styles.logo} />
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>
          </View>

          <View style={styles.form}>
            {/* Campo de Nombre */}
            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper,
                nameFocused && styles.inputWrapperFocused
              ]}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={nameFocused ? "#8B5CF6" : "#6B7280"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  placeholderTextColor="#6B7280"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  accessibilityLabel="Campo de nombre completo"
                  accessibilityHint="Ingresa tu nombre completo"
                />
              </View>
            </View>

            {/* Campo de Email */}
            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused
              ]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailFocused ? "#8B5CF6" : "#6B7280"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  accessibilityLabel="Campo de correo electrónico"
                  accessibilityHint="Ingresa tu correo electrónico"
                />
              </View>
            </View>

            {/* Campo de Contraseña */}
            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused
              ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordFocused ? "#8B5CF6" : "#6B7280"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="Contraseña (mín. 8 caracteres)"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  accessibilityLabel="Campo de contraseña"
                  accessibilityHint="Ingresa una contraseña de al menos 8 caracteres"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo de Confirmar Contraseña */}
            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper,
                confirmPasswordFocused && styles.inputWrapperFocused
              ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={confirmPasswordFocused ? "#8B5CF6" : "#6B7280"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#6B7280"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  accessibilityLabel="Campo de confirmar contraseña"
                  accessibilityHint="Confirma tu contraseña"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              accessibilityLabel="Botón de crear cuenta"
              accessibilityRole="button"
              accessibilityState={{ disabled: loading }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Crear Cuenta</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
              accessibilityLabel="Ir a inicio de sesión"
              accessibilityRole="button"
            >
              <Text style={styles.linkText}>
                ¿Ya tienes cuenta? <Text style={styles.linkTextBold}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputWrapper: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputWrapperFocused: {
    borderColor: '#8B5CF6',
    backgroundColor: '#262F3F',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 16,
  },
  inputWithIcon: {
    paddingRight: 40,
  },
  passwordToggle: {
    padding: 8,
    position: 'absolute',
    right: 8,
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    flexDirection: 'row',
    minHeight: 56,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  linkTextBold: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});
