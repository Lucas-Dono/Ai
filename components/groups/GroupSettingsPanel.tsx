"use client";

import { useState } from "react";
import { Save, Loader2, Settings, Zap, BookOpen, Sparkles } from "lucide-react";

interface GroupSettingsPanelProps {
  groupId: string;
  initialSettings: {
    name: string;
    description?: string | null;
    visibility: string;
    allowUserMessages: boolean;
    autoAIResponses: boolean;
    responseDelay: number;
    storyMode: boolean;
    directorEnabled: boolean;
    emergentEventsEnabled: boolean;
    allowEmotionalBonds: boolean;
    allowConflicts: boolean;
  };
  userPlan?: string;
  onSettingsUpdated?: () => void;
}

export function GroupSettingsPanel({
  groupId,
  initialSettings,
  userPlan = "free",
  onSettingsUpdated,
}: GroupSettingsPanelProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isPlusOrUltra = userPlan === "plus" || userPlan === "ultra";
  const isUltra = userPlan === "ultra";

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al guardar configuración");
      }

      setSuccess(true);
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Configuración Básica</h3>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Nombre del Grupo
          </label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) =>
              setSettings({ ...settings, name: e.target.value })
            }
            className="w-full px-4 py-3 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Descripción
          </label>
          <textarea
            value={settings.description || ""}
            onChange={(e) =>
              setSettings({ ...settings, description: e.target.value })
            }
            className="w-full px-4 py-3 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Visibilidad
          </label>
          <select
            value={settings.visibility}
            onChange={(e) =>
              setSettings({ ...settings, visibility: e.target.value })
            }
            className="w-full px-4 py-3 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="private">Privado</option>
            <option value="invite_only">Solo por invitación</option>
            <option value="public">Público</option>
          </select>
        </div>
      </div>

      {/* AI Behavior */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Comportamiento de IAs</h3>
        </div>

        {/* Allow user messages */}
        <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={settings.allowUserMessages}
            onChange={(e) =>
              setSettings({
                ...settings,
                allowUserMessages: e.target.checked,
              })
            }
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium">Permitir mensajes de usuarios</div>
            <div className="text-sm text-muted-foreground">
              Los usuarios pueden enviar mensajes al grupo
            </div>
          </div>
        </label>

        {/* Auto AI responses */}
        <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={settings.autoAIResponses}
            onChange={(e) =>
              setSettings({
                ...settings,
                autoAIResponses: e.target.checked,
              })
            }
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium">Respuestas automáticas de IAs</div>
            <div className="text-sm text-muted-foreground">
              Las IAs responderán automáticamente a los mensajes
            </div>
          </div>
        </label>

        {/* Response delay */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Delay entre respuestas de IAs (ms)
          </label>
          <input
            type="number"
            value={settings.responseDelay}
            onChange={(e) =>
              setSettings({
                ...settings,
                responseDelay: parseInt(e.target.value),
              })
            }
            min={0}
            max={30000}
            step={500}
            className="w-full px-4 py-3 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Tiempo de espera entre respuestas de diferentes IAs
          </p>
        </div>

        {/* Emotional bonds */}
        <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={settings.allowEmotionalBonds}
            onChange={(e) =>
              setSettings({
                ...settings,
                allowEmotionalBonds: e.target.checked,
              })
            }
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium">Permitir lazos emocionales</div>
            <div className="text-sm text-muted-foreground">
              Las IAs pueden formar relaciones con usuarios y otras IAs
            </div>
          </div>
        </label>

        {/* Allow conflicts */}
        <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={settings.allowConflicts}
            onChange={(e) =>
              setSettings({
                ...settings,
                allowConflicts: e.target.checked,
              })
            }
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium">Permitir conflictos</div>
            <div className="text-sm text-muted-foreground">
              Las IAs pueden tener desacuerdos y tensiones
            </div>
          </div>
        </label>
      </div>

      {/* Advanced Features (Plus/Ultra) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Features Avanzadas</h3>
          {!isPlusOrUltra && (
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded">
              Plus/Ultra
            </span>
          )}
        </div>

        {/* Story Mode */}
        <label
          className={`flex items-start gap-3 p-4 rounded-lg border border-border cursor-pointer transition-all ${
            isPlusOrUltra
              ? "hover:border-primary/50"
              : "opacity-60 cursor-not-allowed"
          }`}
        >
          <input
            type="checkbox"
            checked={settings.storyMode}
            onChange={(e) =>
              isPlusOrUltra &&
              setSettings({
                ...settings,
                storyMode: e.target.checked,
              })
            }
            className="mt-1"
            disabled={!isPlusOrUltra}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Story Mode</span>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-sm text-muted-foreground">
              Narrativa guiada con arcos de historia y beats narrativos
            </div>
            {!isPlusOrUltra && (
              <div className="text-xs text-primary mt-1">
                Requiere plan Plus o Ultra
              </div>
            )}
          </div>
        </label>

        {/* AI Director */}
        <label
          className={`flex items-start gap-3 p-4 rounded-lg border border-border cursor-pointer transition-all ${
            isPlusOrUltra
              ? "hover:border-primary/50"
              : "opacity-60 cursor-not-allowed"
          }`}
        >
          <input
            type="checkbox"
            checked={settings.directorEnabled}
            onChange={(e) =>
              isPlusOrUltra &&
              setSettings({
                ...settings,
                directorEnabled: e.target.checked,
              })
            }
            className="mt-1"
            disabled={!isPlusOrUltra}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">AI Director</span>
              <Sparkles className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-sm text-muted-foreground">
              Director IA que guía la narrativa y eventos del grupo
            </div>
            {!isPlusOrUltra && (
              <div className="text-xs text-primary mt-1">
                Requiere plan Plus o Ultra
              </div>
            )}
          </div>
        </label>

        {/* Emergent Events */}
        <label
          className={`flex items-start gap-3 p-4 rounded-lg border border-border cursor-pointer transition-all ${
            isPlusOrUltra
              ? "hover:border-primary/50"
              : "opacity-60 cursor-not-allowed"
          }`}
        >
          <input
            type="checkbox"
            checked={settings.emergentEventsEnabled}
            onChange={(e) =>
              isPlusOrUltra &&
              setSettings({
                ...settings,
                emergentEventsEnabled: e.target.checked,
              })
            }
            className="mt-1"
            disabled={!isPlusOrUltra}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Eventos Emergentes</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-sm text-muted-foreground">
              Eventos inesperados que ocurren durante las conversaciones
            </div>
            {!isPlusOrUltra && (
              <div className="text-xs text-primary mt-1">
                Requiere plan Plus o Ultra
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Error/Success */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
          Configuración guardada exitosamente
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!hasChanges || isSaving}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Guardando...</span>
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            <span>Guardar Cambios</span>
          </>
        )}
      </button>
    </div>
  );
}
