"use client";

import { useState } from "react";
import type { RealismLevel } from "@/types/routine";

interface RoutineEditorProps {
  agentId: string;
  onSaved?: () => void;
  className?: string;
}

interface RoutineSettings {
  enabled: boolean;
  timezone: string;
  realismLevel: RealismLevel;
  autoGenerateVariations: boolean;
  variationIntensity: number;
}

const REALISM_LEVELS: { value: RealismLevel; label: string; description: string }[] = [
  {
    value: "subtle",
    label: "Sutil",
    description: "Solo agrega contexto a las respuestas, no afecta disponibilidad",
  },
  {
    value: "moderate",
    label: "Moderado",
    description: "Afecta tono y velocidad de respuesta según actividad",
  },
  {
    value: "immersive",
    label: "Inmersivo",
    description: "Puede bloquear respuestas si está ocupado (máximo realismo)",
  },
];

const COMMON_TIMEZONES = [
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
  { value: "America/Santiago", label: "Santiago (GMT-3/4)" },
  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (GMT-8)" },
  { value: "America/New_York", label: "Nueva York (GMT-5)" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1)" },
  { value: "Europe/London", label: "Londres (GMT+0)" },
];

export function RoutineEditor({
  agentId,
  onSaved,
  className = "",
}: RoutineEditorProps) {
  const [settings, setSettings] = useState<RoutineSettings>({
    enabled: true,
    timezone: "America/Argentina/Buenos_Aires",
    realismLevel: "moderate",
    autoGenerateVariations: true,
    variationIntensity: 0.5,
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/agents/${agentId}/routine`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        onSaved?.();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving routine:", error);
      alert("Error al guardar configuración");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    if (!confirm("¿Regenerar la rutina completa? Esto reemplazará todas las actividades actuales.")) {
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(`/api/v1/agents/${agentId}/routine/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone: settings.timezone,
          realismLevel: settings.realismLevel,
        }),
      });

      if (response.ok) {
        alert("✅ Rutina regenerada exitosamente");
        onSaved?.();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error regenerating routine:", error);
      alert("Error al regenerar rutina");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enable/Disable */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="enabled"
          checked={settings.enabled}
          onChange={(e) =>
            setSettings({ ...settings, enabled: e.target.checked })
          }
          className="w-5 h-5 text-blue-600 rounded"
        />
        <label htmlFor="enabled" className="flex-1">
          <div className="font-medium text-gray-900">Activar rutina</div>
          <div className="text-sm text-gray-600">
            El personaje seguirá su rutina diaria y responderá acorde
          </div>
        </label>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Zona horaria del personaje
        </label>
        <select
          value={settings.timezone}
          onChange={(e) =>
            setSettings({ ...settings, timezone: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          La rutina se ejecutará en la zona horaria del personaje, no la tuya
        </p>
      </div>

      {/* Realism Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Nivel de realismo
        </label>
        <div className="space-y-2">
          {REALISM_LEVELS.map((level) => (
            <label
              key={level.value}
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer
                transition-colors
                ${
                  settings.realismLevel === level.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <input
                type="radio"
                name="realismLevel"
                value={level.value}
                checked={settings.realismLevel === level.value}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    realismLevel: e.target.value as RealismLevel,
                  })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{level.label}</div>
                <div className="text-sm text-gray-600">{level.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Variation Intensity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Intensidad de variaciones: {Math.round(settings.variationIntensity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.variationIntensity}
          onChange={(e) =>
            setSettings({
              ...settings,
              variationIntensity: parseFloat(e.target.value),
            })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Predecible</span>
          <span>Caótico</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Controla cuánto puede variar de su rutina (llegar tarde, saltarse actividades, etc.)
        </p>
      </div>

      {/* Auto-generate variations */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="autoGenerateVariations"
          checked={settings.autoGenerateVariations}
          onChange={(e) =>
            setSettings({
              ...settings,
              autoGenerateVariations: e.target.checked,
            })
          }
          className="w-5 h-5 text-blue-600 rounded"
        />
        <label htmlFor="autoGenerateVariations" className="flex-1">
          <div className="font-medium text-gray-900">
            Variaciones automáticas
          </div>
          <div className="text-sm text-gray-600">
            Genera variaciones basadas en personalidad (recomendado)
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Guardando..." : "Guardar configuración"}
        </button>
        <button
          onClick={handleRegenerate}
          disabled={generating}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {generating ? "Generando..." : "🔄 Regenerar"}
        </button>
      </div>
    </div>
  );
}
