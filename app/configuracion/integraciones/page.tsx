'use client';

import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function IntegracionesPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar API key al montar
  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const res = await fetch('/api/user/api-key');
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (apiKey && !confirm('¿Estás seguro? Esto invalidará tu API key actual y cualquier integración que la use dejará de funcionar.')) {
      return;
    }

    setGenerating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/api-key', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
        setShowApiKey(true);
        setMessage({ type: 'success', text: 'API key generada exitosamente' });
      } else {
        setMessage({ type: 'error', text: 'Error al generar API key' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setGenerating(false);
    }
  };

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setMessage({ type: 'success', text: 'API key copiada al portapapeles' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const deleteApiKey = async () => {
    if (!confirm('¿Estás seguro? Esto invalidará todas las integraciones que usen esta API key.')) {
      return;
    }

    try {
      const res = await fetch('/api/user/api-key', { method: 'DELETE' });
      if (res.ok) {
        setApiKey(null);
        setMessage({ type: 'success', text: 'API key eliminada' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar API key' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Integraciones</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu API key para integraciones externas (Minecraft, aplicaciones mobile, etc.)
        </p>
      </div>

      {/* Mensaje de éxito/error */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* API Key Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">API Key</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Usa esta key para autenticarte desde integraciones externas
            </p>
          </div>
        </div>

        {apiKey ? (
          <div className="space-y-4">
            {/* Display API Key */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 font-mono text-sm overflow-x-auto">
                {showApiKey ? apiKey : '•'.repeat(64)}
              </div>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={showApiKey ? 'Ocultar' : 'Mostrar'}
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button
                onClick={copyApiKey}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Copiar"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={generateApiKey}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                {generating ? 'Regenerando...' : 'Regenerar'}
              </button>
              <button
                onClick={deleteApiKey}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold">Mantén tu API key segura</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>No la compartas públicamente</li>
                  <li>No la subas a repositorios públicos</li>
                  <li>Si crees que fue comprometida, regenerala inmediatamente</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No tienes una API key generada
            </p>
            <button
              onClick={generateApiKey}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generando...' : 'Generar API Key'}
            </button>
          </div>
        )}
      </div>

      {/* Uso de la API Key */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Cómo usar tu API Key</h2>

        <div className="space-y-4">
          {/* Minecraft */}
          <div>
            <h3 className="font-semibold text-lg mb-2">🎮 Minecraft (Mod Blaniel-MC)</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configura el mod con estos comandos:
              </p>
              <pre className="bg-gray-900 dark:bg-black text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
{`/blaniel config apiUrl http://localhost:3000
/blaniel config apiKey ${apiKey || '<tu-api-key>'}`}
              </pre>
            </div>
          </div>

          {/* cURL */}
          <div>
            <h3 className="font-semibold text-lg mb-2">🔧 API REST (cURL)</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ejemplo de uso con cURL:
              </p>
              <pre className="bg-gray-900 dark:bg-black text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
{`curl -H "Authorization: Bearer ${apiKey || '<tu-api-key>'}" \\
     http://localhost:3000/api/v1/minecraft/agents`}
              </pre>
            </div>
          </div>

          {/* JavaScript/TypeScript */}
          <div>
            <h3 className="font-semibold text-lg mb-2">💻 JavaScript/TypeScript</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ejemplo con fetch:
              </p>
              <pre className="bg-gray-900 dark:bg-black text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
{`const response = await fetch('http://localhost:3000/api/v1/minecraft/agents', {
  headers: {
    'Authorization': 'Bearer ${apiKey || '<tu-api-key>'}',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
