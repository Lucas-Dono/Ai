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

export default function PrivacyScreen() {
  const navigation = useNavigation();

  const sections = [
    {
      icon: 'database',
      title: 'Información que Recopilamos',
      content: `Recopilamos diferentes tipos de información:

Información de cuenta:
• Nombre y dirección de correo electrónico
• Información de perfil opcional (foto, preferencias)
• Método de pago (procesado de forma segura por terceros)

Datos de uso:
• Conversaciones con tus agentes IA
• Agentes y mundos que creas
• Métricas de uso de la plataforma
• Interacciones con la comunidad`,
    },
    {
      icon: 'eye',
      title: 'Cómo Utilizamos tu Información',
      content: `Utilizamos tus datos para:

Operación del servicio:
• Proporcionar y mantener la plataforma
• Procesar tus conversaciones con agentes IA
• Gestionar tu cuenta y suscripción
• Proporcionar soporte al cliente

Mejora de la plataforma:
• Analizar patrones de uso
• Desarrollar nuevas funcionalidades
• Entrenar y mejorar nuestros modelos de IA (solo con datos anónimos)`,
    },
    {
      icon: 'lock',
      title: 'Seguridad de tus Datos',
      content: `Implementamos medidas de seguridad robustas:

• Encriptación de datos en tránsito y en reposo
• Autenticación segura con tokens JWT
• Acceso restringido a datos personales
• Auditorías de seguridad regulares
• Respaldo automático de datos

Importante:
• Tus conversaciones son privadas
• Los administradores no pueden acceder a tu contenido
• Puedes exportar o eliminar tus datos en cualquier momento`,
    },
    {
      icon: 'shield',
      title: 'Tus Derechos (GDPR & CCPA)',
      content: `Tienes derecho a:

• Acceso: Solicitar una copia de todos tus datos personales
• Rectificación: Corregir información inexacta
• Eliminación: Solicitar la eliminación de tu cuenta y datos
• Portabilidad: Exportar tus datos en formato JSON
• No venta: No vendemos tus datos personales a terceros

Para ejercer estos derechos, contacta a privacy@creadorinteligencias.com`,
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
        <Text style={styles.headerTitle}>Política de Privacidad</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Compromiso con tu Privacidad</Text>
          <Text style={styles.introText}>
            En Blaniel, tu privacidad es nuestra prioridad. Esta
            política explica qué información recopilamos, cómo la utilizamos y tus
            derechos respecto a tus datos personales.
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
          <Text style={styles.contactTitle}>¿Preguntas sobre privacidad?</Text>
          <Text style={styles.contactText}>
            Si tienes alguna pregunta sobre nuestra política de privacidad o el manejo
            de tus datos, contáctanos.
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
