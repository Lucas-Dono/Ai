/**
 * Randomizers - Sistema de aleatorización con datos JSON
 *
 * Lee datos de JSONs estáticos para generar valores aleatorios realistas
 */

import firstNamesData from '../data/firstNames.json';
import lastNamesData from '../data/lastNames.json';
import locationsData from '../data/locations.json';
import occupationsData from '../data/occupations.json';

// ============================================================================
// TIPOS
// ============================================================================

interface FirstNames {
  male: string[];
  female: string[];
  unisex: string[];
}

interface LastNames {
  surnames: string[];
}

interface Country {
  name: string;
  cities: string[];
}

interface Locations {
  countries: Country[];
}

interface JobCategory {
  name: string;
  jobs: string[];
}

interface Occupations {
  categories: JobCategory[];
}

// ============================================================================
// DATOS CARGADOS
// ============================================================================

const firstNames = firstNamesData as FirstNames;
const lastNames = lastNamesData as LastNames;
const locations = locationsData as Locations;
const occupations = occupationsData as Occupations;

// Flatten occupations para búsqueda más rápida
const allOccupations = occupations.categories.flatMap(cat => cat.jobs);

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Selecciona un elemento aleatorio de un array
 */
function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Selecciona múltiples elementos únicos de un array
 */
function randomMultipleFromArray<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

// ============================================================================
// NOMBRES
// ============================================================================

/**
 * Genera un nombre completo aleatorio (nombre + apellido(s))
 *
 * @param gender - Género para seleccionar nombre apropiado
 * @param lastNameCount - Número de apellidos (1 o 2)
 * @returns Nombre completo, ej: "Sofía González" o "Carlos Martínez López"
 */
export function randomizeName(
  gender?: 'male' | 'female' | 'non-binary' | '',
  lastNameCount: 1 | 2 = 1
): string {
  let firstName: string;

  // Seleccionar nombre según género
  if (gender === 'male') {
    firstName = randomFromArray(firstNames.male);
  } else if (gender === 'female') {
    firstName = randomFromArray(firstNames.female);
  } else {
    // Para non-binary o sin género, incluir todos + unisex
    const allNames = [
      ...firstNames.male,
      ...firstNames.female,
      ...firstNames.unisex,
    ];
    firstName = randomFromArray(allNames);
  }

  // Generar apellidos (1 o 2)
  const surnames = randomMultipleFromArray(lastNames.surnames, lastNameCount);

  return `${firstName} ${surnames.join(' ')}`;
}

/**
 * Genera solo un nombre (sin apellidos)
 */
export function randomizeFirstName(gender?: 'male' | 'female' | 'non-binary' | ''): string {
  if (gender === 'male') {
    return randomFromArray(firstNames.male);
  } else if (gender === 'female') {
    return randomFromArray(firstNames.female);
  } else {
    const allNames = [
      ...firstNames.male,
      ...firstNames.female,
      ...firstNames.unisex,
    ];
    return randomFromArray(allNames);
  }
}

/**
 * Genera apellido(s) aleatorio(s)
 */
export function randomizeLastName(count: 1 | 2 = 1): string {
  const surnames = randomMultipleFromArray(lastNames.surnames, count);
  return surnames.join(' ');
}

// ============================================================================
// EDAD
// ============================================================================

/**
 * Genera una edad aleatoria entre 18 y 70 con distribución sesgada
 *
 * Probabilidad más alta para menores de 40 años (mayoría de usuarios)
 * Distribución aproximada:
 * - 18-25: ~30%
 * - 26-35: ~35%
 * - 36-45: ~20%
 * - 46-60: ~12%
 * - 61-70: ~3%
 *
 * @returns Edad como string, ej: "24"
 */
