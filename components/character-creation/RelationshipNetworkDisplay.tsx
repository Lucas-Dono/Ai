'use client';

import { ImportantPerson } from './types';
import { Heart, Users, Briefcase, Skull, Zap, Calendar, TrendingUp, AlertCircle, MessageCircle } from 'lucide-react';

interface RelationshipNetworkDisplayProps {
  people: ImportantPerson[];
  characterName?: string;
}

export function RelationshipNetworkDisplay({ people, characterName = "Personaje" }: RelationshipNetworkDisplayProps) {

  if (people.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/50 p-8 backdrop-blur-sm text-center">
        <div className="text-slate-400 text-sm">
          <div className="text-3xl mb-2">👥</div>
          <p>No hay relaciones definidas</p>
          <p className="text-xs mt-2 text-slate-500">Las personas importantes moldean quiénes somos</p>
        </div>
      </div>
    );
  }

  // Helpers
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'family': return '👨‍👩‍👧';
      case 'friend': return '🤝';
      case 'romantic': return '💕';
      case 'rival': return '⚔️';
      case 'mentor': return '🎓';
      case 'colleague': return '💼';
      default: return '👤';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'family': return 'from-blue-500 to-cyan-500';
      case 'friend': return 'from-green-500 to-emerald-500';
      case 'romantic': return 'from-pink-500 to-rose-500';
      case 'rival': return 'from-red-500 to-orange-500';
      case 'mentor': return 'from-purple-500 to-indigo-500';
      case 'colleague': return 'from-yellow-500 to-amber-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  const getClosenessLabel = (closeness: number) => {
    if (closeness >= 80) return 'Extremadamente cercano';
    if (closeness >= 60) return 'Cercano';
    if (closeness >= 40) return 'Regular';
    if (closeness >= 20) return 'Ocasional';
    return 'Distante';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { label: 'Activa', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
      estranged: { label: 'Distanciados', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
      deceased: { label: 'Fallecido/a', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
      distant: { label: 'Distante', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    };
    const badge = badges[status as keyof typeof badges] || badges.active;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  // Agrupar por tipo
  const peopleByType = people.reduce((acc, person) => {
    if (!acc[person.type]) acc[person.type] = [];
    acc[person.type].push(person);
    return acc;
  }, {} as Record<string, ImportantPerson[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 backdrop-blur-sm">
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
            👥 Red Social de {characterName}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {people.length} {people.length === 1 ? 'persona importante' : 'personas importantes'}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(peopleByType).map(([type, persons]) => (
          <div
            key={type}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-lg border border-slate-700/50 p-3 text-center"
          >
            <div className="text-2xl mb-1">{getTypeIcon(type)}</div>
            <div className="text-lg font-bold text-slate-200">{persons.length}</div>
            <div className="text-xs text-slate-400 capitalize">{type === 'family' ? 'Familia' : type === 'friend' ? 'Amigos' : type === 'romantic' ? 'Romántica' : type === 'rival' ? 'Rivales' : type === 'mentor' ? 'Mentores' : 'Colegas'}</div>
          </div>
        ))}
      </div>

      {/* Relationship Cards */}
      <div className="space-y-6">
        {people.map((person) => {
          const typeColor = getTypeColor(person.type);

          return (
            <div
              key={person.id}
              className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300"
            >
              {/* Header de la persona */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar/Icono */}
                <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${typeColor} rounded-full flex items-center justify-center text-3xl shadow-lg`}>
                  {getTypeIcon(person.type)}
                </div>

                {/* Información básica */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{person.name}</h3>
                      <p className="text-sm text-slate-400">{person.relationship}</p>
                    </div>
                    {getStatusBadge(person.status)}
                  </div>

                  <p className="text-sm text-slate-300 mt-2">{person.description}</p>

                  {/* Closeness bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Cercanía</span>
                      <span className="text-xs text-slate-400">{getClosenessLabel(person.closeness)} ({person.closeness})</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${typeColor} transition-all duration-500`}
                        style={{ width: `${person.closeness}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Influencia */}
              {person.influenceOn && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-indigo-400" />
                    <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                      Influencia en el personaje
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {person.influenceOn.values && person.influenceOn.values.length > 0 && (
                      <div>
                        <span className="text-xs text-slate-500">Valores inculcados: </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {person.influenceOn.values.map((value, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs font-medium border border-green-500/30"
                            >
                              💎 {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {person.influenceOn.fears && person.influenceOn.fears.length > 0 && (
                      <div>
                        <span className="text-xs text-slate-500">Miedos causados: </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {person.influenceOn.fears.map((fear, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs font-medium border border-red-500/30"
                            >
                              ⚠️ {fear}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {person.influenceOn.skills && person.influenceOn.skills.length > 0 && (
                      <div>
                        <span className="text-xs text-slate-500">Habilidades enseñadas: </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {person.influenceOn.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium border border-blue-500/30"
                            >
                              🎯 {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {person.influenceOn.personalityImpact && (
                      <div className="mt-2 p-2 bg-indigo-500/10 rounded border border-indigo-500/20">
                        <p className="text-xs text-slate-300 italic">
                          "{person.influenceOn.personalityImpact}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Historia compartida */}
              {person.sharedHistory && person.sharedHistory.length > 0 && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={16} className="text-purple-400" />
                    <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
                      Historia compartida
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {person.sharedHistory.map((event) => (
                      <div key={event.id} className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-14 text-xs text-purple-400 font-bold">
                          {event.year}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-slate-200 font-medium">{event.title}</div>
                          {event.description && (
                            <div className="text-xs text-slate-400 mt-0.5">{event.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dinámica actual */}
              {person.currentDynamic && (
                <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/20 flex items-start gap-2">
                  <MessageCircle size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1">Dinámica actual</div>
                    <div className="text-sm text-slate-300">{person.currentDynamic}</div>
                  </div>
                </div>
              )}

              {/* Conflicto (si existe) */}
              {person.conflict && person.conflict.active && (
                <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30 flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-red-400 font-semibold uppercase tracking-wide">
                        Conflicto activo
                      </div>
                      <div className="text-xs text-red-300">
                        Intensidad: {person.conflict.intensity}/100
                      </div>
                    </div>
                    <div className="text-sm text-slate-300">{person.conflict.description}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer explicativo */}
      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">¿Por qué son importantes las relaciones?</p>
            <p>Nadie existe en el vacío. Somos producto de nuestras relaciones: familia que nos moldeó, amigos que nos sostienen, mentores que nos guían, rivales que nos desafían. Las dinámicas relacionales son <span className="text-blue-400">la fuente principal de valores, miedos y conflictos</span> que definen quiénes somos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
