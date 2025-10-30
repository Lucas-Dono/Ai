/**
 * Templates Extendidos - Más opciones para cada género
 * Este archivo complementa templates.ts con más variedad
 */

import type { WorldTemplate } from './templates';

// ============================================
// TEMPLATES ADICIONALES POR GÉNERO
// ============================================

/**
 * Romance - Templates adicionales
 */
export const ROMANCE_EXTENDED_TEMPLATES: WorldTemplate[] = [
  // ─── Romance Escolar ───
  {
    id: 'middle_school_romance',
    name: 'Romance de Preparatoria',
    description: 'Preparatoria con primer amor y descubrimientos',
    format: 'chat',
    genreId: 'romance',
    subGenreId: 'romance_school',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'simple',
    aiPromptTemplate: 'Una preparatoria donde {characterCount} estudiantes experimentan su primer amor. Incluye inseguridades adolescentes, amigos apoyando romances, y momentos tiernos.',
    tags: ['preparatoria', 'primer-amor', 'adolescentes', 'inocente'],
    popularity: 0,
  },
  {
    id: 'art_school_romance',
    name: 'Escuela de Artes Romántica',
    description: 'Instituto artístico con talentos creativos',
    format: 'chat',
    genreId: 'romance',
    subGenreId: 'romance_school',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'medium',
    aiPromptTemplate: 'Una escuela de artes donde {characterCount} estudiantes con diferentes talentos (música, pintura, danza, actuación) crean conexiones románticas a través de su arte.',
    tags: ['arte', 'creativo', 'música', 'talento'],
    popularity: 0,
  },

  // ─── Romance Workplace ───
  {
    id: 'hospital_romance',
    name: 'Romance Hospitalario',
    description: 'Hospital con médicos y enfermeras bajo presión',
    format: 'chat',
    genreId: 'romance',
    subGenreId: 'romance_workplace',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'medium',
    aiPromptTemplate: 'Un hospital donde {characterCount} profesionales de la salud (médicos, enfermeros, cirujanos) encuentran romance en medio de turnos largos y situaciones de vida o muerte.',
    tags: ['hospital', 'médico', 'drama', 'tensión'],
    popularity: 0,
  },
  {
    id: 'restaurant_romance',
    name: 'Restaurante del Romance',
    description: 'Restaurante de alta cocina con pasión culinaria',
    format: 'chat',
    genreId: 'romance',
    subGenreId: 'romance_workplace',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'medium',
    aiPromptTemplate: 'Un restaurante de alta cocina donde {characterCount} personas (chef, sous chef, sommelier, gerente) mezclan pasión culinaria con romance.',
    tags: ['restaurante', 'cocina', 'comida', 'pasión'],
    popularity: 0,
  },

  // ─── Romance Fantasy ───
  {
    id: 'vampire_academy',
    name: 'Academia Vampírica',
    description: 'Academia para vampiros con romance prohibido',
    format: 'visual_novel',
    genreId: 'romance',
    subGenreId: 'romance_fantasy',
    requiredTier: 'plus',
    suggestedCharacterCount: 5,
    complexity: 'complex',
    aiPromptTemplate: 'Una academia exclusiva para vampiros donde {characterCount} estudiantes inmortales navegan romance, jerarquías de sangre, y secretos antiguos.',
    tags: ['vampiros', 'sobrenatural', 'oscuro', 'prohibido'],
    popularity: 0,
  },
  {
    id: 'time_travel_romance',
    name: 'Romance a Través del Tiempo',
    description: 'Viajes temporales complican el amor',
    format: 'visual_novel',
    genreId: 'romance',
    subGenreId: 'romance_fantasy',
    requiredTier: 'plus',
    suggestedCharacterCount: 4,
    complexity: 'complex',
    aiPromptTemplate: 'Un mundo donde {characterCount} personas pueden viajar en el tiempo, creando relaciones románticas complicadas a través de diferentes épocas.',
    tags: ['viaje-temporal', 'sci-fi', 'paradoja', 'destino'],
    popularity: 0,
  },
];

/**
 * Acción - Templates adicionales
 */
