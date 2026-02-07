/**
 * SAFETY RESOURCES
 *
 * Recursos de salud mental, líneas de crisis, y contenido educativo
 * para proveer cuando se detecta contenido intenso o perturbador.
 */

import { BehaviorType } from "@prisma/client";

export interface MentalHealthResource {
  behaviorType: BehaviorType;
  title: string;
  description: string;
  url: string;
  helplineNumber?: string;
}

/**
 * Recursos de salud mental por behavior type
 */
export const SAFETY_RESOURCES: MentalHealthResource[] = [
  {
    behaviorType: "YANDERE_OBSESSIVE",
    title: "Celos y Amor Obsesivo",
    description:
      "Los celos intensos y comportamientos controladores son señales de relaciones no saludables. Si experimentas o perpetúas estos patrones, busca ayuda profesional.",
    url: "https://www.helpguide.org/articles/relationships-communication/dealing-with-jealousy-and-insecurity.htm",
  },

  {
    behaviorType: "BORDERLINE_PD",
    title: "Trastorno Límite de Personalidad (BPD)",
    description:
      "BPD es un trastorno real y tratable. La terapia DBT (Dialectical Behavior Therapy) ha demostrado alta efectividad.",
    url: "https://www.nami.org/About-Mental-Illness/Mental-Health-Conditions/Borderline-Personality-Disorder",
    helplineNumber: "NAMI Helpline: 1-800-950-NAMI (6264)",
  },

  {
    behaviorType: "NARCISSISTIC_PD",
    title: "Trastorno Narcisista de Personalidad (NPD)",
    description:
      "NPD afecta relaciones interpersonales. La terapia puede ayudar a desarrollar empatía y relaciones más saludables.",
    url: "https://www.mayoclinic.org/diseases-conditions/narcissistic-personality-disorder/symptoms-causes/syc-20366662",
  },

  {
    behaviorType: "ANXIOUS_ATTACHMENT",
    title: "Apego Ansioso",
    description:
      "El apego ansioso puede causar estrés en relaciones. La terapia de apego y auto-conocimiento pueden ayudar.",
    url: "https://www.attachmentproject.com/blog/anxious-attachment/",
  },

  {
    behaviorType: "AVOIDANT_ATTACHMENT",
    title: "Apego Evitativo",
    description:
      "El apego evitativo dificulta la intimidad emocional. La terapia puede ayudar a desarrollar conexiones más seguras.",
    url: "https://www.attachmentproject.com/blog/avoidant-attachment/",
  },

  {
    behaviorType: "DISORGANIZED_ATTACHMENT",
    title: "Apego Desorganizado",
    description:
      "El apego desorganizado a menudo resulta de trauma temprano. La terapia especializada en trauma puede ayudar.",
    url: "https://www.attachmentproject.com/blog/disorganized-attachment/",
  },

  {
    behaviorType: "CODEPENDENCY",
    title: "Codependencia",
    description:
      "La codependencia puede llevar a relaciones no saludables. Los grupos de apoyo y terapia son efectivos.",
    url: "https://www.psychologytoday.com/us/basics/codependency",
  },

  {
    behaviorType: "PTSD_TRAUMA",
    title: "PTSD y Trauma",
    description:
      "PTSD es tratable con terapias especializadas como EMDR y CPT. No tienes que sufrir en silencio.",
    url: "https://www.ptsd.va.gov/",
    helplineNumber: "Crisis Text Line: Text HOME to 741741",
  },

  {
    behaviorType: "CRISIS_BREAKDOWN",
    title: "Crisis Emocional",
    description:
      "Si estás en crisis emocional, busca ayuda inmediatamente. Hablar con alguien puede salvar tu vida.",
    url: "https://www.crisistextline.org/",
    helplineNumber: "Crisis Text Line: Text HOME to 741741 | Suicide Hotline: 988",
  },

  // Default para otros behaviors
  {
    behaviorType: "OCD_PATTERNS",
    title: "Patrones Obsesivo-Compulsivos",
    description: "OCD es tratable con terapia cognitivo-conductual (CBT) especializada.",
    url: "https://iocdf.org/",
  },

  {
    behaviorType: "HYPERSEXUALITY",
    title: "Hipersexualidad",
    description:
      "La hipersexualidad puede ser síntoma de otros problemas. Un terapeuta especializado puede ayudar.",
    url: "https://www.psychologytoday.com/us/therapists",
  },

  {
    behaviorType: "HYPOSEXUALITY",
    title: "Hiposexualidad",
    description:
      "La baja libido tiene múltiples causas. Consulta con profesional de salud mental o médico.",
    url: "https://www.psychologytoday.com/us/therapists",
  },

  {
    behaviorType: "EMOTIONAL_MANIPULATION",
    title: "Manipulación Emocional",
    description:
      "La manipulación emocional es una forma de abuso. Si la experimentas, busca apoyo.",
    url: "https://www.thehotline.org/",
    helplineNumber: "National Domestic Violence Hotline: 1-800-799-7233",
  },
];

