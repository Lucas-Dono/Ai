'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  User, Users, Briefcase, Brain, BookOpen, Sparkles,
  Plus, X, Upload, RefreshCw,
  PenTool, Download, Rocket, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import type { CharacterDraft } from './types';
import { PersonalityRadarChart } from './PersonalityRadarChart';
import { MoralAlignmentChart } from './MoralAlignmentChart';
import { SkillBarsChart } from './SkillBarsChart';
import { ContradictionsDisplay } from './ContradictionsDisplay';
import { RelationshipNetworkDisplay } from './RelationshipNetworkDisplay';
import { PersonalityTimelineDisplay } from './PersonalityTimelineDisplay';
import { CharacterSimulator } from './CharacterSimulator';

// UI Components
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Psychological System Components
import { FacetsTab } from './Facets/FacetsTab';
import { DarkTriadTab } from './DarkTriad/DarkTriadTab';
import { AttachmentTab } from './Attachment/AttachmentTab';
import { NeedsTab } from './PsychologicalNeeds/NeedsTab';
import { AnalysisTab } from './PsychologicalAnalysis/AnalysisTab';

// Psychological Analysis
import {
  inferFacetsFromBigFive,
  analyzePsychologicalProfile,
  type BigFiveFacets,
  type DarkTriad,
  type AttachmentProfile,
  type EnrichedPersonalityProfile,
  type PsychologicalAnalysis,
} from '@/lib/psychological-analysis';
import type { BigFiveTraits, PsychologicalNeeds } from '@/types/character-creation';

// --- SUB-COMPONENTS (Fuera del render para evitar recreación) ---
const SectionHeader = ({ icon: Icon, title, badge }: { icon: any; title: string; badge?: string }) => (
  <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-3">
    <div className="p-2 bg-slate-800 rounded-lg text-indigo-400 shadow-lg shadow-indigo-500/10">
      <Icon size={24} />
    </div>
    <div>
      <h2 className="text-xl font-bold text-slate-100">{title}</h2>
      {badge && (
        <span className="text-xs text-indigo-400 font-mono uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          {badge}
        </span>
      )}
    </div>
  </div>
);

const MagicButton = ({
  onClick,
  loading,
  text,
  fullWidth,
  variant = 'primary',
  icon: Icon = Sparkles
}: {
  onClick: () => void;
  loading: boolean;
  text: string;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'gradient';
  icon?: any;
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`
      flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm
      ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'cursor-pointer'}
      ${!loading && variant === 'primary' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500 hover:scale-[1.02]' : ''}
      ${!loading && variant === 'secondary' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600' : ''}
      ${!loading && variant === 'gradient' ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white shadow-lg border border-indigo-400/30' : ''}
      ${fullWidth ? 'w-full' : ''}
    `}
  >
    {loading ? <RefreshCw className="animate-spin" size={16} /> : <Icon size={16} />}
    <span>{loading ? 'Procesando...' : text}</span>
  </button>
);

const DarkInput = ({ value, onChange, placeholder, type = "text", error }: any) => (
  <div className="relative">
    <input
      type={type}
      className={`w-full px-3 py-2 bg-slate-900 border rounded-lg focus:ring-1 outline-none text-slate-200 placeholder-slate-600 transition-all ${
        error
          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
          : 'border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
      }`}
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
    />
    {error && (
      <div className="absolute -bottom-5 left-0 text-xs text-red-400">
        {error}
      </div>
    )}
  </div>
);