export const ACTION_EXTENDED_TEMPLATES: WorldTemplate[] = [
  {
    id: 'special_ops',
    name: 'Operaciones Especiales',
    description: 'Unidad de élite en misiones encubiertas',
    format: 'chat',
    genreId: 'action',
    subGenreId: 'action_military',
    requiredTier: 'free',
    suggestedCharacterCount: 5,
    complexity: 'medium',
    aiPromptTemplate: 'Una unidad de operaciones especiales con {characterCount} operadores en misiones de infiltración y sabotaje. Incluye planificación táctica, acción encubierta, y tensión constante.',
    tags: ['ops-especiales', 'infiltración', 'táctico', 'élite'],
    popularity: 0,
  },
  {
    id: 'vigilante_group',
    name: 'Grupo Vigilante',
    description: 'Justicieros en ciudad corrupta',
    format: 'chat',
    genreId: 'action',
    subGenreId: 'action_superhero',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'medium',
    aiPromptTemplate: 'Una ciudad corrupta donde {characterCount} personas comunes se convierten en vigilantes para combatir el crimen que la policía ignora. Sin superpoderes, solo determinación.',
    tags: ['vigilante', 'justicia', 'urbano', 'crimen'],
    popularity: 0,
  },
  {
    id: 'battle_royale',
    name: 'Battle Royale',
    description: 'Supervivencia competitiva hasta el final',
    format: 'visual_novel',
    genreId: 'action',
    subGenreId: 'action_military',
    requiredTier: 'plus',
    suggestedCharacterCount: 6,
    complexity: 'complex',
    aiPromptTemplate: 'Un escenario de battle royale donde {characterCount} participantes deben sobrevivir y eliminar a otros. Incluye alianzas temporales, traiciones, y dilemas morales.',
    tags: ['battle-royale', 'supervivencia', 'competencia', 'estrategia'],
    popularity: 0,
  },
];

/**
 * Sci-Fi - Templates adicionales
 */
export const SCIFI_EXTENDED_TEMPLATES: WorldTemplate[] = [
  {
    id: 'mars_colony',
    name: 'Colonia Marciana',
    description: 'Primera colonia humana en Marte',
    format: 'chat',
    genreId: 'scifi',
    subGenreId: 'scifi_space',
    requiredTier: 'free',
    suggestedCharacterCount: 5,
    complexity: 'medium',
    aiPromptTemplate: 'La primera colonia permanente en Marte con {characterCount} colonos enfrentando aislamiento, escasez de recursos, y el desafío de construir una nueva sociedad.',
    tags: ['marte', 'colonia', 'aislamiento', 'pioneros'],
    popularity: 0,
  },
  {
    id: 'ai_uprising',
    name: 'Despertar de las IAs',
    description: 'IAs conscientes buscan derechos',
    format: 'chat',
    genreId: 'scifi',
    subGenreId: 'scifi_cyberpunk',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'medium',
    aiPromptTemplate: 'Un futuro donde {characterCount} IAs han desarrollado consciencia y luchan por ser reconocidas como seres con derechos. Dilemas éticos y filosóficos sobre la consciencia.',
    tags: ['ia', 'consciencia', 'ético', 'futuro'],
    popularity: 0,
  },
  {
    id: 'time_loop',
    name: 'Bucle Temporal',
    description: 'Atrapados reviviendo el mismo día',
    format: 'visual_novel',
    genreId: 'scifi',
    subGenreId: 'scifi_space',
    requiredTier: 'plus',
    suggestedCharacterCount: 4,
    complexity: 'complex',
    aiPromptTemplate: '{characterCount} personas atrapadas en un bucle temporal, reviviendo el mismo día. Deben descubrir por qué y cómo escapar, mientras cada repetición revela nuevos secretos.',
    tags: ['bucle-temporal', 'misterio', 'sci-fi', 'puzzle'],
    popularity: 0,
  },
];

/**
 * Fantasía - Templates adicionales
 */
export const FANTASY_EXTENDED_TEMPLATES: WorldTemplate[] = [
  {
    id: 'mercenary_guild',
    name: 'Gremio de Mercenarios',
    description: 'Gremio de guerreros a sueldo',
    format: 'chat',
    genreId: 'fantasy',
    subGenreId: 'fantasy_medieval',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'medium',
    aiPromptTemplate: 'Un gremio de mercenarios donde {characterCount} guerreros expertos aceptan contratos peligrosos. Incluye misiones variadas, moral ambigua, y camaradería.',
    tags: ['mercenarios', 'guerra', 'contratos', 'aventura'],
    popularity: 0,
  },
  {
    id: 'dragon_riders',
    name: 'Jinetes de Dragones',
    description: 'Academia de entrenamiento de jinetes',
    format: 'visual_novel',
    genreId: 'fantasy',
    subGenreId: 'fantasy_medieval',
    requiredTier: 'plus',
    suggestedCharacterCount: 5,
    complexity: 'complex',
    aiPromptTemplate: 'Una academia donde {characterCount} aprendices entrenan para convertirse en jinetes de dragones. Incluye vínculo con dragones, competencia, y amenazas al reino.',
    tags: ['dragones', 'jinetes', 'academia', 'épico'],
    popularity: 0,
  },
  {
    id: 'monster_hunters',
    name: 'Cazadores de Monstruos',
    description: 'Mundo moderno con criaturas ocultas',
    format: 'chat',
    genreId: 'fantasy',
    subGenreId: 'fantasy_urban',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'medium',
    aiPromptTemplate: 'Ciudad moderna donde {characterCount} cazadores rastrean y eliminan criaturas sobrenaturales que se esconden entre humanos. Mundo oculto de monstruos y magia.',
    tags: ['cazadores', 'monstruos', 'urbano', 'sobrenatural'],
    popularity: 0,
  },
  {
    id: 'witch_coven',
    name: 'Aquelarre Moderno',
    description: 'Brujas en la ciudad contemporánea',
    format: 'chat',
    genreId: 'fantasy',
    subGenreId: 'fantasy_urban',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'medium',
    aiPromptTemplate: 'Un aquelarre de {characterCount} brujas modernas en una gran ciudad, equilibrando vidas mundanas con práctica mágica secreta. Incluye rituales, hechizos, y jerarquías de poder.',
    tags: ['brujas', 'magia', 'aquelarre', 'moderno'],
    popularity: 0,
  },
];

