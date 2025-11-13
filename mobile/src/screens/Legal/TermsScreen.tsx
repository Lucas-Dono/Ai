import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

export default function TermsScreen() {
  const navigation = useNavigation();

  const sections = [
    {
      icon: 'file-text',
      title: 'Aceptación de Términos',
      content: `Al crear una cuenta y utilizar Circuit Prompt AI, confirmas que:

• Tienes al menos 18 años de edad o cuentas con el consentimiento de un tutor legal
• Has leído y comprendes estos términos de servicio
• Aceptas cumplir con todas las políticas y directrices de la plataforma
• Proporcionas información veraz y precisa durante el registro`,
    },
    {
      icon: 'users',
      title: 'Cuentas de Usuario',
      content: `Tu cuenta es personal e intransferible. Eres responsable de:

• Mantener la confidencialidad de tus credenciales de acceso
• Todas las actividades que ocurran bajo tu cuenta
• Notificar inmediatamente cualquier uso no autorizado
• No compartir tu cuenta con terceros

Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos.`,
    },
    {
      icon: 'shield',
      title: 'Uso Aceptable',
      content: `Al utilizar nuestra plataforma, te comprometes a:

• No utilizar el servicio para actividades ilegales o no autorizadas
• No intentar acceder a sistemas o datos sin autorización
• No acosar, abusar o dañar a otros usuarios
• No crear contenido que viole derechos de propiedad intelectual
• Respetar los límites de uso según tu plan de suscripción
• No intentar eludir medidas de seguridad o restricciones técnicas`,
    },
    {
      icon: 'alert-triangle',
      title: 'Política de Contenido',
      content: `El contenido generado por los usuarios debe cumplir con nuestras directrices comunitarias y las leyes aplicables.

Nos reservamos el derecho de revisar, moderar o eliminar contenido inapropiado, incluyendo:

• Contenido que promueva violencia, odio o discriminación
• Material que infrinja derechos de autor o marcas registradas
• Spam, phishing o contenido malicioso
• Información personal o sensible de terceros sin consentimiento`,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Términos y Condiciones</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Introducción</Text>
          <Text style={styles.introText}>
            Bienvenido a Circuit Prompt AI. Al acceder y utilizar nuestra
            plataforma, aceptas estar sujeto a estos términos y condiciones. Por
            favor, léelos cuidadosamente antes de usar nuestros servicios.
          </Text>
          <Text style={styles.lastUpdated}>Última actualización: 1 de Enero, 2025</Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Feather name={section.icon as any} size={20} color="#8b5cf6" />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>¿Preguntas sobre los términos?</Text>
          <Text style={styles.contactText}>
            Si tienes alguna pregunta sobre estos términos y condiciones, no dudes en
            contactarnos.
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contactar Soporte</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  introCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  introText: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#8b5cf620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  sectionContent: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#8b5cf620',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b5cf640',
    padding: 16,
    marginTop: 8,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
