'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  User, Briefcase, Brain, BookOpen, Sparkles,
  Plus, X, Upload, RefreshCw,
  PenTool, Download, Rocket, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import type { CharacterDraft } from './types';

/**
 * Modern Dark Character Creator - PersonaArchitect Style
 */
export function CVStyleCreator() {
  const router = useRouter();
  const t = useTranslations('characterCreation');

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loadingAI, setLoadingAI] = useState({
    identity: false,
    work: false,
    personality: false,
    relationships: false,
    history: false,
    avatar: false,
    all: false
  });

  const [character, setCharacter] = useState<CharacterDraft>({
    // Identidad
    name: '',
    age: undefined,
    gender: undefined,
    origin: '',
    physicalDescription: '', // Prompt maestro
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

    // Relaciones
    importantPeople: [],
    maritalStatus: undefined,

    // Historia
    importantEvents: [],
    traumas: [],
    personalAchievements: [],
  });

  const [isSaving, setIsSaving] = useState(false);

  // --- AI GENERATION HANDLERS ---
  const generateAll = async () => {
    if (!character.physicalDescription.trim()) {
      alert(t('description.errors.needDescription'));
      return;
    }

    setLoadingAI(prev => ({ ...prev, all: true }));
    setShowAdvanced(true);

    try {
      // Simulación de cascada de generación
      await Promise.all([
        simulateAIGeneration('identity', 500),
        simulateAIGeneration('avatar', 1000),
        simulateAIGeneration('personality', 1500),
        simulateAIGeneration('work', 2000),
        simulateAIGeneration('history', 2500),
      ]);
    } finally {
      setLoadingAI(prev => ({ ...prev, all: false }));
    }
  };

  const simulateAIGeneration = async (section: string, delay: number = 1500) => {
    setLoadingAI(prev => ({ ...prev, [section]: true }));

    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        try {
          // Aquí irían las llamadas reales a la API
          const response = await fetch(`/api/character-creation/generate-${section}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              description: character.physicalDescription,
              name: character.name,
              age: character.age,
              gender: character.gender,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            updateCharacterFromAI(section, result);
          }
        } catch (error) {
          console.error(`Failed to generate ${section}:`, error);
        } finally {
          setLoadingAI(prev => ({ ...prev, [section]: false }));
          resolve();
        }
      }, delay);
    });
  };

  const updateCharacterFromAI = (section: string, data: any) => {
    setCharacter(prev => {
      switch (section) {
        case 'identity':
          return { ...prev, name: data.name, age: data.age, gender: data.gender, origin: data.origin };
        case 'avatar':
          return { ...prev, avatarUrl: data.url };
        case 'work':
          return { ...prev, occupation: data.occupation, skills: data.skills, achievements: data.achievements };
        case 'personality':
          return { ...prev, bigFive: data.bigFive, coreValues: data.values, fears: data.fears, cognitivePrompt: data.cognitivePrompt };
        case 'history':
          return { ...prev, importantEvents: data.events, traumas: data.traumas, personalAchievements: data.achievements };
        default:
          return prev;
      }
    });
  };

  const handleAvatarGeneration = async () => {
    if (!character.physicalDescription) {
      alert(t('identity.avatar.errors.needDescription'));
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

      if (response.ok) {
        const result = await response.json();
        setCharacter(prev => ({ ...prev, avatarUrl: result.url }));
      }
    } catch (error) {
      console.error('Failed to generate avatar:', error);
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
    const isValid = character.name && character.age && character.gender && character.physicalDescription && character.occupation;

    if (!isValid) {
      alert(t('status.fillRequired'));
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Llamar a API para crear personaje
      console.log('Saving character:', character);

      // Redirect to character page
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save character:', error);
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

  // --- SUB-COMPONENTS ---
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
        ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : ''}
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

  const DarkInput = ({ value, onChange, placeholder, type = "text" }: any) => (
    <input
      type={type}
      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200 placeholder-slate-600 transition-all"
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
    />
  );

  const TagInput = ({ tags, onAdd, onRemove, placeholder }: any) => {
    const [input, setInput] = useState('');
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag: string, i: number) => (
            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono text-indigo-300 bg-indigo-900/30 border border-indigo-500/30">
              {tag}
              <button onClick={() => onRemove(i)} className="ml-2 text-indigo-400 hover:text-indigo-200">
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
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400"
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
      <div className="relative w-full h-2 bg-slate-800 rounded-full">
        <div
          className="absolute h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full"
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

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 pb-20 selection:bg-indigo-500/30">

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
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700 rounded-lg">
              <Download size={14}/> {t('actions.export')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg text-xs font-bold hover:bg-white transition-colors shadow-lg shadow-white/5 uppercase tracking-wide disabled:opacity-50"
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
                    {t('identity.name.label')}
                  </label>
                  <DarkInput
                    value={character.name}
                    onChange={(e: any) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('identity.name.placeholder')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                      {t('identity.age.label')}
                    </label>
                    <DarkInput
                      type="number"
                      value={character.age}
                      onChange={(e: any) => setCharacter(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                      placeholder={t('identity.age.placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                      {t('identity.gender.label')}
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-200 outline-none"
                      value={character.gender || ''}
                      onChange={(e) => setCharacter(prev => ({ ...prev, gender: e.target.value as any }))}
                    >
                      <option value="">{t('identity.gender.placeholder')}</option>
                      <option value="male">{t('identity.gender.options.male')}</option>
                      <option value="female">{t('identity.gender.options.female')}</option>
                      <option value="non-binary">{t('identity.gender.options.nonBinary')}</option>
                    </select>
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
            </div>

            {/* Avatar Preview */}
            <div className="md:col-span-4 flex flex-col items-center gap-4 border-l border-slate-800 pl-8 pt-2">
              <div className="w-32 h-32 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden relative group shadow-lg shadow-black/20">
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
              <div className="w-full">
                <MagicButton
                  text={t('identity.avatar.generate')}
                  onClick={handleAvatarGeneration}
                  loading={loadingAI.avatar}
                  fullWidth
                  variant="secondary"
                />
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
              value={character.physicalDescription}
              onChange={(e) => setCharacter(prev => ({ ...prev, physicalDescription: e.target.value }))}
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
            className="group flex flex-col items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors"
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
              <SectionHeader icon={Brain} title={t('personality.title')} badge={t('personality.badge')} />

              <div className="space-y-8">
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
                    onChange={(v: number) => setCharacter(prev => ({
                      ...prev,
                      bigFive: { ...prev.bigFive, openness: v }
                    }))}
                  />
                  <Slider
                    label={t('personality.bigFive.conscientiousness.label')}
                    value={character.bigFive.conscientiousness}
                    onChange={(v: number) => setCharacter(prev => ({
                      ...prev,
                      bigFive: { ...prev.bigFive, conscientiousness: v }
                    }))}
                  />
                  <Slider
                    label={t('personality.bigFive.extraversion.label')}
                    value={character.bigFive.extraversion}
                    onChange={(v: number) => setCharacter(prev => ({
                      ...prev,
                      bigFive: { ...prev.bigFive, extraversion: v }
                    }))}
                  />
                  <Slider
                    label={t('personality.bigFive.agreeableness.label')}
                    value={character.bigFive.agreeableness}
                    onChange={(v: number) => setCharacter(prev => ({
                      ...prev,
                      bigFive: { ...prev.bigFive, agreeableness: v }
                    }))}
                  />
                  <Slider
                    label={t('personality.bigFive.neuroticism.label')}
                    value={character.bigFive.neuroticism}
                    onChange={(v: number) => setCharacter(prev => ({
                      ...prev,
                      bigFive: { ...prev.bigFive, neuroticism: v }
                    }))}
                  />
                </div>

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
              </div>
            </section>

            {/* Trabajo & Historia */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trabajo */}
              <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <SectionHeader icon={Briefcase} title={t('work.title')} />
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                      {t('work.occupation.label')}
                    </label>
                    <DarkInput
                      value={character.occupation}
                      onChange={(e: any) => setCharacter(prev => ({ ...prev, occupation: e.target.value }))}
                      placeholder={t('work.occupation.placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                      {t('work.skills.label')}
                    </label>
                    <TagInput
                      tags={character.skills}
                      placeholder={t('work.skills.placeholder')}
                      onAdd={(tag: string) => addToArray('skills', tag)}
                      onRemove={(idx: number) => removeFromArray('skills', idx)}
                    />
                  </div>
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
          </div>
        )}

      </main>
    </div>
  );
}