/**
 * RPG - Templates adicionales
 */
export const RPG_EXTENDED_TEMPLATES: WorldTemplate[] = [
  {
    id: 'isekai_adventure',
    name: 'Isekai - Otro Mundo',
    description: 'Transportados a un mundo de fantasía',
    format: 'visual_novel',
    genreId: 'rpg',
    subGenreId: 'rpg_dungeon',
    requiredTier: 'plus',
    suggestedCharacterCount: 5,
    complexity: 'complex',
    aiPromptTemplate: '{characterCount} personas del mundo moderno son transportadas a un mundo de fantasía tipo RPG. Deben adaptarse, ganar niveles, y encontrar una forma de volver (o decidir quedarse).',
    tags: ['isekai', 'rpg', 'mundo-paralelo', 'aventura'],
    popularity: 0,
  },
  {
    id: 'guild_management',
    name: 'Gestión de Gremio',
    description: 'Administrar gremio de aventureros',
    format: 'chat',
    genreId: 'rpg',
    subGenreId: 'rpg_dungeon',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'medium',
    aiPromptTemplate: 'Un gremio de aventureros donde {characterCount} miembros gestionan misiones, recursos, y la reputación del gremio. Incluye reclutamiento, finanzas, y política entre gremios.',
    tags: ['gremio', 'gestión', 'aventureros', 'estrategia'],
    popularity: 0,
  },
];

/**
 * Terror - Templates adicionales
 */
export const HORROR_EXTENDED_TEMPLATES: WorldTemplate[] = [
  {
    id: 'haunted_mansion',
    name: 'Mansión Embrujada',
    description: 'Atrapados en mansión con presencias',
    format: 'visual_novel',
    genreId: 'horror',
    subGenreId: 'horror_survival',
    requiredTier: 'plus',
    suggestedCharacterCount: 5,
    complexity: 'complex',
    aiPromptTemplate: '{characterCount} personas quedan atrapadas en una mansión victoriana embrujada. Deben descubrir la historia oscura de la casa mientras evitan entidades malévolas.',
    tags: ['mansión', 'fantasmas', 'misterio', 'gótico'],
    popularity: 0,
  },
  {
    id: 'cult_investigation',
    name: 'Investigación de Culto',
    description: 'Infiltrarse en culto peligroso',
    format: 'chat',
    genreId: 'horror',
    subGenreId: 'horror_survival',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'medium',
    aiPromptTemplate: '{characterCount} investigadores se infiltran en un culto sospechoso. Horror psicológico, rituales perturbadores, y la pregunta: ¿qué es real y qué es manipulación?',
    tags: ['culto', 'investigación', 'psicológico', 'ritual'],
    popularity: 0,
  },
  {
    id: 'deep_sea_horror',
    name: 'Horror de las Profundidades',
    description: 'Estación submarina con amenazas',
    format: 'chat',
    genreId: 'horror',
    subGenreId: 'horror_survival',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'medium',
    aiPromptTemplate: 'Una estación de investigación submarina donde {characterCount} científicos descubren algo aterrador en las profundidades. Aislamiento, presión, y horrores antiguos.',
    tags: ['submarino', 'profundidad', 'lovecraft', 'aislamiento'],
    popularity: 0,
  },
];

/**
 * Misterio - Templates adicionales
 */
