import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export default function HelpScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      category: 'Primeros Pasos',
      question: '¿Cómo creo mi primer agente IA?',
      answer: `Crear tu primer agente es muy sencillo:

1. Toca en 'Home' en el menú inferior
2. Selecciona 'Crear Agente'
3. Elige un avatar y personaliza la personalidad
4. Define el nombre y comportamiento inicial
5. ¡Empieza a conversar!

También puedes explorar la galería comunitaria.`,
    },
    {
      category: 'Primeros Pasos',
      question: '¿Cuál es la diferencia entre un agente y un mundo?',
      answer: `• Agente: Es un compañero IA individual con quien puedes conversar 1 a 1.

• Mundo: Es un entorno grupal donde múltiples agentes pueden interactuar entre sí y contigo simultáneamente.`,
    },
    {
      category: 'Agentes IA',
      question: '¿Cómo funcionan las emociones de los agentes?',
      answer: `Nuestro sistema emocional combina dos modelos científicos:

• Modelo OCC: Evalúa eventos, acciones y objetos
• Rueda de Plutchik: Mapea 8 emociones básicas

Las emociones evolucionan naturalmente basándose en el contenido de tus conversaciones.`,
    },
    {
      category: 'Agentes IA',
      question: '¿Qué es la memoria de largo plazo?',
      answer: `La memoria de largo plazo permite que tus agentes:

• Recuerden eventos importantes
• Guarden información sobre personas que mencionas
• Mantengan contexto de relaciones
• Referencien conversaciones antiguas`,
    },
    {
      category: 'Facturación',
      question: '¿Cómo funcionan los límites de mensajes?',
      answer: `Los límites dependen de tu plan:

• Free: 600 mensajes/mes
• Plus: Mensajes ilimitados
• Ultra: Mensajes ilimitados + prioridad

Puedes ver tu uso actual en Configuración > Plan.`,
    },
    {
      category: 'Soporte Técnico',
      question: '¿Mis conversaciones son privadas?',
      answer: `Absolutamente. Tu privacidad es nuestra prioridad:

• Las conversaciones están encriptadas
• Solo tú puedes acceder a tus conversaciones
• No compartimos ni vendemos tus datos
• Los administradores no pueden leer tu contenido`,
    },
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Centro de Ayuda</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar en el centro de ayuda..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity style={styles.quickLinkCard}>
            <View style={styles.quickLinkIcon}>
              <Feather name="book" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.quickLinkTitle}>Guías y Tutoriales</Text>
            <Text style={styles.quickLinkDescription}>
              Aprende a usar todas las características
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickLinkCard}>
            <View style={styles.quickLinkIcon}>
              <Feather name="message-circle" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.quickLinkTitle}>Comunidad</Text>
            <Text style={styles.quickLinkDescription}>
              Conecta con otros usuarios
            </Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={styles.faqTitle}>Preguntas Frecuentes</Text>

        {searchQuery ? (
          // Search results
          <View>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.faqItem}
                  onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <View style={styles.faqHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.faqCategory}>{faq.category}</Text>
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                    </View>
                    <Feather
                      name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#666"
                    />
                  </View>
                  {expandedIndex === index && (
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResults}>
                <Feather name="search" size={48} color="#333" />
                <Text style={styles.noResultsText}>
                  No se encontraron resultados
                </Text>
              </View>
            )}
          </View>
        ) : (
          // Categories
          categories.map((category) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {faqs
                .filter((faq) => faq.category === category)
                .map((faq, index) => {
                  const globalIndex = faqs.indexOf(faq);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.faqItem}
                      onPress={() =>
                        setExpandedIndex(expandedIndex === globalIndex ? null : globalIndex)
                      }
                    >
                      <View style={styles.faqHeader}>
                        <Text style={[styles.faqQuestion, { flex: 1 }]}>{faq.question}</Text>
                        <Feather
                          name={expandedIndex === globalIndex ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color="#666"
                        />
                      </View>
                      {expandedIndex === globalIndex && (
                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
            </View>
          ))
        )}

        {/* Still Need Help */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>¿Aún necesitas ayuda?</Text>
          <Text style={styles.helpText}>
            Si no encontraste la respuesta que buscabas, nuestro equipo está aquí para ayudarte.
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Feather name="mail" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.helpButtonText}>Contactar Soporte</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#fff',
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickLinkCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#8b5cf640',
  },
  quickLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#8b5cf620',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickLinkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  quickLinkDescription: {
    fontSize: 12,
    color: '#666',
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqCategory: {
    fontSize: 12,
    color: '#8b5cf6',
    marginBottom: 4,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
  },
  helpCard: {
    backgroundColor: '#8b5cf620',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b5cf640',
    padding: 16,
    marginTop: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    flexDirection: 'row',
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
