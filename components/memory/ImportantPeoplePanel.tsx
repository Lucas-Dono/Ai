"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Heart,
  MessageCircle,
  Cake,
  X,
  Filter,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

interface ImportantPerson {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  gender?: string;
  description?: string;
  interests?: string;
  healthInfo?: string;
  birthday?: string;
  lastMentioned?: string;
  mentionCount: number;
  importance: "low" | "medium" | "high";
}

interface ImportantPeoplePanelProps {
  agentId: string;
}

const importanceColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const importanceLabels: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export function ImportantPeoplePanel({ agentId }: ImportantPeoplePanelProps) {
  const [people, setPeople] = useState<ImportantPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<ImportantPerson | null>(
    null
  );
  const [filterRelationship, setFilterRelationship] = useState<string>("all");
  const [filterImportance, setFilterImportance] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    age: "",
    gender: "unknown",
    description: "",
    interests: "",
    healthInfo: "",
    birthday: "",
    importance: "medium" as ImportantPerson["importance"],
  });

  useEffect(() => {
    fetchPeople();
  }, [agentId, filterRelationship, filterImportance]);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      let url = `/api/agents/${agentId}/people?`;
      if (filterRelationship !== "all")
        url += `relationship=${filterRelationship}&`;
      if (filterImportance !== "all") url += `importance=${filterImportance}&`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch people");
      const data = await res.json();
      setPeople(data.people || []);
    } catch (error) {
      console.error("Error fetching people:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        birthday: formData.birthday || undefined,
      };

      if (editingPerson) {
        // Update existing person
        const res = await fetch(
          `/api/agents/${agentId}/people/${editingPerson.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error("Failed to update person");
      } else {
        // Create new person
        const res = await fetch(`/api/agents/${agentId}/people`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create person");
      }

      // Reset form
      setFormData({
        name: "",
        relationship: "",
        age: "",
        gender: "unknown",
        description: "",
        interests: "",
        healthInfo: "",
        birthday: "",
        importance: "medium",
      });
      setShowForm(false);
      setEditingPerson(null);
      fetchPeople();
    } catch (error) {
      console.error("Error saving person:", error);
      alert("Error al guardar la persona");
    }
  };

  const handleDelete = async (personId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta persona?")) return;

    try {
      const res = await fetch(`/api/agents/${agentId}/people/${personId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete person");
      fetchPeople();
    } catch (error) {
      console.error("Error deleting person:", error);
      alert("Error al eliminar la persona");
    }
  };

  const handleEdit = (person: ImportantPerson) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      relationship: person.relationship,
      age: person.age?.toString() || "",
      gender: person.gender || "unknown",
      description: person.description || "",
      interests: person.interests || "",
      healthInfo: person.healthInfo || "",
      birthday: person.birthday
        ? new Date(person.birthday).toISOString().split("T")[0]
        : "",
      importance: person.importance,
    });
    setShowForm(true);
  };

  const getUpcomingBirthday = (birthdayString?: string) => {
    if (!birthdayString) return null;

    const birthday = new Date(birthdayString);
    const today = new Date();
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthday.getMonth(),
      birthday.getDate()
    );

    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
    }

    const daysUntil = differenceInDays(thisYearBirthday, today);
    return { date: thisYearBirthday, daysUntil };
  };

  // Get unique relationships for filter
  const uniqueRelationships = Array.from(
    new Set(people.map((p) => p.relationship))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Personas Importantes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gestiona personas que tu IA debe recordar
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPerson(null);
            setFormData({
              name: "",
              relationship: "",
              age: "",
              gender: "unknown",
              description: "",
              interests: "",
              healthInfo: "",
              birthday: "",
              importance: "medium",
            });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Agregar Persona"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterRelationship}
            onChange={(e) => setFilterRelationship(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">Todas las relaciones</option>
            {uniqueRelationships.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
        </div>

        <select
          value={filterImportance}
          onChange={(e) => setFilterImportance(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">Todas las importancias</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">
            {editingPerson ? "Editar Persona" : "Nueva Persona"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Ej: Ana"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Relación *
                </label>
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) =>
                    setFormData({ ...formData, relationship: e.target.value })
                  }
                  required
                  placeholder="Ej: hermana, mascota, amigo"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Edad</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  placeholder="25"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Género</label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
                >
                  <option value="unknown">No especificado</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Cumpleaños
                </label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) =>
                    setFormData({ ...formData, birthday: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
                />
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
                rows={2}
                placeholder="Vive en Córdoba, estudia medicina..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Intereses
              </label>
              <input
                type="text"
                value={formData.interests}
                onChange={(e) =>
                  setFormData({ ...formData, interests: e.target.value })
                }
                placeholder="Le gusta el anime, el gaming..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Información de Salud
              </label>
              <input
                type="text"
                value={formData.healthInfo}
                onChange={(e) =>
                  setFormData({ ...formData, healthInfo: e.target.value })
                }
                placeholder="Tiene diabetes, se recupera de cirugía..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Importancia
              </label>
              <select
                value={formData.importance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    importance: e.target.value as ImportantPerson["importance"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl transition-colors"
              >
                {editingPerson ? "Actualizar" : "Agregar Persona"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPerson(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-2xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* People List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : people.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            No hay personas registradas
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {people.map((person) => {
            const birthdayInfo = getUpcomingBirthday(person.birthday);
            const isBirthdaySoon =
              birthdayInfo && birthdayInfo.daysUntil <= 30;

            return (
              <div
                key={person.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border-2 transition-all ${
                  isBirthdaySoon
                    ? "border-pink-400 bg-pink-50 dark:bg-pink-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {person.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {person.relationship}
                        {person.age && ` • ${person.age} años`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(person)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(person.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-2xl transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>

                {person.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {person.description}
                  </p>
                )}

                <div className="space-y-2">
                  {person.interests && (
                    <div className="flex items-start gap-2 text-sm">
                      <Heart className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {person.interests}
                      </span>
                    </div>
                  )}

                  {person.healthInfo && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-red-500 text-xs mt-0.5">❤️+</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {person.healthInfo}
                      </span>
                    </div>
                  )}

                  {birthdayInfo && (
                    <div className="flex items-center gap-2 text-sm">
                      <Cake className="w-4 h-4 text-pink-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Cumpleaños en {birthdayInfo.daysUntil} días
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        importanceColors[person.importance]
                      }`}
                    >
                      {importanceLabels[person.importance]}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <MessageCircle className="w-4 h-4" />
                      <span>{person.mentionCount} menciones</span>
                    </div>
                  </div>

                  {person.lastMentioned && (
                    <span className="text-xs text-gray-500">
                      Última vez:{" "}
                      {format(new Date(person.lastMentioned), "d MMM", {
                        locale: es,
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