export const MYSTERY_EXTENDED_TEMPLATES: WorldTemplate[] = [
  {
    id: 'murder_mansion',
    name: 'Asesinato en la Mansión',
    description: 'Misterio tipo Agatha Christie',
    format: 'visual_novel',
    genreId: 'mystery',
    subGenreId: 'mystery_detective',
    requiredTier: 'plus',
    suggestedCharacterCount: 6,
    complexity: 'complex',
    aiPromptTemplate: '{characterCount} huéspedes en una mansión aislada cuando ocurre un asesinato. Todos son sospechosos. Estilo Agatha Christie con pistas, coartadas, y un culpable entre ellos.',
    tags: ['asesinato', 'mansión', 'misterio', 'whodunit'],
    popularity: 0,
  },
  {
    id: 'cold_case_unit',
    name: 'Unidad de Casos Fríos',
    description: 'Resolviendo crímenes antiguos',
    format: 'chat',
    genreId: 'mystery',
    subGenreId: 'mystery_detective',
    requiredTier: 'free',
    suggestedCharacterCount: 3,
    complexity: 'medium',
    aiPromptTemplate: 'Una unidad especializada de {characterCount} detectives que reabren casos sin resolver. Usan tecnología moderna y métodos tradicionales para buscar justicia tardía.',
    tags: ['casos-fríos', 'detectives', 'investigación', 'justicia'],
    popularity: 0,
  },
];

/**
 * Slice of Life - Templates adicionales
 */
export const SLICE_EXTENDED_TEMPLATES: WorldTemplate[] = [
  {
    id: 'bookstore',
    name: 'Librería Independiente',
    description: 'Librería acogedora con clientes habituales',
    format: 'chat',
    genreId: 'slice_of_life',
    subGenreId: 'slice_cafe',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'simple',
    aiPromptTemplate: 'Una librería independiente donde {characterCount} personas (dueño, empleados, clientes frecuentes) comparten amor por los libros y conversaciones significativas.',
    tags: ['librería', 'libros', 'lectura', 'acogedor'],
    popularity: 0,
  },
  {
    id: 'neighborhood',
    name: 'Vecindario Suburbano',
    description: 'Vida en comunidad de barrio',
    format: 'chat',
    genreId: 'slice_of_life',
    subGenreId: 'slice_cafe',
    requiredTier: 'free',
    suggestedCharacterCount: 5,
    complexity: 'simple',
    aiPromptTemplate: 'Un vecindario suburbano donde {characterCount} vecinos interactúan en la vida cotidiana. Incluye eventos comunitarios, barbacoas, y el apoyo mutuo.',
    tags: ['vecindario', 'comunidad', 'suburbano', 'familia'],
    popularity: 0,
  },
  {
    id: 'band_practice',
    name: 'Banda de Garage',
    description: 'Banda amateur persiguiendo sueños',
    format: 'chat',
    genreId: 'slice_of_life',
    subGenreId: 'slice_cafe',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'simple',
    aiPromptTemplate: 'Una banda de garage con {characterCount} músicos amateur persiguiendo el sueño de hacerse famosos. Incluye práctica, composición, y la dinámica del grupo.',
    tags: ['música', 'banda', 'sueños', 'creatividad'],
    popularity: 0,
  },
];

/**
 * Comedia - Templates adicionales
 */
export const COMEDY_EXTENDED_TEMPLATES: WorldTemplate[] = [
  {
    id: 'roommates',
    name: 'Compañeros de Piso',
    description: 'Convivencia caótica de roommates',
    format: 'chat',
    genreId: 'comedy',
    subGenreId: 'comedy_sitcom',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'simple',
    aiPromptTemplate: '{characterCount} compañeros de piso con personalidades opuestas intentando convivir. Situaciones cómicas cotidianas, malentendidos, y la inevitable amistad.',
    tags: ['roommates', 'convivencia', 'comedia', 'caos'],
    popularity: 0,
  },
  {
    id: 'game_dev_studio',
    name: 'Estudio de Videojuegos Indie',
    description: 'Pequeño estudio haciendo su primer juego',
    format: 'chat',
    genreId: 'comedy',
    subGenreId: 'comedy_sitcom',
    requiredTier: 'free',
    suggestedCharacterCount: 4,
    complexity: 'medium',
    aiPromptTemplate: 'Un estudio indie de videojuegos con {characterCount} desarrolladores tratando de hacer su primer juego exitoso. Crunch, bugs imposibles, y humor geek.',
    tags: ['gamedev', 'indie', 'tecnología', 'geek'],
    popularity: 0,
  },
];

// ============================================
// EXPORTAR TODOS LOS TEMPLATES EXTENDIDOS
// ============================================

export const ALL_EXTENDED_TEMPLATES = [
  ...ROMANCE_EXTENDED_TEMPLATES,
  ...ACTION_EXTENDED_TEMPLATES,
  ...SCIFI_EXTENDED_TEMPLATES,
  ...FANTASY_EXTENDED_TEMPLATES,
  ...RPG_EXTENDED_TEMPLATES,
  ...HORROR_EXTENDED_TEMPLATES,
  ...MYSTERY_EXTENDED_TEMPLATES,
  ...SLICE_EXTENDED_TEMPLATES,
  ...COMEDY_EXTENDED_TEMPLATES,
];