export function randomizeAge(): string {
  // Usar distribución triangular sesgada hacia edades menores
  const random = Math.random();

  let age: number;

  if (random < 0.30) {
    // 30% probabilidad: 18-25 años
    age = Math.floor(Math.random() * (25 - 18 + 1)) + 18;
  } else if (random < 0.65) {
    // 35% probabilidad: 26-35 años
    age = Math.floor(Math.random() * (35 - 26 + 1)) + 26;
  } else if (random < 0.85) {
    // 20% probabilidad: 36-45 años
    age = Math.floor(Math.random() * (45 - 36 + 1)) + 36;
  } else if (random < 0.97) {
    // 12% probabilidad: 46-60 años
    age = Math.floor(Math.random() * (60 - 46 + 1)) + 46;
  } else {
    // 3% probabilidad: 61-70 años
    age = Math.floor(Math.random() * (70 - 61 + 1)) + 61;
  }

  return age.toString();
}

/**
 * Genera una edad específica dentro de un rango
 */
export function randomizeAgeInRange(min: number, max: number): string {
  const age = Math.floor(Math.random() * (max - min + 1)) + min;
  return age.toString();
}

// ============================================================================
// UBICACIÓN
// ============================================================================

/**
 * Selecciona un país aleatorio
 */
export function randomizeCountry(): Country {
  return randomFromArray(locations.countries);
}

/**
 * Selecciona una ciudad aleatoria de un país aleatorio
 *
 * @returns String formateado, ej: "Santiago, Chile"
 */
export function randomizeOrigin(): string {
  const country = randomFromArray(locations.countries);
  const city = randomFromArray(country.cities);
  return `${city}, ${country.name}`;
}

/**
 * Selecciona una ciudad de un país específico
 */
export function randomizeCityFromCountry(countryName: string): string | null {
  const country = locations.countries.find(c => c.name === countryName);
  if (!country) return null;

  const city = randomFromArray(country.cities);
  return `${city}, ${country.name}`;
}

/**
 * Obtiene todas las ciudades de un país
 */
export function getCitiesForCountry(countryName: string): string[] {
  const country = locations.countries.find(c => c.name === countryName);
  return country ? country.cities : [];
}

/**
 * Obtiene lista de todos los países disponibles
 */
export function getAllCountries(): string[] {
  return locations.countries.map(c => c.name);
}

// ============================================================================
// OCUPACIÓN
// ============================================================================

/**
 * Selecciona una ocupación aleatoria de todas las categorías
 */
export function randomizeOccupation(): string {
  return randomFromArray(allOccupations);
}

/**
 * Selecciona una ocupación de una categoría específica
 */
export function randomizeOccupationFromCategory(categoryName: string): string | null {
  const category = occupations.categories.find(c => c.name === categoryName);
  if (!category) return null;

  return randomFromArray(category.jobs);
}

/**
 * Obtiene todas las categorías de ocupaciones
 */
export function getOccupationCategories(): string[] {
  return occupations.categories.map(c => c.name);
}

/**
 * Obtiene todas las ocupaciones de una categoría
 */
export function getOccupationsForCategory(categoryName: string): string[] {
  const category = occupations.categories.find(c => c.name === categoryName);
  return category ? category.jobs : [];
}

// ============================================================================
// PERSONALIDAD
// ============================================================================

/**
 * Genera un valor aleatorio de personalidad Big Five (30-70 para evitar extremos)
 */
export function randomizePersonalityTrait(): number {
  return Math.floor(Math.random() * (70 - 30 + 1)) + 30;
}

/**
 * Genera todos los rasgos de personalidad Big Five
 */
export function randomizePersonality() {
  return {
    openness: randomizePersonalityTrait(),
    conscientiousness: randomizePersonalityTrait(),
    extraversion: randomizePersonalityTrait(),
    agreeableness: randomizePersonalityTrait(),
    neuroticism: randomizePersonalityTrait(),
  };
}

// ============================================================================
// UTILIDADES DE ESTADÍSTICAS
// ============================================================================

/**
 * Retorna estadísticas sobre los datos disponibles
 */
export function getDataStats() {
  return {
    firstNames: {
      male: firstNames.male.length,
      female: firstNames.female.length,
      unisex: firstNames.unisex.length,
      total: firstNames.male.length + firstNames.female.length + firstNames.unisex.length,
    },
    lastNames: lastNames.surnames.length,
    locations: {
      countries: locations.countries.length,
      totalCities: locations.countries.reduce((sum, c) => sum + c.cities.length, 0),
    },
    occupations: {
      categories: occupations.categories.length,
      totalJobs: allOccupations.length,
    },
  };
}
