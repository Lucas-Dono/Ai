/**
 * Randomizers - Funciones de aleatorización para campos de personaje
 */

// Nombres comunes en español
const FIRST_NAMES_MALE = [
  'Alejandro', 'Carlos', 'Diego', 'Fernando', 'Gabriel', 'Hugo', 'Javier',
  'Leonardo', 'Miguel', 'Nicolás', 'Pablo', 'Rafael', 'Santiago', 'Tomás',
  'Vicente', 'Daniel', 'Mateo', 'Lucas', 'Sebastián', 'Andrés',
];

const FIRST_NAMES_FEMALE = [
  'Alejandra', 'Carolina', 'Diana', 'Fernanda', 'Gabriela', 'Isabel', 'Javiera',
  'Laura', 'María', 'Natalia', 'Paula', 'Raquel', 'Sofía', 'Valentina',
  'Victoria', 'Daniela', 'Martina', 'Luna', 'Emma', 'Andrea',
];

const LAST_NAMES = [
  'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez',
  'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales',
  'Reyes', 'Gutiérrez', 'Ortiz', 'Mendoza', 'Silva', 'Castro', 'Romero',
];

// Lugares de origen
const ORIGINS = [
  'Buenos Aires, Argentina',
  'Santiago, Chile',
  'Bogotá, Colombia',
  'Ciudad de México, México',
  'Lima, Perú',
  'Madrid, España',
  'Barcelona, España',
  'Montevideo, Uruguay',
  'Caracas, Venezuela',
  'San José, Costa Rica',
  'Quito, Ecuador',
  'Asunción, Paraguay',
  'La Paz, Bolivia',
  'Santo Domingo, República Dominicana',
  'San Juan, Puerto Rico',
  'Panamá, Panamá',
];

// Ocupaciones
const OCCUPATIONS = [
  'Desarrollador/a de Software',
  'Diseñador/a Gráfico',
  'Profesor/a de Historia',
  'Médico/a General',
  'Arquitecto/a',
  'Chef',
  'Periodista',
  'Abogado/a',
  'Ingeniero/a Civil',
  'Psicólogo/a',
  'Fotógrafo/a',
  'Músico/a',
  'Escritor/a',
  'Contador/a',
  'Enfermero/a',
  'Artista Visual',
  'Community Manager',
  'Vendedor/a',
  'Emprendedor/a',
  'Estudiante Universitario',
];

/**
 * Genera un nombre aleatorio basado en género
 */
export function randomizeName(gender?: 'male' | 'female' | 'non-binary' | ''): string {
  let firstName: string;

  if (gender === 'male') {
    firstName = FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)];
  } else if (gender === 'female') {
    firstName = FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)];
  } else {
    // Para non-binary o sin género, elegir aleatoriamente
    const allNames = [...FIRST_NAMES_MALE, ...FIRST_NAMES_FEMALE];
    firstName = allNames[Math.floor(Math.random() * allNames.length)];
  }

  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

  return `${firstName} ${lastName}`;
}

/**
 * Genera una edad aleatoria entre 18 y 65
 */
export function randomizeAge(): string {
  const age = Math.floor(Math.random() * (65 - 18 + 1)) + 18;
  return age.toString();
}

/**
 * Selecciona un origen aleatorio
 */
export function randomizeOrigin(): string {
  return ORIGINS[Math.floor(Math.random() * ORIGINS.length)];
}

/**
 * Selecciona una ocupación aleatoria
 */
export function randomizeOccupation(): string {
  return OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];
}

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
