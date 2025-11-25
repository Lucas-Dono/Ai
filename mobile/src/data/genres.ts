/**
 * Genres and Subgenres Data
 *
 * Comprehensive genre taxonomy for Smart Start character creation
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
// GENRES DATA
// ============================================================================

export const GENRES: GenreOption[] = [
  {
    id: 'anime',
    name: 'Anime',
    icon: '🎌',
    color: '#f43f5e',
    description: 'Characters from Japanese animation',
    subgenres: [
      { id: 'shonen', name: 'Shonen', description: 'Action, adventure, friendship' },
      { id: 'shojo', name: 'Shojo', description: 'Romance, drama, slice of life' },
      { id: 'seinen', name: 'Seinen', description: 'Mature, psychological, complex' },
      { id: 'isekai', name: 'Isekai', description: 'Another world, fantasy' },
      { id: 'mecha', name: 'Mecha', description: 'Giant robots, sci-fi' },
      { id: 'slice-of-life', name: 'Slice of Life', description: 'Everyday life, relatable' },
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: '🎮',
    color: '#8b5cf6',
    description: 'Characters from video games',
    subgenres: [
      { id: 'rpg', name: 'RPG', description: 'Role-playing games' },
      { id: 'action', name: 'Action', description: 'Fast-paced combat' },
      { id: 'moba', name: 'MOBA', description: 'Multiplayer online battle arena' },
      { id: 'mmorpg', name: 'MMORPG', description: 'Massively multiplayer online' },
      { id: 'fighting', name: 'Fighting', description: 'Combat-focused games' },
      { id: 'visual-novel', name: 'Visual Novel', description: 'Story-driven games' },
    ],
  },
  {
    id: 'movies',
    name: 'Movies',
    icon: '🎬',
    color: '#eab308',
    description: 'Characters from films',
    subgenres: [
      { id: 'action', name: 'Action', description: 'High-octane, thrilling' },
      { id: 'sci-fi', name: 'Sci-Fi', description: 'Science fiction, futuristic' },
      { id: 'fantasy', name: 'Fantasy', description: 'Magic, mythical worlds' },
      { id: 'horror', name: 'Horror', description: 'Scary, suspenseful' },
      { id: 'comedy', name: 'Comedy', description: 'Funny, light-hearted' },
      { id: 'drama', name: 'Drama', description: 'Emotional, character-driven' },
    ],
  },
  {
    id: 'tv',
    name: 'TV Shows',
    icon: '📺',
    color: '#06b6d4',
    description: 'Characters from television series',
    subgenres: [
      { id: 'drama', name: 'Drama', description: 'Serialized storytelling' },
      { id: 'sitcom', name: 'Sitcom', description: 'Situational comedy' },
      { id: 'crime', name: 'Crime', description: 'Mystery, detective stories' },
      { id: 'supernatural', name: 'Supernatural', description: 'Paranormal, unexplained' },
      { id: 'sci-fi', name: 'Sci-Fi', description: 'Futuristic, space opera' },
      { id: 'reality', name: 'Reality', description: 'Reality TV personalities' },
    ],
  },
  {
    id: 'books',
    name: 'Books',
    icon: '📚',
    color: '#10b981',
    description: 'Characters from literature',
    subgenres: [
      { id: 'fantasy', name: 'Fantasy', description: 'Epic fantasy, magic' },
      { id: 'sci-fi', name: 'Sci-Fi', description: 'Science fiction novels' },
      { id: 'mystery', name: 'Mystery', description: 'Detectives, whodunits' },
      { id: 'romance', name: 'Romance', description: 'Love stories' },
      { id: 'horror', name: 'Horror', description: 'Scary, gothic' },
      { id: 'literary', name: 'Literary', description: 'Classic literature' },
    ],
  },
  {
    id: 'roleplay',
    name: 'Roleplay',
    icon: '🎭',
    color: '#ec4899',
    description: 'Create original roleplay characters',
    subgenres: [
      { id: 'fantasy', name: 'Fantasy', description: 'Medieval, magic, dragons' },
      { id: 'modern', name: 'Modern', description: 'Contemporary setting' },
      { id: 'sci-fi', name: 'Sci-Fi', description: 'Futuristic, space' },
      { id: 'historical', name: 'Historical', description: 'Period settings' },
      { id: 'supernatural', name: 'Supernatural', description: 'Vampires, werewolves, etc' },
      { id: 'slice-of-life', name: 'Slice of Life', description: 'Everyday scenarios' },
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
