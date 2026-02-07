'use client';

import { RotateCcw, Lightbulb } from 'lucide-react';
import type { BigFiveFacets } from '@/lib/psychological-analysis';
import type { BigFiveTraits } from '@/types/character-creation';
import { inferFacetsFromBigFive } from '@/lib/psychological-analysis';
import { FacetAccordion } from './FacetAccordion';

interface FacetsTabProps {
  facets: BigFiveFacets | undefined;
  bigFive: BigFiveTraits;
  onChange: (facets: BigFiveFacets) => void;
}

/**
 * Tab principal de facetas Big Five.
 * Muestra 5 accordions (uno por dimensión) con 6 facetas cada uno.
 */
export function FacetsTab({ facets, bigFive, onChange }: FacetsTabProps) {
  // Si no hay facetas, usar valores por defecto (inferidos)
  const currentFacets = facets || inferFacetsFromBigFive(bigFive);

  // Handler para cambiar una faceta individual
  const handleFacetChange = (
    dimension: keyof BigFiveFacets,
    facetName: string,
    value: number
  ) => {
    const updatedFacets = {
      ...currentFacets,
      [dimension]: {
        ...currentFacets[dimension],
        [facetName]: value,
      },
    };
    onChange(updatedFacets);
  };

  // Handler para reinferir una dimensión completa
  const handleReinferDimension = (dimension: keyof BigFiveFacets) => {
    const inferred = inferFacetsFromBigFive(bigFive);
    const updatedFacets = {
      ...currentFacets,
      [dimension]: inferred[dimension],
    };
    onChange(updatedFacets);
  };

  // Handler para reinferir todas las facetas
  const handleReinferAll = () => {
    const inferred = inferFacetsFromBigFive(bigFive);
    onChange(inferred);
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-indigo-300 mb-1">Facetas de Personalidad</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Las facetas son subdimensiones de las 5 grandes dimensiones de personalidad. Cada dimensión Big Five se desglosa en 6 facetas
              que permiten un perfil más detallado y matizado. Los valores se infieren automáticamente desde tu perfil Big Five, pero puedes
              ajustarlos manualmente para mayor precisión.
            </p>
          </div>
        </div>
      </div>

      {/* Reinfer all button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">30 Facetas de Personalidad</h3>
          <p className="text-xs text-slate-400 mt-0.5">Ajusta cada faceta individualmente o reinfiérelas desde Big Five</p>
        </div>
        <button
          onClick={handleReinferAll}
          className="px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reinferir Todas
        </button>
      </div>

      {/* Accordions */}
      <div className="space-y-3">
        <FacetAccordion
          dimension="openness"
          facets={currentFacets.openness as unknown as Record<string, number>}
          onChange={(facetName, value) => handleFacetChange('openness', facetName, value)}
          onReinfer={() => handleReinferDimension('openness')}
        />

        <FacetAccordion
          dimension="conscientiousness"
          facets={currentFacets.conscientiousness as unknown as Record<string, number>}
          onChange={(facetName, value) => handleFacetChange('conscientiousness', facetName, value)}
          onReinfer={() => handleReinferDimension('conscientiousness')}
        />

        <FacetAccordion
          dimension="extraversion"
          facets={currentFacets.extraversion as unknown as Record<string, number>}
          onChange={(facetName, value) => handleFacetChange('extraversion', facetName, value)}
          onReinfer={() => handleReinferDimension('extraversion')}
        />

        <FacetAccordion
          dimension="agreeableness"
          facets={currentFacets.agreeableness as unknown as Record<string, number>}
          onChange={(facetName, value) => handleFacetChange('agreeableness', facetName, value)}
          onReinfer={() => handleReinferDimension('agreeableness')}
        />

        <FacetAccordion
          dimension="neuroticism"
          facets={currentFacets.neuroticism as unknown as Record<string, number>}
          onChange={(facetName, value) => handleFacetChange('neuroticism', facetName, value)}
          onReinfer={() => handleReinferDimension('neuroticism')}
        />
      </div>

      {/* Footer note */}
      <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-700/50">
        Las facetas proporcionan un perfil más detallado que las 5 dimensiones generales. Haz clic en el ícono{' '}
        <HelpCircle className="w-3 h-3 inline" /> para ver la descripción de cada faceta.
      </div>
    </div>
  );
}

// Placeholder component (se importará de lucide-react en producción)
function HelpCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