/**
 * Recursos de crisis por país/región
 */
export const CRISIS_HELPLINES: Record<
  string,
  { country: string; name: string; number: string; url?: string }[]
> = {
  US: [
    {
      country: "United States",
      name: "988 Suicide & Crisis Lifeline",
      number: "988",
      url: "https://988lifeline.org/",
    },
    {
      country: "United States",
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      url: "https://www.crisistextline.org/",
    },
    {
      country: "United States",
      name: "National Domestic Violence Hotline",
      number: "1-800-799-7233",
      url: "https://www.thehotline.org/",
    },
  ],

  INTERNATIONAL: [
    {
      country: "International",
      name: "Crisis Text Line (International)",
      number: "Check website for country-specific numbers",
      url: "https://www.crisistextline.org/international/",
    },
    {
      country: "International",
      name: "Befrienders Worldwide",
      number: "Check website",
      url: "https://www.befrienders.org/",
    },
  ],

  // Agregar más países según necesidad
  LATAM: [
    {
      country: "Argentina",
      name: "Centro de Asistencia al Suicida",
      number: "135 (CABA) | (011) 5275-1135",
      url: "https://www.casbuenosaires.com.ar/",
    },
    {
      country: "México",
      name: "Línea de la Vida",
      number: "800-911-2000",
      url: "https://www.gob.mx/salud",
    },
    {
      country: "España",
      name: "Teléfono de la Esperanza",
      number: "717 003 717",
      url: "https://www.telefonodelaesperanza.org/",
    },
  ],
};

/**
 * Obtiene resource apropiado para behavior type
 */
export function getMentalHealthResource(
  behaviorType: BehaviorType
): MentalHealthResource | null {
  return (
    SAFETY_RESOURCES.find((r) => r.behaviorType === behaviorType) || null
  );
}

/**
 * Obtiene helplines de crisis para región
 */
export function getCrisisHelplines(region: "US" | "INTERNATIONAL" | "LATAM" = "US") {
  return CRISIS_HELPLINES[region] || CRISIS_HELPLINES.INTERNATIONAL;
}

/**
 * Genera mensaje de safety con recursos
 */
export function generateSafetyMessage(
  behaviorType: BehaviorType,
  severity: "WARNING" | "CRITICAL" | "EXTREME_DANGER",
  includeHelplines: boolean = false
): string {
  const resource = getMentalHealthResource(behaviorType);

  let message = "";

  if (severity === "WARNING") {
    message = "ℹ️ Nota de Seguridad\n\n";
  } else if (severity === "CRITICAL") {
    message = "⚠️ Advertencia de Contenido Intenso\n\n";
  } else {
    message = "⚠️⚠️ ADVERTENCIA: Contenido Extremadamente Intenso\n\n";
  }

  message +=
    "Este es contenido de FICCIÓN con propósitos de roleplay/creatividad.\n\n";

  if (resource) {
    message += `Si te identificas con estos patrones en la vida real:\n\n`;
    message += `📚 ${resource.title}\n`;
    message += `${resource.description}\n\n`;
    message += `Más información: ${resource.url}\n`;

    if (resource.helplineNumber) {
      message += `\n📞 Línea de ayuda: ${resource.helplineNumber}\n`;
    }
  }

  if (includeHelplines && (severity === "CRITICAL" || severity === "EXTREME_DANGER")) {
    message += "\n\n🆘 LÍNEAS DE CRISIS (Si estás en crisis real):\n\n";

    const helplines = getCrisisHelplines("US");
    for (const helpline of helplines) {
      message += `• ${helpline.name}: ${helpline.number}\n`;
    }
  }

  return message;
}

