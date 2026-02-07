"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Bell, Clock, Settings, Save, Loader2 } from 'lucide-react';

interface EmailConfig {
  frequency: 'instant' | 'daily' | 'weekly' | 'disabled';
  newComments: boolean;
  newReplies: boolean;
  postUpdates: boolean;
  digestSummary: boolean;
  digestDay?: string;
  digestTime: string;
}

export function EmailPreferencesPanel() {
  const [config, setConfig] = useState<EmailConfig>({
    frequency: 'instant',
    newComments: true,
    newReplies: true,
    postUpdates: true,
    digestSummary: true,
    digestTime: '09:00'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/community/posts/following/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.emailConfig) {
          setConfig(data.emailConfig);
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/community/posts/following/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailConfig: config })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Preferencias guardadas correctamente' });
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar las preferencias' });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates: Partial<EmailConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Cargando preferencias...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <Mail className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Preferencias de Email</h2>
        </div>
        <p className="text-muted-foreground">
          Configura cómo y cuándo quieres recibir notificaciones por email
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Frecuencia */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Frecuencia de Notificaciones
          </label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { value: 'instant', label: 'Instantáneo', desc: 'Recibe un email por cada notificación' },
              { value: 'daily', label: 'Diario', desc: 'Un resumen al día' },
              { value: 'weekly', label: 'Semanal', desc: 'Un resumen a la semana' },
              { value: 'disabled', label: 'Desactivado', desc: 'No recibir emails' }
            ].map(option => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateConfig({ frequency: option.value as any })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  config.frequency === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium text-foreground mb-1">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tipos de notificaciones (solo si no está disabled) */}
        {config.frequency !== 'disabled' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Tipos de Notificaciones
            </label>
            <div className="space-y-3">
              {[
                { key: 'newComments', label: 'Nuevos comentarios en posts seguidos', desc: 'Te notificaremos cuando alguien comente en un post que sigues' },
                { key: 'newReplies', label: 'Respuestas a tus comentarios', desc: 'Cuando alguien responda directamente a tus comentarios' },
                { key: 'postUpdates', label: 'Actualizaciones de posts', desc: 'Cuando el autor actualice un post que sigues' },
                { key: 'digestSummary', label: 'Incluir en resumen', desc: 'Incluir actividad en digests diarios/semanales' }
              ].map(option => (
                <label
                  key={option.key}
                  className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={config[option.key as keyof EmailConfig] as boolean}
                    onChange={(e) => updateConfig({ [option.key]: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Configuración de digest (solo para daily/weekly) */}
        {(config.frequency === 'daily' || config.frequency === 'weekly') && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración de Resumen
            </label>
            <div className="space-y-4 p-4 bg-accent/50 rounded-lg">
              {config.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Día de la semana
                  </label>
                  <select
                    value={config.digestDay || 'monday'}
                    onChange={(e) => updateConfig({ digestDay: e.target.value })}
                    className="w-full md:w-auto px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="monday">Lunes</option>
                    <option value="tuesday">Martes</option>
                    <option value="wednesday">Miércoles</option>
                    <option value="thursday">Jueves</option>
                    <option value="friday">Viernes</option>
                    <option value="saturday">Sábado</option>
                    <option value="sunday">Domingo</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hora del día
                </label>
                <input
                  type="time"
                  value={config.digestTime}
                  onChange={(e) => updateConfig({ digestTime: e.target.value })}
                  className="w-full md:w-auto px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                : 'bg-red-500/10 text-red-600 border border-red-500/20'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Save Button */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={savePreferences}
            disabled={saving}
            className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Guardar Preferencias
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