const TagInput = ({ tags, onAdd, onRemove, placeholder }: any) => {
  const [input, setInput] = useState('');
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag: string, i: number) => (
          <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono text-indigo-300 bg-indigo-900/30 border border-indigo-500/30">
            {tag}
            <button onClick={() => onRemove(i)} className="ml-2 text-indigo-400 hover:text-indigo-200 cursor-pointer">
              <X size={12}/>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd(input);
              setInput('');
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200 placeholder-slate-600"
        />
        <button
          onClick={() => { onAdd(input); setInput(''); }}
          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 cursor-pointer"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

const Slider = ({ label, value, onChange }: any) => (
  <div className="mb-5">
    <div className="flex justify-between mb-2">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <span className="text-xs font-mono text-indigo-400 bg-indigo-900/20 px-1.5 py-0.5 rounded">{value}%</span>
    </div>
    <div className="relative w-full h-2 bg-slate-800 rounded-full cursor-pointer">
      <div
        className="absolute h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full pointer-events-none"
        style={{ width: `${value}%` }}
      />
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  </div>
);

/**
 * Modern Dark Character Creator - PersonaArchitect Style
 */
export function CVStyleCreator() {
  const router = useRouter();
  const t = useTranslations('characterCreation');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAdvancedPsychology, setShowAdvancedPsychology] = useState(false);

  const [loadingAI, setLoadingAI] = useState({
    identity: false,
    work: false,
    personality: false,
    relationships: false,
    history: false,
    avatar: false,
    all: false
  });

  // Estado para dimensiones psicológicas enriquecidas
  const [enrichedPersonality, setEnrichedPersonality] = useState<{
    facets?: BigFiveFacets;
    darkTriad?: DarkTriad;
    attachmentProfile?: AttachmentProfile;
    psychologicalNeeds?: PsychologicalNeeds;
  }>({});

  // Estado para análisis psicológico
  const [analysisResult, setAnalysisResult] = useState<PsychologicalAnalysis | null>(null);

  const [character, setCharacter] = useState<CharacterDraft>({
    // Identidad
    name: '',
    age: undefined,
    gender: undefined,
    origin: '',
    generalDescription: '', // Descripción general (prompt maestro)
    physicalDescription: '', // Solo apariencia física (para avatar)
    avatarUrl: null,

    // Trabajo
    occupation: '',
    skills: [],
    achievements: [],

    // Personalidad
    bigFive: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },
    coreValues: [],
    fears: [],
    cognitivePrompt: '',

    // Alineamiento Moral
    moralAlignment: {
      lawfulness: 50, // 0=Chaotic, 50=Neutral, 100=Lawful
      morality: 50, // 0=Evil, 50=Neutral, 100=Good
    },

    // Conflictos de Personalidad
    personalityConflicts: {
      internalContradictions: [],
      situationalVariations: [],
    },

    // Relaciones
    importantPeople: [],
    maritalStatus: undefined,

    // Historia
    importantEvents: [],
    traumas: [],
    personalAchievements: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const physicalDescRef = useRef<HTMLTextAreaElement>(null);

  // Construir perfil enriquecido completo para análisis
  const enrichedProfile = useMemo<EnrichedPersonalityProfile | null>(() => {
    // Necesitamos al menos Big Five para hacer análisis
    if (!character.bigFive) return null;

    return {
      ...character.bigFive,
      coreValues: character.coreValues,
      baselineEmotions: {
        joy: 0.5,
        sadness: 0.5,
        anger: 0.5,
        fear: 0.5,
        disgust: 0.5,
        surprise: 0.5,
      },
      facets: enrichedPersonality.facets,
      darkTriad: enrichedPersonality.darkTriad,
      attachment: enrichedPersonality.attachmentProfile,
      psychologicalNeeds: enrichedPersonality.psychologicalNeeds,
    };
  }, [character.bigFive, character.coreValues, enrichedPersonality]);

  // Análisis automático con debounce (500ms)
  useEffect(() => {
    if (!enrichedProfile) return;

    const timer = setTimeout(() => {
      try {
        const result = analyzePsychologicalProfile(enrichedProfile);
        setAnalysisResult(result);
      } catch (error) {
        console.error('[Analysis] Error al analizar perfil:', error);
        setAnalysisResult(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [enrichedProfile]);

  // Validaciones
  const validation = {
    name: character.name.trim().length > 0,
    age: character.age !== undefined && character.age > 0,
    gender: character.gender !== undefined,
    physicalDescription: character.physicalDescription.trim().length >= 10,
    avatarUrl: character.avatarUrl !== null,
    occupation: character.occupation.trim().length > 0,
  };

  const isValid = Object.values(validation).every(v => v);

  // --- AI GENERATION HANDLERS ---
  const generateAll = async () => {
    if (!character.generalDescription.trim()) {
      alert(t('description.errors.needDescription'));
      return;
    }

    setLoadingAI(prev => ({ ...prev, all: true }));
    setShowAdvanced(true);

    try {
      console.log('[PersonaArchitect] 🚀 Iniciando generación completa con IA...');

      // PASO 1: Generar identidad (incluye physicalDescription)
      console.log('[PersonaArchitect] 📝 Generando identidad...');
      await simulateAIGeneration('identity', 0);

      // PASO 2: Generar resto en paralelo (no dependen entre sí)
      // NOTA: Avatar se genera por separado, es opcional
      console.log('[PersonaArchitect] ⚡ Generando personalidad, trabajo e historia en paralelo...');
      await Promise.all([
        simulateAIGeneration('personality', 0),
        simulateAIGeneration('work', 0),
        simulateAIGeneration('history', 0),
      ]);

      console.log('[PersonaArchitect] ✅ Generación completa finalizada');
      console.log('[PersonaArchitect] 💡 Tip: Puedes generar el avatar después con el botón en la sección Identidad');
    } catch (error: any) {
      console.error('[PersonaArchitect] ❌ Error en generación:', error);
      alert(`Error en la generación: ${error.message}`);
    } finally {
      setLoadingAI(prev => ({ ...prev, all: false }));
    }
  };

  const simulateAIGeneration = async (section: string, delay: number = 0) => {
    setLoadingAI(prev => ({ ...prev, [section]: true }));

    // Pequeño delay para UX (mostrar loading)
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      // Preparar payload base
      const payload: any = {
        description: character.generalDescription,
        name: character.name,
        age: character.age,
        gender: character.gender,
      };

      // Agregar contexto existente según la sección
      switch (section) {
        case 'personality':
          if (character.coreValues.length > 0) payload.existingValues = character.coreValues;
          if (character.fears.length > 0) payload.existingFears = character.fears;
          if (character.cognitivePrompt) payload.existingCognitivePrompt = character.cognitivePrompt;
          // Agregar historia para personalityEvolution
          if (character.traumas.length > 0) payload.traumas = character.traumas;
          if (character.importantEvents.length > 0) payload.importantEvents = character.importantEvents;
          break;

        case 'work':
          if (character.occupation) payload.existingOccupation = character.occupation;
          if (character.skills.length > 0) payload.existingSkills = character.skills;
          if (character.achievements.length > 0) payload.existingAchievements = character.achievements;
          break;

        case 'history':
          if (character.importantEvents.length > 0) payload.existingEvents = character.importantEvents;
          if (character.traumas.length > 0) payload.existingTraumas = character.traumas;
          if (character.personalAchievements.length > 0) payload.existingAchievements = character.personalAchievements;
          break;

        case 'relationships':
          if (character.importantPeople.length > 0) payload.existingPeople = character.importantPeople;
          if (character.coreValues.length > 0) payload.existingValues = character.coreValues;
          if (character.fears.length > 0) payload.existingFears = character.fears;
          break;

        case 'identity':
          // Para identity, usar origin y physicalDescription si existen
          if (character.origin) payload.existingOrigin = character.origin;
          if (character.physicalDescription) payload.existingPhysicalDescription = character.physicalDescription;
          break;
      }

      console.log(`[Generate ${section}] Enviando contexto:`, payload);

      const response = await fetch(`/api/character-creation/generate-${section}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en la generación');
      }

      const result = await response.json();
      updateCharacterFromAI(section, result);
    } catch (error: any) {
      console.error(`Failed to generate ${section}:`, error);
      alert(`Error al generar ${section}: ${error.message}`);
    } finally {
      setLoadingAI(prev => ({ ...prev, [section]: false }));
    }
  };

  const updateCharacterFromAI = (section: string, data: any) => {
    setCharacter(prev => {
      switch (section) {
        case 'identity':
          return {
            ...prev,
            name: data.name,
            age: data.age,
            gender: data.gender,
            origin: data.origin,
            // También actualizar la descripción física si viene en la respuesta
            physicalDescription: data.physicalDescription || prev.physicalDescription
          };
        case 'avatar':
          return { ...prev, avatarUrl: data.url };
        case 'work':
          // Convertir skills a formato con niveles si vienen como strings
          const skills = Array.isArray(data.skills)
            ? data.skills.map((s: any) =>
                typeof s === 'string'
                  ? { name: s, level: 60 } // Nivel intermedio por defecto
                  : s
              )
            : prev.skills;
          return { ...prev, occupation: data.occupation, skills, achievements: data.achievements };
        case 'personality':
          const updates: any = {
            bigFive: data.bigFive,
            coreValues: data.values,
            fears: data.fears,
            cognitivePrompt: data.cognitivePrompt
          };
          // Agregar moralAlignment si viene en la respuesta
          if (data.moralAlignment) {
            updates.moralAlignment = data.moralAlignment;
          }
          // Agregar personalityConflicts si vienen en la respuesta
          if (data.internalContradictions || data.situationalVariations) {
            updates.personalityConflicts = {
              internalContradictions: data.internalContradictions || [],
              situationalVariations: data.situationalVariations || [],
            };
          }
          // Agregar personalityEvolution si viene en la respuesta
          if (data.personalityEvolution) {
            updates.personalityEvolution = data.personalityEvolution;
          }
          return { ...prev, ...updates };
        case 'history':
          return { ...prev, importantEvents: data.events, traumas: data.traumas, personalAchievements: data.achievements };
        case 'relationships':
          return { ...prev, importantPeople: data.people || [] };
        default:
          return prev;
      }
    });
  };

  const handleAvatarGeneration = async (silent: boolean = false) => {
    // Limpiar error previo
    setAvatarError(null);

    // Validar que existe la descripción física
    if (!character.physicalDescription || character.physicalDescription.trim().length < 10) {
      if (!silent) {
        setAvatarError('Necesitas completar la descripción visual primero (mínimo 10 caracteres)');
        setShowValidation(true);

        // Hacer scroll al campo de descripción física y enfocarlo
        if (physicalDescRef.current) {
          physicalDescRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus después de un breve delay para que el scroll se complete
          setTimeout(() => physicalDescRef.current?.focus(), 500);
        }

        // Auto-limpiar el error después de 5 segundos
        setTimeout(() => setAvatarError(null), 5000);
      } else {
        console.log('[Avatar] Saltando generación: descripción física insuficiente');
      }
      return;
    }

    setLoadingAI(prev => ({ ...prev, avatar: true }));
    try {
      const response = await fetch('/api/character-creation/generate-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: character.physicalDescription,
          age: character.age,
          gender: character.gender,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al generar avatar');
      }

      const result = await response.json();
      setCharacter(prev => ({ ...prev, avatarUrl: result.url }));
    } catch (error: any) {
      console.error('Failed to generate avatar:', error);
      if (!silent) {
        setAvatarError(`Error al generar avatar: ${error.message}`);
        setTimeout(() => setAvatarError(null), 5000);
      }
    } finally {
      setLoadingAI(prev => ({ ...prev, avatar: false }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('identity.avatar.errors.invalidFormat'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t('identity.avatar.errors.tooLarge'));
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/smart-start/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setCharacter(prev => ({ ...prev, avatarUrl: result.url }));
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert(t('identity.avatar.errors.uploadFailed'));
    }
  };

  // --- SAVE HANDLER ---
  const handleSave = async () => {
    if (!isValid) {
      setShowValidation(true);
      alert(t('status.fillRequired'));
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/character-creation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(character),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear personaje');
      }

      const result = await response.json();

      // Redirect to character page
      router.push(`/agentes/${result.agent.id}`);
    } catch (error: any) {
      console.error('Failed to save character:', error);
      alert(error.message || 'Error al crear personaje. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- ARRAY HELPERS ---
  const addToArray = (field: keyof CharacterDraft, value: string) => {
    if (!value.trim()) return;
    setCharacter(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()]
    }));
  };

  const removeFromArray = (field: keyof CharacterDraft, index: number) => {
    setCharacter(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  // --- SKILL HELPERS ---
  const addSkill = (name: string, level: number = 50) => {
    if (!name.trim()) return;
    setCharacter(prev => ({
      ...prev,
      skills: [...prev.skills, { name: name.trim(), level }]
    }));
  };

  const updateSkillLevel = (index: number, level: number) => {
    setCharacter(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? { ...skill, level } : skill)
    }));
  };

  const removeSkill = (index: number) => {
    setCharacter(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // --- PSYCHOLOGICAL HANDLERS ---
  const handleBigFiveChange = (dimension: keyof BigFiveTraits, value: number) => {
    const updatedBigFive = { ...character.bigFive, [dimension]: value };

    setCharacter(prev => ({
      ...prev,
      bigFive: updatedBigFive,
    }));

    // Auto-inferir facetas si no hay facetas personalizadas
    if (!enrichedPersonality.facets) {
      const inferredFacets = inferFacetsFromBigFive(updatedBigFive);
      setEnrichedPersonality(prev => ({
        ...prev,
        facets: inferredFacets,
      }));
    }
  };

  const handleFacetsChange = (facets: BigFiveFacets) => {
    setEnrichedPersonality(prev => ({
      ...prev,
      facets,
    }));
  };

  const handleDarkTriadChange = (darkTriad: DarkTriad) => {
    setEnrichedPersonality(prev => ({
      ...prev,
      darkTriad,
    }));
  };

  const handleAttachmentChange = (attachmentProfile: AttachmentProfile) => {
    setEnrichedPersonality(prev => ({
      ...prev,
      attachmentProfile,
    }));
  };

  const handleNeedsChange = (psychologicalNeeds: PsychologicalNeeds) => {
    setEnrichedPersonality(prev => ({
      ...prev,
      psychologicalNeeds,
    }));
  };

  return (
    <div className="w-full font-sans text-slate-200 selection:bg-indigo-500/30">

      {/* HEADER */}
      <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <PenTool size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 leading-tight">PersonaArchitect</h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                {t('header.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700 rounded-lg cursor-pointer">
              <Download size={14}/> {t('actions.export')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !isValid}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg uppercase tracking-wide ${
                isValid && !isSaving
                  ? 'bg-slate-100 text-slate-900 hover:bg-white shadow-white/5 hover:scale-105 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Rocket size={14}/> {isSaving ? t('actions.saving') : t('actions.publish')}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto mt-8 px-4 space-y-8">

        {/* 1. IDENTIDAD */}
        <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <SectionHeader icon={User} title={t('identity.title')} badge={t('identity.badge')} />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Datos Básicos */}
            <div className="md:col-span-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                    {t('identity.name.label')} <span className="text-red-400">*</span>
                  </label>
                  <DarkInput
                    value={character.name}
                    onChange={(e: any) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('identity.name.placeholder')}
                    error={showValidation && !validation.name ? 'Campo obligatorio' : null}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                      {t('identity.age.label')} <span className="text-red-400">*</span>
                    </label>
                    <DarkInput
                      type="number"
                      value={character.age}
                      onChange={(e: any) => setCharacter(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                      placeholder={t('identity.age.placeholder')}
                      error={showValidation && !validation.age ? 'Campo obligatorio' : null}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                      {t('identity.gender.label')} <span className="text-red-400">*</span>
                    </label>
                    <select
                      className={`w-full px-3 py-2 bg-slate-900 border rounded-lg focus:ring-1 text-slate-200 outline-none cursor-pointer ${
                        showValidation && !validation.gender
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-700 focus:ring-indigo-500'
                      }`}
                      value={character.gender || ''}
                      onChange={(e) => setCharacter(prev => ({ ...prev, gender: e.target.value as any }))}
                    >
                      <option value="">{t('identity.gender.placeholder')}</option>
                      <option value="male">{t('identity.gender.options.male')}</option>
                      <option value="female">{t('identity.gender.options.female')}</option>
                      <option value="non-binary">{t('identity.gender.options.nonBinary')}</option>
                    </select>
                    {showValidation && !validation.gender && (
                      <div className="text-xs text-red-400 mt-1">Campo obligatorio</div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                  {t('identity.origin.label')}
                </label>
                <DarkInput
                  value={character.origin}
                  onChange={(e: any) => setCharacter(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder={t('identity.origin.placeholder')}
                />
              </div>

              {/* Descripción Física (para avatar) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                  {t('identity.physicalAppearance.label')} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <textarea
                    ref={physicalDescRef}
                    rows={3}
                    className={`w-full bg-slate-900 border rounded-lg p-3 text-slate-200 focus:ring-1 outline-none text-sm leading-relaxed resize-none ${
                      showValidation && !validation.physicalDescription
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    placeholder={t('identity.physicalAppearance.placeholder')}
                    value={character.physicalDescription}
                    onChange={(e) => setCharacter(prev => ({ ...prev, physicalDescription: e.target.value }))}
                  />
                  {showValidation && !validation.physicalDescription && (
                    <div className="absolute -bottom-5 left-0 text-xs text-red-400">
                      Mínimo 10 caracteres - describe su apariencia física
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {t('identity.physicalAppearance.hint')}
                </p>
              </div>
            </div>

            {/* Avatar Preview */}
            <div className="md:col-span-4 flex flex-col items-center gap-4 border-l border-slate-800 pl-8 pt-2">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full bg-slate-800 border-2 flex items-center justify-center overflow-hidden relative group shadow-lg shadow-black/20 ${
                  showValidation && !validation.avatarUrl ? 'border-red-500' : 'border-slate-700'
                }`}>
                  {character.avatarUrl ? (
                    <img src={character.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-600" />
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                    <Upload size={16} className="text-white"/>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                {showValidation && !validation.avatarUrl && (
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-red-400">
                    Obligatorio
                  </div>
                )}
              </div>
              <div className="w-full mt-2">
                <MagicButton
                  text={t('identity.avatar.generate')}
                  onClick={handleAvatarGeneration}
                  loading={loadingAI.avatar}
                  fullWidth
                  variant="secondary"
                />
                {avatarError && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 text-center animate-pulse">
                    ⚠️ {avatarError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. DESCRIPCIÓN MAESTRA */}
        <section className="bg-slate-900 rounded-xl border border-indigo-500/30 shadow-2xl shadow-indigo-900/10 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} className="text-indigo-400"/>
              <h3 className="text-lg font-bold text-slate-100">{t('description.title')}</h3>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              {t('description.subtitle')}
            </p>

            <textarea
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm leading-relaxed resize-none mb-4 shadow-inner"
              placeholder={t('description.placeholder')}
              value={character.generalDescription}
              onChange={(e) => setCharacter(prev => ({ ...prev, generalDescription: e.target.value }))}
            />

            <MagicButton
              text={t('description.generateAll')}
              onClick={generateAll}
              loading={loadingAI.all}
              fullWidth
              variant="gradient"
              icon={Zap}
            />
          </div>
        </section>

        {/* 3. TOGGLE AVANZADO */}
        <div className="flex justify-center py-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="group flex flex-col items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <span className="text-sm font-semibold uppercase tracking-widest bg-slate-900 px-6 py-2 rounded-full border border-slate-800 group-hover:border-indigo-500/50 shadow-sm transition-all">
              {showAdvanced ? t('advanced.hide') : t('advanced.show')}
            </span>
            {showAdvanced ? <ChevronUp size={20} className="animate-bounce" /> : <ChevronDown size={20} className="animate-bounce" />}
          </button>
        </div>

        {/* 4. SECCIONES AVANZADAS */}
        {showAdvanced && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">

            {/* Personalidad */}
            <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <SectionHeader icon={Brain} title={t('personality.title')} badge={t('personality.badge')} />
                <button
                  onClick={() => setShowAdvancedPsychology(!showAdvancedPsychology)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500/50 rounded-lg transition-all cursor-pointer"
                >
                  {showAdvancedPsychology ? '🔽 Ocultar' : '✨ Mostrar'} Opciones Avanzadas
                </button>
              </div>

              {/* Tabs de Personalidad */}
              <Tabs defaultValue="big-five" className="w-full">
                <TabsList className="grid w-full bg-slate-800/50 border border-slate-700 p-1 rounded-lg" style={{
                  gridTemplateColumns: showAdvancedPsychology ? 'repeat(6, 1fr)' : '1fr'
                }}>
                  <TabsTrigger value="big-five" className="text-xs">
                    Big Five
                  </TabsTrigger>
                  {showAdvancedPsychology && (
                    <>
                      <TabsTrigger value="facets" className="text-xs">
                        Facetas
                      </TabsTrigger>
                      <TabsTrigger value="dark-triad" className="text-xs">
                        Dark Triad
                      </TabsTrigger>
                      <TabsTrigger value="attachment" className="text-xs">
                        Apego
                      </TabsTrigger>
                      <TabsTrigger value="needs" className="text-xs">
                        Necesidades
                      </TabsTrigger>
                      <TabsTrigger value="analysis" className="text-xs">
                        Análisis
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>

                {/* Tab 1: Big Five (Original) */}
                <TabsContent value="big-five" className="mt-6 space-y-8">
                  {/* Prompt Cognitivo */}
                  <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        {t('personality.cognitive.label')}
                      </label>
                    </div>
                    <textarea
                      rows={3}
                      className="w-full bg-transparent border-0 p-0 text-slate-300 placeholder-slate-600 focus:ring-0 text-sm leading-relaxed resize-none"
                      placeholder={t('personality.cognitive.placeholder')}
                      value={character.cognitivePrompt}
                      onChange={(e) => setCharacter(prev => ({ ...prev, cognitivePrompt: e.target.value }))}
                    />
                  </div>

                  {/* Big Five Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    <Slider
                      label={t('personality.bigFive.openness.label')}
                      value={character.bigFive.openness}
                      onChange={(v: number) => handleBigFiveChange('openness', v)}
                    />
                    <Slider
                      label={t('personality.bigFive.conscientiousness.label')}
                      value={character.bigFive.conscientiousness}
                      onChange={(v: number) => handleBigFiveChange('conscientiousness', v)}
                    />
                    <Slider
                      label={t('personality.bigFive.extraversion.label')}
                      value={character.bigFive.extraversion}
                      onChange={(v: number) => handleBigFiveChange('extraversion', v)}
                    />
                    <Slider
                      label={t('personality.bigFive.agreeableness.label')}
                      value={character.bigFive.agreeableness}
                      onChange={(v: number) => handleBigFiveChange('agreeableness', v)}
                    />
                    <Slider
                      label={t('personality.bigFive.neuroticism.label')}
                      value={character.bigFive.neuroticism}
                      onChange={(v: number) => handleBigFiveChange('neuroticism', v)}
                    />
                  </div>

                  {/* Radar Chart de Personalidad */}
                  {(character.bigFive.openness > 0 ||
                    character.bigFive.conscientiousness > 0 ||
                    character.bigFive.extraversion > 0 ||
                    character.bigFive.agreeableness > 0 ||
                    character.bigFive.neuroticism > 0) && (
                    <div className="mt-8 pt-8 border-t border-slate-800">
                      <PersonalityRadarChart
                        bigFive={character.bigFive}
                        values={character.coreValues}
                      />
                    </div>
                  )}

                  {/* Moral Alignment Chart */}
                  {(character.moralAlignment.lawfulness !== 50 ||
                    character.moralAlignment.morality !== 50) && (
                    <div className="mt-8">
                      <MoralAlignmentChart moralAlignment={character.moralAlignment} />
                    </div>
                  )}

                  {/* Contradicciones Internas */}
                  {(character.personalityConflicts.internalContradictions.length > 0 ||
                    character.personalityConflicts.situationalVariations.length > 0) && (
                    <div className="mt-8">
                      <ContradictionsDisplay
                        internalContradictions={character.personalityConflicts.internalContradictions}
                        situationalVariations={character.personalityConflicts.situationalVariations}
                      />
                    </div>
                  )}

                  {/* Evolución de Personalidad */}
                  {character.personalityEvolution && character.personalityEvolution.snapshots.length > 0 && (
                    <div className="mt-8">
                      <PersonalityTimelineDisplay evolution={character.personalityEvolution} />
                    </div>
                  )}

                  {/* Valores y Miedos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                        {t('personality.values.label')}
                      </label>
                      <TagInput
                        tags={character.coreValues}
                        placeholder={t('personality.values.placeholder')}
                        onAdd={(tag: string) => addToArray('coreValues', tag)}
                        onRemove={(idx: number) => removeFromArray('coreValues', idx)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                        {t('personality.fears.label')}
                      </label>
                      <TagInput
                        tags={character.fears}
                        placeholder={t('personality.fears.placeholder')}
                        onAdd={(tag: string) => addToArray('fears', tag)}
                        onRemove={(idx: number) => removeFromArray('fears', idx)}
                      />
                    </div>
                  </div>

                  <MagicButton
                    text={t('personality.generate')}
                    onClick={() => simulateAIGeneration('personality', 1500)}
                    loading={loadingAI.personality}
                    fullWidth
                    variant="secondary"
                  />
                </TabsContent>

                {/* Tab 2: Facetas */}
                {showAdvancedPsychology && (
                  <TabsContent value="facets" className="mt-6">
                    <FacetsTab
                      facets={enrichedPersonality.facets}
                      bigFive={character.bigFive}
                      onChange={handleFacetsChange}
                    />
                  </TabsContent>
                )}

                {/* Tab 3: Dark Triad */}
                {showAdvancedPsychology && (
                  <TabsContent value="dark-triad" className="mt-6">
                    <DarkTriadTab
                      darkTriad={enrichedPersonality.darkTriad}
                      onChange={handleDarkTriadChange}
                    />
                  </TabsContent>
                )}

                {/* Tab 4: Estilo de Apego */}
                {showAdvancedPsychology && (
                  <TabsContent value="attachment" className="mt-6">
                    <AttachmentTab
                      attachment={enrichedPersonality.attachmentProfile}
                      onChange={handleAttachmentChange}
                    />
                  </TabsContent>
                )}

                {/* Tab 5: Necesidades Psicológicas SDT */}
                {showAdvancedPsychology && (
                  <TabsContent value="needs" className="mt-6">
                    <NeedsTab
                      needs={enrichedPersonality.psychologicalNeeds}
                      onChange={handleNeedsChange}
                    />
                  </TabsContent>
                )}

                {/* Tab 6: Análisis Psicológico */}
                {showAdvancedPsychology && (
                  <TabsContent value="analysis" className="mt-6">
                    {enrichedProfile && analysisResult ? (
                      <AnalysisTab profile={enrichedProfile} />
                    ) : (
                      <div className="text-center py-12">
                        <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-sm text-slate-400">
                          Completa las dimensiones psicológicas para ver el análisis
                        </p>
                      </div>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </section>

            {/* Trabajo & Historia */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trabajo */}
              <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <SectionHeader icon={Briefcase} title={t('work.title')} />
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                      {t('work.occupation.label')} <span className="text-red-400">*</span>
                    </label>
                    <DarkInput
                      value={character.occupation}
                      onChange={(e: any) => setCharacter(prev => ({ ...prev, occupation: e.target.value }))}
                      placeholder={t('work.occupation.placeholder')}
                      error={showValidation && !validation.occupation ? 'Campo obligatorio' : null}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                      {t('work.skills.label')}
                    </label>
                    <TagInput
                      tags={character.skills.map(s => s.name)}
                      placeholder={t('work.skills.placeholder')}
                      onAdd={(tag: string) => addSkill(tag)}
                      onRemove={(idx: number) => removeSkill(idx)}
                    />
                  </div>

                  {/* Visualization de Skills */}
                  {character.skills.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-800">
                      <SkillBarsChart skills={character.skills} />
                    </div>
                  )}
                  <MagicButton
                    text={t('work.generate')}
                    onClick={() => simulateAIGeneration('work', 1500)}
                    loading={loadingAI.work}
                    fullWidth
                    variant="secondary"
                  />
                </div>
              </section>

              {/* Historia */}
              <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <SectionHeader icon={BookOpen} title={t('history.title')} />
                <div className="space-y-4">
                  <div className="border-l-2 border-slate-800 pl-4 py-1 space-y-4 max-h-60 overflow-y-auto">
                    {character.importantEvents.length === 0 && (
                      <div className="text-xs text-slate-600 font-mono italic py-4">
                        {t('history.empty')}
                      </div>
                    )}
                    {character.importantEvents.map((event, idx) => (
                      <div key={event.id} className="relative group">
                        <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-700 group-hover:bg-indigo-500 transition-colors" />
                        <span className="text-indigo-400 text-xs font-bold mr-2">{event.year}</span>
                        <span className="text-slate-300 text-xs">{event.title}</span>
                      </div>
                    ))}
                  </div>
                  <MagicButton
                    text={t('history.generate')}
                    onClick={() => simulateAIGeneration('history', 1500)}
                    loading={loadingAI.history}
                    fullWidth
                    variant="secondary"
                  />
                </div>
              </section>
            </div>

            {/* Relaciones Interpersonales */}
            <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <SectionHeader icon={Users} title="Relaciones Interpersonales" />
              <div className="space-y-4">
                {character.importantPeople.length > 0 && (
                  <RelationshipNetworkDisplay
                    people={character.importantPeople}
                    characterName={character.name || "Personaje"}
                  />
                )}

                <MagicButton
                  text={character.importantPeople.length > 0 ? "Refinar Relaciones" : "Generar Relaciones"}
                  onClick={() => simulateAIGeneration('relationships', 1500)}
                  loading={loadingAI.relationships}
                  fullWidth
                  variant="secondary"
                />

                {character.importantPeople.length === 0 && (
                  <div className="text-xs text-center text-slate-500 italic py-4">
                    Las personas importantes moldean quiénes somos
                  </div>
                )}
              </div>
            </section>

            {/* Simulador de Personaje */}
            <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <CharacterSimulator character={character} />
            </section>
          </div>
        )}

      </main>
    </div>
  );
}