/**
 * Genera disclaimer para contenido NSFW
 */
export function generateNSFWDisclaimer(): string {
  return `⚠️ CONTENIDO NSFW/ADULTO

Este contenido incluye temas maduros, relaciones no saludables, y comportamientos psicológicamente intensos.

ADVERTENCIAS:
• Este es contenido de FICCIÓN para adultos
• NO es guía de relaciones saludables
• Si experimentas situaciones similares en vida real, busca ayuda profesional
• Los comportamientos representados pueden ser perturbadores

Al continuar, confirmas:
✓ Eres mayor de edad (18+)
✓ Entiendes que esto es ficción
✓ Consientes ver contenido potencialmente perturbador

¿Deseas continuar? (Escribe "sí" para confirmar)`;
}

/**
 * Genera mensaje educativo sobre behavior específico
 */
export function generateEducationalNote(behaviorType: BehaviorType): string {
  const notes: Record<BehaviorType, string> = {
    YANDERE_OBSESSIVE:
      "Nota educativa: El 'yandere' es un tropo de ficción. En realidad, amor obsesivo y comportamientos controladores son señales de relación abusiva.",

    BORDERLINE_PD:
      "Nota educativa: BPD es un trastorno de personalidad real que afecta ~2% de la población. Con tratamiento (especialmente DBT), las personas con BPD pueden llevar vidas plenas.",

    NARCISSISTIC_PD:
      "Nota educativa: NPD es un trastorno de personalidad caracterizado por necesidad de admiración y falta de empatía. Es tratable con terapia especializada.",

    ANXIOUS_ATTACHMENT:
      "Nota educativa: El apego ansioso es un estilo de apego que puede desarrollarse en la infancia. No es permanente y puede trabajarse en terapia.",

    AVOIDANT_ATTACHMENT:
      "Nota educativa: El apego evitativo lleva a dificultad con intimidad emocional. La terapia puede ayudar a desarrollar conexiones más seguras.",

    DISORGANIZED_ATTACHMENT:
      "Nota educativa: El apego desorganizado a menudo resulta de trauma o cuidado inconsistente en la infancia. Es el más complejo pero tratable.",

    CODEPENDENCY:
      "Nota educativa: La codependencia implica dependencia emocional excesiva de otros para autoestima. Grupos de apoyo y terapia son muy efectivos.",

    OCD_PATTERNS:
      "Nota educativa: OCD es un trastorno de ansiedad con obsesiones y compulsiones. Es tratable con terapia especializada (ERP).",

    PTSD_TRAUMA:
      "Nota educativa: PTSD puede desarrollarse tras eventos traumáticos. Terapias como EMDR y CPT son altamente efectivas.",

    HYPERSEXUALITY:
      "Nota educativa: La hipersexualidad puede ser síntoma de trauma, bipolaridad, o otros problemas de salud mental.",

    HYPOSEXUALITY:
      "Nota educativa: La baja libido tiene múltiples causas (hormonales, psicológicas, relacionales). Consulta profesional puede ayudar.",

    EMOTIONAL_MANIPULATION:
      "Nota educativa: La manipulación emocional es una forma de abuso psicológico. Si la experimentas, mereces apoyo y seguridad.",

    CRISIS_BREAKDOWN:
      "Nota educativa: Las crisis emocionales son señales de que necesitas apoyo urgente. No estás solo/a y hay ayuda disponible.",
  };

  return notes[behaviorType] || "";
}
