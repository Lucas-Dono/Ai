"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import Link from "next/link";

export default function CrearGrupoPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "private" as "private" | "invite_only" | "public",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("El nombre del grupo es requerido");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el grupo");
      }

      // Redirect to the new group
      router.push(`/dashboard/grupos/${data.group.id}`);
    } catch (err: any) {
      console.error("Error creating group:", err);
      setError(err.message || "Error al crear el grupo");
      setIsCreating(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard/grupos"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Crear Nuevo Grupo</h1>
          <p className="text-sm text-muted-foreground">
            Crea un espacio para conversar con usuarios e IAs
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-2"
          >
            Nombre del Grupo *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Ej: Amigos Virtuales, Club de Lectura..."
            className="w-full px-4 py-3 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            maxLength={100}
            required
            disabled={isCreating}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {formData.name.length}/100 caracteres
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
          >
            Descripción (opcional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe de qué trata este grupo..."
            className="w-full px-4 py-3 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            rows={4}
            maxLength={500}
            disabled={isCreating}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {formData.description.length}/500 caracteres
          </p>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Visibilidad
          </label>
          <div className="space-y-2">
            {[
              {
                value: "private",
                label: "Privado",
                description: "Solo miembros invitados pueden ver y unirse",
              },
              {
                value: "invite_only",
                label: "Solo por invitación",
                description: "Visible pero requiere invitación para unirse",
              },
              {
                value: "public",
                label: "Público",
                description: "Cualquiera puede ver y unirse",
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.visibility === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                } ${isCreating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={formData.visibility === option.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visibility: e.target.value as any,
                    })
                  }
                  className="mt-1"
                  disabled={isCreating}
                />
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Info box */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Después de crear el grupo podrás:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Invitar usuarios</li>
                <li>Añadir IAs para conversar</li>
                <li>Configurar permisos y roles</li>
                <li>Personalizar la experiencia</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={isCreating || !formData.name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                <span>Crear Grupo</span>
              </>
            )}
          </button>

          <Link
            href="/dashboard/grupos"
            className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
