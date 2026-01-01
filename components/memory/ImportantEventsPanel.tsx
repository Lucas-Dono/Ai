"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  X,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

interface ImportantEvent {
  id: string;
  eventDate: string;
  type: "birthday" | "medical" | "exam" | "special" | "anniversary" | "other";
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  relationship?: string;
  emotionalTone?: string;
  mentioned: boolean;
  eventHappened: boolean;
  userFeedback?: string;
  isRecurring: boolean;
  source?: "agent" | "user"; // Identificador de origen
}

interface ImportantEventsPanelProps {
  agentId: string;
}

const eventTypeLabels: Record<string, string> = {
  birthday: "Cumpleaños",
  medical: "Médico",
  exam: "Examen",
  special: "Especial",
  anniversary: "Aniversario",
  other: "Otro",
};

const eventTypeColors: Record<string, string> = {
  birthday: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  medical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  exam: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  special: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  anniversary: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const priorityColors: Record<string, string> = {
  low: "text-gray-500",
  medium: "text-yellow-500",
  high: "text-orange-500",
  critical: "text-red-500",
};

export function ImportantEventsPanel({ agentId }: ImportantEventsPanelProps) {
  const [events, setEvents] = useState<ImportantEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ImportantEvent | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    eventDate: "",
    type: "special" as ImportantEvent["type"],
    description: "",
    priority: "medium" as ImportantEvent["priority"],
    relationship: "",
    emotionalTone: "neutral",
    isRecurring: false,
  });

  useEffect(() => {
    fetchEvents();
  }, [agentId, filterType, filterPriority]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let url = `/api/agents/${agentId}/events?includeAgentEvents=true&`; // ← Incluir eventos del agente
      if (filterType !== "all") url += `type=${filterType}&`;
      if (filterPriority !== "all") url += `priority=${filterPriority}&`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEvent) {
        // Update existing event
        const res = await fetch(
          `/api/agents/${agentId}/events/${editingEvent.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
        if (!res.ok) throw new Error("Failed to update event");
      } else {
        // Create new event
        const res = await fetch(`/api/agents/${agentId}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to create event");
      }

      // Reset form
      setFormData({
        eventDate: "",
        type: "special",
        description: "",
        priority: "medium",
        relationship: "",
        emotionalTone: "neutral",
        isRecurring: false,
      });
      setShowForm(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Error al guardar el evento");
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;

    try {
      const res = await fetch(`/api/agents/${agentId}/events/${eventId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete event");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error al eliminar el evento");
    }
  };

  const handleEdit = (event: ImportantEvent) => {
    setEditingEvent(event);
    setFormData({
      eventDate: event.eventDate.split("T")[0],
      type: event.type,
      description: event.description,
      priority: event.priority,
      relationship: event.relationship || "",
      emotionalTone: event.emotionalTone || "neutral",
      isRecurring: event.isRecurring,
    });
    setShowForm(true);
  };

  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return differenceInDays(eventDate, today);
  };

  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Eventos Importantes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gestiona eventos que tu IA debe recordar
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setFormData({
              eventDate: "",
              type: "special",
              description: "",
              priority: "medium",
              relationship: "",
              emotionalTone: "neutral",
              isRecurring: false,
            });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Nuevo Evento"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">Todos los tipos</option>
            {Object.entries(eventTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="critical">Crítica</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">
            {editingEvent ? "Editar Evento" : "Nuevo Evento"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fecha del Evento
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as ImportantEvent["type"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
                >
                  {Object.entries(eventTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={3}
                placeholder="Ej: Cirugía de Max (perro)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Prioridad
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as ImportantEvent["priority"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Relación
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) =>
                    setFormData({ ...formData, relationship: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
                >
                  <option value="">Sin especificar</option>
                  <option value="user">Usuario</option>
                  <option value="family">Familia</option>
                  <option value="pet">Mascota</option>
                  <option value="friend">Amigo</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) =>
                  setFormData({ ...formData, isRecurring: e.target.checked })
                }
                className="rounded"
              />
              <label htmlFor="isRecurring" className="text-sm">
                Evento recurrente (se repite cada año)
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl transition-colors"
              >
                {editingEvent ? "Actualizar" : "Crear Evento"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-2xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            No hay eventos registrados
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Eventos del Agente (Historia/Pasado) */}
          {sortedEvents.filter(e => e.source === 'agent').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Historia del Personaje
                </h3>
                <span className="text-sm text-gray-500">
                  ({sortedEvents.filter(e => e.source === 'agent').length} eventos)
                </span>
              </div>
              <div className="space-y-3">
                {sortedEvents.filter(e => e.source === 'agent').map((event) => {
            const daysUntil = getDaysUntil(event.eventDate);
            const isPast = daysUntil < 0;
            const isToday = daysUntil === 0;
            const isSoon = daysUntil > 0 && daysUntil <= 7;

            return (
              <div
                key={event.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-2 transition-all ${
                  isToday
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : isSoon
                    ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                    : isPast
                    ? "border-gray-300 dark:border-gray-700 opacity-60"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          eventTypeColors[event.type]
                        }`}
                      >
                        {eventTypeLabels[event.type]}
                      </span>
                      <AlertCircle
                        className={`w-4 h-4 ${
                          priorityColors[event.priority]
                        }`}
                      />
                      {event.isRecurring && (
                        <span className="text-xs text-gray-500">
                          🔄 Recurrente
                        </span>
                      )}
                    </div>

                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(event.eventDate), "d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {isToday
                          ? "¡Hoy!"
                          : isPast
                          ? `Hace ${Math.abs(daysUntil)} días`
                          : `En ${daysUntil} días`}
                      </span>
                    </div>

                    {event.eventHappened && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Evento completado</span>
                        {event.userFeedback && (
                          <span className="text-gray-600 dark:text-gray-400">
                            • {event.userFeedback}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-2xl transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
              </div>
            </div>
          )}

          {/* Eventos del Usuario */}
          {sortedEvents.filter(e => e.source === 'user').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Eventos del Usuario
                </h3>
                <span className="text-sm text-gray-500">
                  ({sortedEvents.filter(e => e.source === 'user').length} eventos)
                </span>
              </div>
              <div className="space-y-3">
                {sortedEvents.filter(e => e.source === 'user').map((event) => {
            const daysUntil = getDaysUntil(event.eventDate);
            const isPast = daysUntil < 0;
            const isToday = daysUntil === 0;
            const isSoon = daysUntil > 0 && daysUntil <= 7;

            return (
              <div
                key={event.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-2 transition-all ${
                  isToday
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : isSoon
                    ? "border-orange-300 bg-orange-50 dark:bg-orange-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          eventTypeColors[event.type]
                        }`}
                      >
                        {eventTypeLabels[event.type]}
                      </span>
                      {event.isRecurring && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Recurrente
                        </span>
                      )}
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500 text-white">
                          ¡Hoy!
                        </span>
                      )}
                      {isSoon && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">
                          Próximamente
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {event.description}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(event.eventDate), "d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </div>

                      {!isPast && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {daysUntil === 0
                            ? "Hoy"
                            : `En ${Math.abs(daysUntil)} día${
                                Math.abs(daysUntil) !== 1 ? "s" : ""
                              }`}
                        </div>
                      )}

                      {event.relationship && (
                        <span className="text-purple-600 dark:text-purple-400">
                          {event.relationship}
                        </span>
                      )}
                    </div>

                    {event.emotionalTone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                        {event.emotionalTone}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <div title={`Prioridad: ${event.priority}`}>
                      <AlertCircle
                        className={`w-5 h-5 ${
                          priorityColors[event.priority]
                        }`}
                      />
                    </div>
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-2xl transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
