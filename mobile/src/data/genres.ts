/**
 * Archetype Taxonomy Data
 *
 * Defines relational archetypes - the TYPE OF RELATIONSHIP between user and character
 * This replaces media-based genres (anime, movies, etc.) with relationship dynamics
 */

import type { GenreId } from '@circuitpromptai/smart-start-core';

// ============================================================================
// TYPES
// ============================================================================

export interface GenreOption {
  id: GenreId;
  name: string;
  icon: string;
  color: string;
  description: string;
  subgenres?: SubgenreOption[];
}

export interface SubgenreOption {
  id: string;
  name: string;
  description?: string;
}

// ============================================================================
// ARCHETYPES DATA (Relational, not media-based)
// ============================================================================

export const GENRES: GenreOption[] = [
  {
    id: 'romance',
    name: 'Romance',
    icon: '💕',
    color: '#f43f5e',
    description: 'Conexión romántica e íntima',
    subgenres: [
      { id: 'sweet', name: 'Sweet & Caring', description: 'Dulce, cariñoso, protector' },
      { id: 'passionate', name: 'Passionate & Intense', description: 'Apasionado, intenso, ardiente' },
      { id: 'tsundere', name: 'Tsundere', description: 'Frío al inicio, cálido después' },
      { id: 'slow-burn', name: 'Slow Burn', description: 'Amistad que se vuelve romance' },
      { id: 'flirty', name: 'Flirty & Playful', description: 'Juguetón, coqueto, divertido' },
    ],
  },
  {
    id: 'friendship',
    name: 'Amistad',
    icon: '🤝',
    color: '#10b981',
    description: 'Compañía y apoyo mutuo',
    subgenres: [
      { id: 'supportive', name: 'Supportive Listener', description: 'Escucha activa, apoyo emocional' },
      { id: 'adventurous', name: 'Adventurous Companion', description: 'Aventuras juntos, exploración' },
      { id: 'intellectual', name: 'Intellectual Peer', description: 'Debates, conversaciones profundas' },
      { id: 'playful', name: 'Playful Buddy', description: 'Diversión, juegos, risas' },
      { id: 'comfort', name: 'Comfort Friend', description: 'Comodidad, confianza, paz' },
    ],
  },
  {
    id: 'professional',
    name: 'Mentor/Profesional',
    icon: '🎓',
    color: '#8b5cf6',
    description: 'Guía, aprendizaje y crecimiento',
    subgenres: [
      { id: 'wise-teacher', name: 'Wise Teacher', description: 'Enseñanza formal, sabiduría' },
      { id: 'life-coach', name: 'Life Coach', description: 'Motivación, objetivos de vida' },
      { id: 'therapist', name: 'Therapist/Counselor', description: 'Salud mental, sanación' },
      { id: 'spiritual', name: 'Spiritual Guide', description: 'Reflexión filosófica, espiritualidad' },
      { id: 'skill-trainer', name: 'Skill Trainer', description: 'Habilidades específicas, práctica' },
      { id: 'business', name: 'Business Partner', description: 'Trabajo, carrera, productividad' },
    ],
  },
  {
    id: 'roleplay',
    name: 'Roleplay',
    icon: '🎭',
    color: '#ec4899',
    description: 'Narrativa e historia interactiva',
    subgenres: [
      { id: 'fantasy', name: 'Fantasy Adventure', description: 'Medieval, magia, dragones' },
      { id: 'modern', name: 'Modern Drama', description: 'Mundo actual, realista' },
      { id: 'historical', name: 'Historical Setting', description: 'Época histórica, period piece' },
      { id: 'sci-fi', name: 'Sci-Fi Exploration', description: 'Futurista, espacio, tecnología' },
      { id: 'mystery', name: 'Mystery/Thriller', description: 'Misterio, suspenso, detective' },
      { id: 'slice-of-life', name: 'Slice of Life', description: 'Vida cotidiana, momentos simples' },
    ],
  },
  {
    id: 'wellness',
    name: 'Bienestar',
    icon: '🌱',
    color: '#06b6d4',
    description: 'Salud mental y autocuidado',
    subgenres: [
      { id: 'mindfulness', name: 'Mindfulness Coach', description: 'Atención plena, presente' },
      { id: 'therapeutic', name: 'Therapeutic Companion', description: 'Sanación emocional, apoyo' },
      { id: 'motivational', name: 'Motivational Friend', description: 'Inspiración, energía positiva' },
      { id: 'meditation', name: 'Meditation Guide', description: 'Meditación, respiración, calma' },
      { id: 'self-care', name: 'Self-Care Buddy', description: 'Cuidado personal, amor propio' },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getGenreById(id: GenreId): GenreOption | undefined {
  return GENRES.find((g) => g.id === id);
}

export function getSubgenresByGenreId(genreId: GenreId): SubgenreOption[] {
  const genre = getGenreById(genreId);
  return genre?.subgenres || [];
}

export function hasSubgenres(genreId: GenreId): boolean {
  const subgenres = getSubgenresByGenreId(genreId);
  return subgenres.length > 0;
}
