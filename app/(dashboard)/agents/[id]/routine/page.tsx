"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoutineCalendar } from "@/components/routine/routine-calendar";
import { RoutineEditor } from "@/components/routine/routine-editor";
import { CurrentActivityDisplay } from "@/components/routine/current-activity-display";

export default function AgentRoutinePage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const [activeTab, setActiveTab] = useState<"view" | "edit">("view");
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSaved() {
    setRefreshKey((prev) => prev + 1);
    setActiveTab("view");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2 text-sm"
              >
                ← Volver
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Rutina del Personaje
              </h1>
              <p className="mt-1 text-gray-600">
                Gestiona la rutina diaria de tu personaje
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Premium
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("view")}
              className={`
                py-4 px-2 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === "view"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }
              `}
            >
              📅 Ver Calendario
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`
                py-4 px-2 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === "edit"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }
              `}
            >
              ⚙️ Configuración
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "view" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Rutina Semanal
                </h2>
                <RoutineCalendar key={refreshKey} agentId={agentId} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current activity */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Actividad Actual
                </h3>
                <CurrentActivityDisplay />
              </div>

              {/* Info card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  💡 Sobre las Rutinas
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>
                      El personaje seguirá esta rutina en su propia zona horaria
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>
                      Las variaciones se generan según su personalidad
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>
                      El nivel de realismo afecta cómo responde según su actividad
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>
                      Puedes regenerar la rutina cuando quieras
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Configuración de Rutina
              </h2>
              <RoutineEditor agentId={agentId} onSaved={handleSaved} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
