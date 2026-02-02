'use client';

import { useState } from 'react';
import { CharacterDraft } from './types';
import { MessageCircle, Zap, Users, Coffee, AlertTriangle, Heart, Play } from 'lucide-react';

interface CharacterSimulatorProps {
  character: CharacterDraft;
}

interface Scenario {
  id: string;
  title: string;
  situation: string;
  icon: React.ReactNode;
}

export function CharacterSimulator({ character }: CharacterSimulatorProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  // Validar que hay suficiente información para simular
  const hasEnoughData = character.name &&
    character.bigFive.openness !== 50 && // Al menos un rasgo modificado
    character.occupation;

  if (!hasEnoughData) {
    return (
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/50 p-8 backdrop-blur-sm text-center">
        <div className="text-slate-400 text-sm">
          <div className="text-3xl mb-2">🎭</div>
          <p>Completa la personalidad para simular comportamiento</p>
          <p className="text-xs mt-2 text-slate-500">Necesitas al menos Big Five y ocupación definidos</p>
        </div>
      </div>
    );
  }

  // Escenarios de prueba
  const scenarios: Scenario[] = [
    {
      id: 'public-criticism',
      title: 'Crítica pública',
      situation: 'Alguien critica tu trabajo públicamente en una reunión',
      icon: <AlertTriangle size={20} className="text-orange-400" />
    },
    {
      id: 'party',
      title: 'Fiesta social',
      situation: 'Te invitan a una fiesta donde no conoces a casi nadie',
      icon: <Users size={20} className="text-purple-400" />
    },
    {
      id: 'deadline',
      title: 'Deadline apretado',
      situation: 'Tienes un proyecto importante que entregar mañana',
      icon: <Zap size={20} className="text-yellow-400" />
    },
    {
      id: 'stranger',
      title: 'Desconocido amigable',
      situation: 'Un desconocido intenta iniciar conversación en un café',
      icon: <Coffee size={20} className="text-brown-400" />
    },
    {
      id: 'conflict',
      title: 'Conflicto personal',
      situation: 'Un amigo cercano te decepciona profundamente',
      icon: <Heart size={20} className="text-red-400" />
    },
  ];

  // Predictor de respuesta basado en Big Five
  const predictResponse = (scenarioId: string): string => {
    const { bigFive, moralAlignment } = character;

    switch (scenarioId) {
      case 'public-criticism':
        if (bigFive.neuroticism > 70) {
          return `Se siente profundamente herido/a, probablemente se pone a la defensiva o se congela. ${bigFive.agreeableness > 60 ? 'Trata de mantener la compostura pero internamente se desmorona.' : 'Puede contraatacar si se siente muy amenazado/a.'} Rumiará sobre esto durante días.`;
        } else if (bigFive.agreeableness > 70) {
          return `Agradece la retroalimentación con calma, pregunta cómo mejorar. ${bigFive.neuroticism < 40 ? 'No lo toma personal, ve la oportunidad de crecer.' : 'Aunque internamente le duele, mantiene la compostura profesional.'}`;
        } else if (bigFive.agreeableness < 40) {
          return `${bigFive.neuroticism > 50 ? 'Se pone a la defensiva inmediatamente, puede escalar el conflicto.' : 'Responde con firmeza, refuta los puntos con los que no está de acuerdo.'} No acepta críticas que considera injustas.`;
        }
        return `Responde con profesionalismo, toma nota de los puntos válidos. ${bigFive.conscientiousness > 60 ? 'Hará un plan para mejorar.' : 'Lo procesa pero sin obsesionarse.'}`;

      case 'party':
        if (bigFive.extraversion > 70) {
          return `${character.name} ADORA esto. Se mezcla fácilmente, inicia conversaciones, ${bigFive.openness > 70 ? 'busca las personas más interesantes' : 'se conecta con varios grupos'}. Probablemente termine siendo el alma de la fiesta o parte del grupo más animado.`;
        } else if (bigFive.extraversion < 40) {
          return `Se queda en la periferia, habla solo con 1-2 personas si puede. ${bigFive.neuroticism > 60 ? 'Se siente ansioso/a, busca excusa para irse temprano.' : 'No lo disfruta pero puede manejarlo.'} "Tengo que madrugar mañana" es su excusa favorita.`;
        } else if (bigFive.openness > 70) {
          return `Va con curiosidad, habla con gente interesante, pero ${bigFive.conscientiousness > 60 ? 'se va a una hora razonable' : 'puede quedarse si la conversación es buena'}. Selectivo/a con las interacciones.`;
        }
        return `Asiste por compromiso social, interactúa moderadamente. ${bigFive.agreeableness > 60 ? 'Es amable con todos pero no busca ser el centro.' : 'Cordial pero mantiene distancia.'} Se va cuando se cansa.`;

      case 'deadline':
        if (bigFive.conscientiousness > 75) {
          return `Entra en MODO MÁQUINA. ${bigFive.neuroticism > 60 ? 'Con ansiedad pero canalizada productivamente.' : 'Calmado/a y enfocado/a.'} Hace lista de prioridades, ${character.skills.length > 0 ? `usa sus skills de ${character.skills[0].name}` : 'trabaja metódicamente'}. Probablemente termine antes del deadline.`;
        } else if (bigFive.neuroticism > 70) {
          return `PÁNICO. ${bigFive.conscientiousness < 40 ? 'Procrastinó hasta ahora y está desesperado/a.' : 'Aunque normalmente es organizado/a, la presión lo/la paraliza.'} Posiblemente pida extensión o trabaje toda la noche en modo caos.`;
        } else if (bigFive.conscientiousness < 40) {
          return `"Trabajo mejor bajo presión" (spoiler: no siempre). ${bigFive.openness > 60 ? 'Improvisa creativamente, puede salir sorprendentemente bien.' : 'Hace lo mínimo para cumplir.'} ${bigFive.agreeableness > 60 ? 'Puede pedir ayuda si se siente abrumado/a.' : 'Lo hace solo/a, para bien o para mal.'}`;
        }
        return `Trabaja con determinación, ${bigFive.neuroticism < 40 ? 'sin estresarse demasiado' : 'con cierto estrés manejable'}. Prioriza lo importante, ${bigFive.openness > 60 ? 'encuentra soluciones creativas si es necesario' : 'sigue el plan establecido'}.`;

      case 'stranger':
        if (bigFive.extraversion > 70 && bigFive.openness > 70) {
          return `${character.name} responde con entusiasmo. Le encanta conocer gente nueva y ${bigFive.agreeableness > 60 ? 'es genuinamente cálido/a' : 'disfruta conversaciones interesantes'}. Puede terminar en charla profunda de ${bigFive.openness > 80 ? 'temas filosóficos' : 'vida y experiencias'}.`;
        } else if (bigFive.extraversion < 40) {
          return `${bigFive.neuroticism > 60 ? 'Se siente incómodo/a, da respuestas cortas.' : 'Cortésmente responde pero no alimenta la conversación.'} ${bigFive.agreeableness > 60 ? 'Es educado/a pero distante.' : 'Puede decir directamente que prefiere estar solo/a.'} Pone audífonos después.`;
        } else if (bigFive.agreeableness > 70) {
          return `Es amable y responde con calidez, ${bigFive.openness > 60 ? 'curioso/a sobre el extraño' : 'mantiene conversación superficial agradable'}. No busca profundizar pero ${bigFive.conscientiousness > 60 ? 'es cortés hasta que necesita irse' : 'puede fluir naturalmente'}.`;
        }
        return `Responde cordialmente pero ${bigFive.neuroticism > 50 ? 'evalúa la situación con cautela' : 'de manera neutral'}. ${bigFive.openness > 60 ? 'Si la persona es interesante, se abre un poco.' : 'Mantiene la interacción breve y educada.'}`;

      case 'conflict':
        if (bigFive.agreeableness > 70 && bigFive.neuroticism < 50) {
          return `Se siente herido/a pero ${moralAlignment.morality > 60 ? 'busca entender qué pasó, intenta comunicarse' : 'trata de resolver el conflicto'}. ${bigFive.openness > 60 ? 'Está dispuesto/a a ver otras perspectivas.' : 'Quiere restaurar la armonía.'} Puede perdonar si hay disculpa genuina.`;
        } else if (bigFive.neuroticism > 70) {
          return `LO TOMA MUY PERSONAL. ${bigFive.agreeableness < 40 ? 'Puede cortar la relación impulsivamente.' : 'Rumiará obsesivamente sobre qué hizo mal.'} ${character.fears.includes('Abandono') || character.fears.includes('abandono') ? 'Su miedo al abandono se activa.' : 'Necesita tiempo para procesar.'} Posible explosión emocional o distanciamiento prolongado.`;
        } else if (bigFive.agreeableness < 40) {
          return `${bigFive.neuroticism > 50 ? 'Se enfada, probablemente confronta directamente.' : 'Corta la relación sin drama excesivo.'} ${moralAlignment.morality > 60 ? 'Siente que fue traicionado/a en sus valores.' : 'Ve la relación como no viable.'} ${bigFive.conscientiousness > 60 ? 'Evalúa fríamente si vale la pena continuar.' : 'Actúa por instinto, puede ser definitivo.'}`;
        }
        return `Se siente decepcionado/a, ${bigFive.conscientiousness > 60 ? 'evalúa la situación racionalmente' : 'procesa sus emociones'}. ${bigFive.openness > 60 ? 'Considera múltiples perspectivas antes de decidir.' : 'Confía en su intuición sobre qué hacer.'} Puede dar segunda oportunidad o tomar distancia según la gravedad.`;

      default:
        return 'Responde de manera coherente con su personalidad.';
    }
  };

  // Predicciones generales de comportamiento
  const getBehaviorPredictions = (): string[] => {
    const predictions: string[] = [];
    const { bigFive, moralAlignment, occupation } = character;

    // En una fiesta
    if (bigFive.extraversion > 70) {
      predictions.push(`🎉 En una fiesta: Es el alma de la fiesta o parte del grupo más animado. Disfruta genuinamente estar rodeado/a de gente.`);
    } else if (bigFive.extraversion < 40) {
      predictions.push(`😐 En una fiesta: Se queda en la periferia, habla con 1-2 personas, se va temprano con excusa de "madrugar mañana".`);
    } else {
      predictions.push(`🤝 En una fiesta: Interactúa moderadamente, selectivo/a con conversaciones. Disfruta pero con límites.`);
    }

    // Bajo presión
    if (bigFive.conscientiousness > 70 && bigFive.neuroticism < 50) {
      predictions.push(`💪 Bajo presión: Se vuelve MÁS organizado/a, hace listas, prioriza eficientemente. La presión lo/la motiva.`);
    } else if (bigFive.neuroticism > 70) {
      predictions.push(`😰 Bajo presión: ${bigFive.conscientiousness > 60 ? 'Ansiedad alta pero canalizada en trabajo.' : 'Puede paralizarse o entrar en pánico.'} Necesita estrategias de coping.`);
    } else {
      predictions.push(`⚖️ Bajo presión: ${bigFive.conscientiousness > 60 ? 'Trabaja metódicamente sin perder la calma.' : 'Improvisa, puede ser desorganizado/a pero lo logra.'}`);
    }

    // Con desconocidos
    if (bigFive.extraversion > 60 && bigFive.openness > 60) {
      predictions.push(`👋 Con desconocidos: ${bigFive.agreeableness > 60 ? 'Cálido/a y acogedor/a,' : 'Interesado/a y curioso/a,'} inicia conversaciones fácilmente. Disfruta conocer gente nueva.`);
    } else if (bigFive.extraversion < 40 || bigFive.neuroticism > 70) {
      predictions.push(`🙈 Con desconocidos: ${bigFive.agreeableness > 60 ? 'Cordial pero distante,' : 'Reservado/a,'} evita contacto visual prolongado. Necesita ${bigFive.neuroticism > 60 ? '5+' : '3+'} encuentros para abrirse.`);
    } else {
      predictions.push(`😊 Con desconocidos: Cordial y educado/a, pero ${bigFive.openness > 60 ? 'se abre si la persona es interesante' : 'mantiene distancia inicial'}. Calienta gradualmente.`);
    }

    // En conflicto
    if (bigFive.agreeableness > 70) {
      predictions.push(`🕊️ En conflicto: Busca resolución pacífica, ${bigFive.neuroticism < 50 ? 'mantiene la calma' : 'aunque internamente le afecta mucho'}. Prioriza la armonía.`);
    } else if (bigFive.agreeableness < 40) {
      predictions.push(`⚔️ En conflicto: ${bigFive.neuroticism > 60 ? 'Confronta directamente, puede escalar.' : 'Firme en su posición, no cede fácilmente.'} No evita confrontaciones.`);
    } else {
      predictions.push(`⚖️ En conflicto: Balanceado/a, ${bigFive.openness > 60 ? 'considera múltiples perspectivas' : 'confía en su juicio'}. Puede negociar o alejarse según gravedad.`);
    }

    // Estilo de toma de decisiones
    if (bigFive.conscientiousness > 70 && bigFive.openness > 60) {
      predictions.push(`🧠 Decisiones: Analiza pros/contras meticulosamente, ${bigFive.neuroticism > 50 ? 'puede caer en "analysis paralysis"' : 'decide con confianza después de analizar'}. Considera innovaciones.`);
    } else if (bigFive.openness > 70 && bigFive.conscientiousness < 50) {
      predictions.push(`🎲 Decisiones: Intuitivo/a y creativo/a, ${bigFive.neuroticism < 40 ? 'confía en su instinto' : 'puede dudar después'}. Prefiere opciones no convencionales.`);
    } else if (bigFive.conscientiousness > 70) {
      predictions.push(`📋 Decisiones: Metódico/a y estructurado/a, usa lógica y datos. ${bigFive.neuroticism > 60 ? 'Busca seguridad en hechos.' : 'Decide con confianza basado en información.'}`);
    } else {
      predictions.push(`⚡ Decisiones: ${bigFive.neuroticism > 60 ? 'Duda mucho, puede postergar.' : 'Rápido/a, confía en intuición.'} ${bigFive.agreeableness > 60 ? 'Considera impacto en otros.' : 'Prioriza sus necesidades.'}`);
    }

    return predictions;
  };

  const selectedScenarioObj = scenarios.find(s => s.id === selectedScenario);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30 backdrop-blur-sm">
          <span className="text-xs font-semibold text-green-300 uppercase tracking-wider">
            🎭 Simulador de Personaje
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Prueba cómo respondería {character.name || "el personaje"} en diferentes situaciones
        </p>
      </div>

      {/* Predicciones generales */}
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-yellow-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
            Predicciones de Comportamiento
          </h3>
        </div>

        <div className="space-y-3">
          {getBehaviorPredictions().map((prediction, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 text-sm text-slate-300"
            >
              {prediction}
            </div>
          ))}
        </div>
      </div>

      {/* Escenarios de prueba */}
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Play size={18} className="text-green-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
            Prueba en Escenarios
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario.id === selectedScenario ? null : scenario.id)}
              className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                selectedScenario === scenario.id
                  ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/20'
                  : 'bg-slate-800/50 border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-start gap-3">
                {scenario.icon}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-200 mb-1">{scenario.title}</div>
                  <div className="text-xs text-slate-400">{scenario.situation}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Respuesta predicha */}
        {selectedScenario && selectedScenarioObj && (
          <div className="mt-4 p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-start gap-3">
              <MessageCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-green-400 font-semibold uppercase tracking-wide mb-2">
                  ¿Cómo respondería {character.name || "el personaje"}?
                </div>
                <div className="text-sm text-slate-300 leading-relaxed">
                  {predictResponse(selectedScenario)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer explicativo */}
      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">¿Cómo funciona el simulador?</p>
            <p>Las predicciones se basan en el modelo Big Five, valores morales y rasgos definidos. No son 100% exactas (nadie es tan predecible) pero dan una <span className="text-green-400">idea sólida de tendencias de comportamiento</span> basadas en psicología real.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
